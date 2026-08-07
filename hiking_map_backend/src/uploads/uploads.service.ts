import { BadRequestException, Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

@Injectable()
export class UploadsService {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    this.bucket = process.env.R2_BUCKET!;
    this.publicUrl = process.env.R2_PUBLIC_URL!;
    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('僅支援 JPEG、PNG、WebP 格式的圖片');
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('圖片大小不可超過 10MB');
    }

    const extension = file.mimetype.split('/')[1];
    const key = `${folder}/${randomUUID()}.${extension}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `${this.publicUrl}/${key}`;
  }

  // 上傳一份不會再變動的 JSON（目前用於完整軌跡）。
  //
  // key 帶隨機 uuid，內容有變就換一個 key，所以可以放心宣告 immutable ——
  // 瀏覽器會存進磁碟快取，之後同一條軌跡再也不會碰到網路。
  // 這也順便處理了權限：R2 的公開網址沒有驗證，不可預測的 key 是私人紀錄唯一的保護。
  async uploadImmutableJson(data: unknown, folder: string): Promise<string> {
    const key = `${folder}/${randomUUID()}.json`;
    const body = await gzipAsync(Buffer.from(JSON.stringify(data), 'utf8'));

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: 'application/json',
        // 瀏覽器看到這個標頭會自動解壓，fetch 端不需要做任何事
        ContentEncoding: 'gzip',
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    return `${this.publicUrl}/${key}`;
  }
}
