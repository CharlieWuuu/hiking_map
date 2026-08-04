// 匯入 hiking_map_data/百大步道/*.gpx 到 trails 表，並建立 trail_category_map（百大必訪步道）關聯。
// 這批步道沒有對應的山峰 JSON 清單，不建立 trail_mountains 關聯。
// 一次性腳本，可重複執行（依 slug 判斷是否已存在）。
//
// 執行方式：
//   cd hiking_map_backend
//   npx ts-node -r tsconfig-paths/register scripts/seed-trails-top-100.ts

import 'dotenv/config';
import { DataSource } from 'typeorm';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(__dirname, '../../hiking_map_data');
const GPX_DIR = join(DATA_DIR, '百大步道');
const CATEGORY_NAME = '百大必訪步道';

function stripFilenameNoise(filename: string): string {
  let s = filename.replace(/\.gpx$/i, '');
  s = s.replace(/^\d{4}[.-]\d{2}[.-]\d{2}\s*/, '');
  s = s.replace(/^\d{6,8}[-_]?/, '');
  return s.trim();
}

function slugify(filename: string, usedSlugs: Set<string>): string {
  let base = stripFilenameNoise(filename);
  base = base.replace(/[\\/:*?"<>|]/g, '').trim();

  let slug = base;
  let suffix = 2;
  while (usedSlugs.has(slug)) {
    slug = `${base}-${suffix}`;
    suffix++;
  }
  usedSlugs.add(slug);
  return slug;
}

function haversineKm(coords: [number, number][]): number {
  const R = 6371;
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    const [lon1, lat1] = coords[i - 1];
    const [lon2, lat2] = coords[i];
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  return total;
}

async function parseGpxTrack(filePath: string): Promise<[number, number][] | null> {
  const gpxToGeojson = await import('@tmcw/togeojson');
  const { DOMParser } = await import('@xmldom/xmldom');

  const xmlText = readFileSync(filePath, 'utf-8').replace(/^﻿/, '');
  const dom = new DOMParser().parseFromString(xmlText, 'text/xml');
  const featureCollection = gpxToGeojson.gpx(dom as any);

  const lineStrings = featureCollection.features
    .filter((f: any) => f.geometry?.type === 'LineString' && Array.isArray(f.geometry.coordinates) && f.geometry.coordinates.length >= 2)
    .map((f: any) => f.geometry.coordinates as [number, number][]);

  if (lineStrings.length === 0) return null;
  return lineStrings.sort((a: unknown[], b: unknown[]) => b.length - a.length)[0];
}

async function main() {
  const files = readdirSync(GPX_DIR).filter((f) => f.endsWith('.gpx'));

  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await dataSource.initialize();

  const category = await dataSource.query(`SELECT id FROM categories WHERE name = $1`, [CATEGORY_NAME]);
  if (!category.length) throw new Error(`找不到分類：${CATEGORY_NAME}`);
  const categoryId = category[0].id;

  const existingSlugs = new Set<string>((await dataSource.query(`SELECT slug FROM trails`)).map((r: { slug: string }) => r.slug));

  let imported = 0;
  let skippedNoTrack = 0;
  let skippedExisting = 0;

  try {
    for (const file of files) {
      const slug = slugify(file, existingSlugs);
      const existingBySlug = await dataSource.query(`SELECT id FROM trails WHERE slug = $1`, [slug]);
      if (existingBySlug.length) {
        skippedExisting++;
        continue;
      }

      const coords = await parseGpxTrack(join(GPX_DIR, file));
      if (!coords) {
        skippedNoTrack++;
        continue;
      }

      const distanceKm = haversineKm(coords);
      const trailName = stripFilenameNoise(file);

      const trailResult = await dataSource.query(`INSERT INTO trails (name, slug, distance_km) VALUES ($1, $2, $3) RETURNING id`, [
        trailName,
        slug,
        distanceKm,
      ]);
      const trailId = trailResult[0].id;

      const lineWkt = `LINESTRING(${coords.map(([lon, lat]) => `${lon} ${lat}`).join(',')})`;
      await dataSource.query(`INSERT INTO trail_geometries (trail_id, geom) VALUES ($1, ST_SetSRID(ST_GeomFromText($2), 4326))`, [
        trailId,
        lineWkt,
      ]);

      await dataSource.query(`INSERT INTO trail_category_map (trail_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [
        trailId,
        categoryId,
      ]);

      imported++;
    }
  } finally {
    await dataSource.destroy();
  }

  console.log(`匯入 ${imported} 筆，無可用軌跡跳過 ${skippedNoTrack} 筆，slug 已存在跳過 ${skippedExisting} 筆，共處理 ${files.length} 個檔案`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
