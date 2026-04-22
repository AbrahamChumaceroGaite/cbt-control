import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService }                    from '@nestjs/config'
import * as Minio                           from 'minio'

@Injectable()
export class StorageService implements OnModuleInit {
  /** Reaches MinIO over the internal Docker network — used for bucket ops. */
  private readonly client:       Minio.Client
  /**
   * Uses MINIO_PUBLIC_URL as endpoint so presigned PUT URLs contain a hostname
   * the browser can actually reach (not the internal `minio:9000` alias).
   * Signature V4 signs the Host header, so the client used for presigning MUST
   * share the same hostname the browser will use when uploading.
   */
  private readonly presignClient: Minio.Client
  private readonly bucket:    string
  private readonly publicUrl: string
  private readonly logger = new Logger(StorageService.name)

  constructor(private readonly config: ConfigService) {
    const endpoint  = config.get<string>('MINIO_ENDPOINT', 'localhost')
    const port      = parseInt(config.get<string>('MINIO_PORT', '9000'))
    const useSSL    = config.get<string>('MINIO_USE_SSL', 'false') === 'true'
    const accessKey = config.get<string>('MINIO_ACCESS_KEY', 'minioadmin')
    const secretKey = config.get<string>('MINIO_SECRET_KEY', 'minioadmin')

    // Internal client — for bucket existence checks, policy writes, deletes
    this.client = new Minio.Client({ endPoint: endpoint, port, useSSL, accessKey, secretKey })

    // Presign client — endpoint is what the browser calls, not the Docker alias
    this.publicUrl = config.get<string>('MINIO_PUBLIC_URL', `http://${endpoint}:${port}`)
    const pub      = new URL(this.publicUrl)
    const pubPort  = pub.port ? parseInt(pub.port) : (pub.protocol === 'https:' ? 443 : 80)
    this.presignClient = new Minio.Client({
      endPoint:  pub.hostname,
      port:      pubPort,
      useSSL:    pub.protocol === 'https:',
      accessKey,
      secretKey,
    })

    this.bucket = config.get<string>('MINIO_BUCKET', 'cbt-games')
  }

  async onModuleInit(): Promise<void> {
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
    } catch (err) {
      // Log but don't crash — dev environments may run without MinIO
      this.logger.warn(`MinIO init skipped: ${(err as Error).message}`)
    }
  }

  /**
   * Returns a presigned PUT URL valid for 15 minutes.
   * URL hostname matches MINIO_PUBLIC_URL so the browser can reach it directly.
   */
  async presignedUploadUrl(objectName: string): Promise<string> {
    return this.presignClient.presignedPutObject(this.bucket, objectName, 900)
  }

  /** Public HTTP URL for the browser to fetch the file from MinIO. */
  publicFileUrl(objectName: string): string {
    return `${this.publicUrl}/${this.bucket}/${objectName}`
  }

  async deleteObject(objectName: string): Promise<void> {
    await this.client.removeObject(this.bucket, objectName)
  }
}
