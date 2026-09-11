// 目前 demo 帳號的紀錄日期是均勻隨機，星期分布太平均不像真實登山習慣（通常集中在週末）。
// 這裡重新抽一批日期，權重大幅偏向六、日，週二三四權重壓低，範圍維持 2022-01-01 到今天。
// 一次性腳本，直接對正式資料庫執行。
//
// 執行方式：
//   cd hiking_map_backend
//   npx ts-node -r tsconfig-paths/register scripts/rebias-demo-weekdays.ts

import 'dotenv/config';
import { DataSource } from 'typeorm';

const DEMO_USER_ID = 7;
const START_DATE = new Date('2022-01-01T00:00:00Z');
const END_DATE = new Date();

// getDay(): 0=日 1=一 2=二 3=三 4=四 5=五 6=六
const WEEKDAY_WEIGHT = [8, 1, 0.5, 0.5, 0.5, 2, 8];

function pickWeightedDate(): Date {
  const totalWeight = WEEKDAY_WEIGHT.reduce((a, b) => a + b, 0);
  // 用 rejection sampling：隨機挑一天，依當天星期的權重決定要不要接受，重抽到接受為止
  for (let attempt = 0; attempt < 200; attempt++) {
    const t = START_DATE.getTime() + Math.random() * (END_DATE.getTime() - START_DATE.getTime());
    const date = new Date(t);
    const weight = WEEKDAY_WEIGHT[date.getUTCDay()];
    if (Math.random() * Math.max(...WEEKDAY_WEIGHT) <= weight) return date;
  }
  return new Date(START_DATE.getTime() + Math.random() * (END_DATE.getTime() - START_DATE.getTime()));
}

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await dataSource.initialize();

  try {
    const hikes: { id: number }[] = await dataSource.query(`SELECT id FROM hikes WHERE user_id = $1`, [DEMO_USER_ID]);

    for (const hike of hikes) {
      const newDate = pickWeightedDate().toISOString().slice(0, 10);
      await dataSource.query(`UPDATE hikes SET date = $1 WHERE id = $2`, [newDate, hike.id]);
    }

    console.log(`重新分配日期：${hikes.length} 筆`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
