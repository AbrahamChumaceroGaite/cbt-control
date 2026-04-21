import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService }                    from '@nestjs/config'
import * as Minio                           from 'minio'

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly client:    Minio.Client
  private readonly bucket:    string
  private readonly publicUrl: string
  private readonly logger = new Logger(StorageService.name)

  constructor(private readonly config: ConfigService) {
    this.client = new Minio.Client({
      endPoint:  config.get<string>('MINIO_ENDPOINT', 'localhost'),
      port:      parseInt(config.get<string>('MINIO_PORT', '9000')),
      useSSL:    config.get<string>('MINIO_USE_SSL', 'false') === 'true',
      accessKey: config.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: config.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
    })
    this.bucket    = config.get<string>('MINIO_BUCKET', 'cbt-games')
    this.publicUrl = config.get<string>('MINIO_PUBLIC_URL', 'http://localhost:9000')
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
   * The browser uploads the file directly to MinIO using this URL.
   */
  async presignedUploadUrl(objectName: string): Promise<string> {
    return this.client.presignedPutObject(this.bucket, objectName, 900)
  }

  /** Public HTTP URL for the browser to fetch the file from MinIO. */
  publicFileUrl(objectName: string): string {
    return `${this.publicUrl}/${this.bucket}/${objectName}`
  }

  async deleteObject(objectName: string): Promise<void> {
    await this.client.removeObject(this.bucket, objectName)
  }
}
