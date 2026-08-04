// 匯入 hiking_map_data/台灣百岳.json、台灣小百岳.json 到 mountains 表，並建立與 categories 的關聯
// 一次性腳本，可重複執行（依 name+lat+lon 判斷是否已存在）
//
// 執行方式：
//   cd hiking_map_backend
//   npx ts-node -r tsconfig-paths/register scripts/seed-mountains.ts

import 'dotenv/config';
import { DataSource } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';

type RawMountain = {
  id: string;
  title: string;
  lat: string;
  lon: string;
  height: string;
  county: string;
  mountain_sys: string;
};

const DATA_DIR = join(__dirname, '../../hiking_map_data');

function parseHeight(height: string): number {
  return Number(height.replace(/[^\d]/g, ''));
}

// "南投縣信義鄉,嘉義縣阿里山鄉," -> "南投縣"（取第一個縣市，去掉鄉鎮區後綴）
function parseCounty(county: string): string | null {
  const first = county.split(',')[0]?.trim();
  if (!first) return null;
  const match = first.match(/^(.+?[縣市])/);
  return match ? match[1] : first;
}

async function seedCategory(dataSource: DataSource, filename: string, categoryName: string) {
  const raw: RawMountain[] = JSON.parse(readFileSync(join(DATA_DIR, filename), 'utf-8'));

  const category = await dataSource.query(`SELECT id FROM categories WHERE name = $1`, [categoryName]);
  if (!category.length) throw new Error(`找不到分類：${categoryName}`);
  const categoryId = category[0].id;

  const usedNames = new Set<string>();
  let inserted = 0;
  let skipped = 0;

  for (const m of raw) {
    const lat = Number(m.lat);
    const lon = Number(m.lon);
    if (!m.title || !lat || !lon || !m.height) {
      console.warn(`跳過缺少必要欄位的項目：${m.title ?? m.id}`);
      skipped++;
      continue;
    }

    // 同名山峰（例如「觀音山」在北部與南部各有一座）加上縣市後綴避免撞名
    let name = m.title;
    const county = parseCounty(m.county);
    if (usedNames.has(name)) {
      name = county ? `${m.title}（${county}）` : `${m.title}（${m.id}）`;
    }
    usedNames.add(m.title);

    const existing = await dataSource.query(`SELECT id FROM mountains WHERE name = $1`, [name]);

    let mountainId: number;
    if (existing.length) {
      mountainId = existing[0].id;
    } else {
      const result = await dataSource.query(
        `INSERT INTO mountains (name, elevation_m, location, range, county)
         VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6)
         RETURNING id`,
        [name, parseHeight(m.height), lon, lat, m.mountain_sys || null, county],
      );
      mountainId = result[0].id;
      inserted++;
    }

    await dataSource.query(
      `INSERT INTO mountain_category_map (mountain_id, category_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [mountainId, categoryId],
    );
  }

  console.log(`${categoryName}：新增 ${inserted} 筆，跳過 ${skipped} 筆，共處理 ${raw.length} 筆`);
}

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await dataSource.initialize();

  try {
    await seedCategory(dataSource, '台灣百岳.json', '百岳');
    await seedCategory(dataSource, '台灣小百岳.json', '小百岳');
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
