import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService }                    from '@nestjs/config'
import * as Minio                           from 'minio'

@Injectable()
export class StorageService implements OnModuleInit {
  /** Reaches MinIO over the internal Docker network — used for bucket ops. */
  private client:       Minio.Client | null = null
  /**
   * Uses MINIO_PUBLIC_URL as endpoint so presigned PUT URLs contain a hostname
   * the browser can actually reach (not the internal `minio:9000` alias).
   * Signature V4 signs the Host header, so the client used for presigning MUST
   * share the same hostname the browser will use when uploading.
   */
  private presignClient: Minio.Client | null = null
  private bucket:    string = 'cbt-games'
  private publicUrl: string = ''
  /** False when MINIO_ENDPOINT is not configured — upload endpoints return 503. */
  private enabled = false

  private readonly logger = new Logger(StorageService.name)

  constructor(private readonly config: ConfigService) {
    const endpoint = (config.get<string>('MINIO_ENDPOINT') ?? '').trim()

    if (!endpoint) {
      this.logger.warn('MINIO_ENDPOINT not set — file storage disabled')
      return
    }

    try {
      const port      = parseInt(config.get<string>('MINIO_PORT', '9000'), 10)
      const useSSL    = config.get<string>('MINIO_USE_SSL', 'false') === 'true'
      const accessKey = config.get<string>('MINIO_ACCESS_KEY', 'minioadmin')
      const secretKey = config.get<string>('MINIO_SECRET_KEY', 'minioadmin')

      // Internal client — for bucket existence checks, policy writes, deletes
      this.client = new Minio.Client({ endPoint: endpoint, port, useSSL, accessKey, secretKey })

      // Presign client — endpoint is what the browser calls, not the Docker alias
      this.publicUrl = config.get<string>('MINIO_PUBLIC_URL', `http://${endpoint}:${port}`)
      const pub      = new URL(this.publicUrl)
      const pubPort  = pub.port ? parseInt(pub.port, 10) : (pub.protocol === 'https:' ? 443 : 80)
      this.presignClient = new Minio.Client({
        endPoint:  pub.hostname,
        port:      pubPort,
        useSSL:    pub.protocol === 'https:',
        accessKey,
        secretKey,
      })

      this.bucket  = config.get<string>('MINIO_BUCKET', 'cbt-games')
      this.enabled = true
    } catch (err) {
      this.logger.warn(`MinIO client init failed: ${(err as Error).message} — storage disabled`)
    }
  }

  async onModuleInit(): Promise<void> {
    if (!this.enabled || !this.client) return

    try {
      const exists = await this.client.bucketExists(this.bucket)
      if (!exists) {
        await this.client.makeBucket(this.bucket)
        this.logger.log(`Bucket '${this.bucket}' created`)
      }
      // Public read policy — browser can download game files without auth
      const policy = JSON.stringify({
        Version:   '2012-10-17',
        Statement: [{
          Effect:    'Allow',
          Principal: { AWS: ['*'] },
          Action:    ['s3:GetObject'],
          Resource:  [`arn:aws:s3:::${this.bucket}/*`],
        }],
      })
      await this.client.setBucketPolicy(this.bucket, policy)
      this.logger.log('MinIO ready')
    } catch (err) {
      // Log but don't crash — MinIO may not be reachable yet
      this.logger.warn(`MinIO init skipped: ${(err as Error).message}`)
    }
  }

  isEnabled(): boolean { return this.enabled }

  /**
   * Returns a presigned PUT URL valid for 15 minutes.
   * URL hostname matches MINIO_PUBLIC_URL so the browser can reach it directly.
   */
  async presignedUploadUrl(objectName: string): Promise<string> {
    if (!this.enabled || !this.presignClient) {
      throw new Error('File storage is not configured on this server')
    }
    return this.presignClient.presignedPutObject(this.bucket, objectName, 900)
  }

  /** Public HTTP URL for the browser to fetch the file from MinIO. */
  publicFileUrl(objectName: string): string {
    if (!this.enabled) {
      throw new Error('File storage is not configured on this server')
    }
    return `${this.publicUrl}/${this.bucket}/${objectName}`
  }

  async deleteObject(objectName: string): Promise<void> {
    if (!this.enabled || !this.client) return
    await this.client.removeObject(this.bucket, objectName)
  }
}
