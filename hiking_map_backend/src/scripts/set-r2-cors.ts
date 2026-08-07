import * as dotenv from 'dotenv';
dotenv.config();

import { PutBucketCorsCommand, GetBucketCorsCommand, S3Client } from '@aws-sdk/client-s3';

// 一次性腳本：讓前端可以用 fetch 抓 R2 上的完整軌跡。
//
// 圖片是用 <img> 載的，不受 CORS 管；軌跡是 fetch 抓的，沒有這條規則會被瀏覽器擋掉。
//
//   npx ts-node src/scripts/set-r2-cors.ts
const ALLOWED_ORIGINS = [
  'http://localhost:4219',
  'http://localhost:3000',
  'https://hiking-map.vercel.app',
  'https://hiking-map-git-main-charliewuuus-projects.vercel.app',
];

async function main() {
  const client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  await client.send(
    new PutBucketCorsCommand({
      Bucket: process.env.R2_BUCKET!,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: ALLOWED_ORIGINS,
            AllowedMethods: ['GET', 'HEAD'],
            AllowedHeaders: ['*'],
            // 物件是 immutable 的，預檢結果可以放心快取一天
            MaxAgeSeconds: 86400,
          },
        ],
      },
    }),
  );

  const current = await client.send(new GetBucketCorsCommand({ Bucket: process.env.R2_BUCKET! }));
  console.log('目前的 CORS 設定：', JSON.stringify(current.CORSRules, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
