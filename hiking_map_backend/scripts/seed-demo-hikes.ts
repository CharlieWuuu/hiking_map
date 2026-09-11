// 隨機挑 hiking_map_data 底下的 GPX，灌進 demo 帳號當作 2022 年至今的健行紀錄，方便展示用。
// 一次性腳本，透過本機 API（連正式資料庫）建立，日期為隨機捏造。
//
// 執行方式：
//   cd hiking_map_backend
//   npx ts-node -r tsconfig-paths/register scripts/seed-demo-hikes.ts

import 'dotenv/config';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(__dirname, '../../hiking_map_data');
const CATEGORY_DIRS = ['百岳', '小百岳', '百大步道'];
const API_BASE = 'http://localhost:3001';
const DEMO_USERNAME = 'demo';
const DEMO_PASSWORD = 'demo1234';
const TARGET_COUNT = 6;
const START_DATE = new Date('2022-01-01T00:00:00Z');
const END_DATE = new Date();

function stripFilenameNoise(filename: string): string {
  let s = filename.replace(/\.gpx$/i, '');
  s = s.replace(/^\d{4}[.-]\d{2}[.-]\d{2}\s*/, '');
  s = s.replace(/^\d{6,8}[-_]?/, '');
  return s.trim();
}

async function parseGpxToFeatureCollection(filePath: string) {
  const gpxToGeojson = await import('@tmcw/togeojson');
  const { DOMParser } = await import('@xmldom/xmldom');

  const xmlText = readFileSync(filePath, 'utf-8').replace(/^﻿/, '');
  const dom = new DOMParser().parseFromString(xmlText, 'text/xml');
  const featureCollection = gpxToGeojson.gpx(dom as any);

  const lineStrings = featureCollection.features.filter(
    (f: any) => f.geometry?.type === 'LineString' && Array.isArray(f.geometry.coordinates) && f.geometry.coordinates.length >= 2,
  );

  if (lineStrings.length === 0) return null;
  const best = lineStrings.sort((a: any, b: any) => b.geometry.coordinates.length - a.geometry.coordinates.length)[0];
  // hike_tracks.geom 欄位是 2D，帶高程的 Z 座標會讓 ST_GeomFromGeoJSON 報錯，這裡先丟掉
  const coords2d = (best.geometry as any).coordinates.map(([lon, lat]: number[]) => [lon, lat]);
  return { type: 'FeatureCollection', features: [{ ...best, geometry: { ...best.geometry, coordinates: coords2d } }] };
}

function randomDate(): string {
  const t = START_DATE.getTime() + Math.random() * (END_DATE.getTime() - START_DATE.getTime());
  return new Date(t).toISOString().slice(0, 10);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function main() {
  const allFiles: string[] = [];
  for (const dir of CATEGORY_DIRS) {
    const dirPath = join(DATA_DIR, dir);
    for (const f of readdirSync(dirPath).filter((f) => f.endsWith('.gpx'))) {
      allFiles.push(join(dirPath, f));
    }
  }

  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: DEMO_USERNAME, password: DEMO_PASSWORD }),
  });
  if (!loginRes.ok) throw new Error(`登入失敗: ${await loginRes.text()}`);
  const { token } = await loginRes.json();

  const meRes = await fetch(`${API_BASE}/hikes?userId=7`, { headers: { Authorization: `Bearer ${token}` } });
  const existing: { name: string }[] = meRes.ok ? await meRes.json() : [];
  const existingNames = new Set(existing.map((h) => h.name));

  const candidates = allFiles.filter((f) => !existingNames.has(stripFilenameNoise(f.split('/').pop()!)));
  const picked = shuffle(candidates).slice(0, TARGET_COUNT);

  let created = 0;
  let skippedNoTrack = 0;
  let failed = 0;

  for (const filePath of picked) {
    const filename = filePath.split('/').pop()!;
    try {
      const geojson = await parseGpxToFeatureCollection(filePath);
      if (!geojson) {
        skippedNoTrack++;
        continue;
      }

      const res = await fetch(`${API_BASE}/hikes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: stripFilenameNoise(filename),
          date: randomDate(),
          is_public: true,
          geojson,
        }),
      });

      if (!res.ok) {
        failed++;
        console.error(`失敗 ${filename}: ${res.status} ${await res.text()}`);
        continue;
      }

      created++;
    } catch (err) {
      failed++;
      console.error(`例外 ${filename}:`, err);
    }
  }

  console.log(`建立 ${created} 筆，無可用軌跡跳過 ${skippedNoTrack} 筆，失敗 ${failed} 筆，共嘗試 ${picked.length} 個檔案`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
