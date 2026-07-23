-- 一次性資料遷移，已於 2026-07-22 執行完成，勿重跑（會造成重複資料）。
-- 目的：把舊 schema（users_trails / users_trails_info）裡屬於 Charlie
-- （owner_uuid = 1f8c9a7e-4b6e-4f8c-b24c-bcc7e537b91c，對應新架構 users.id = 1）
-- 的 159 筆健行紀錄搬到新架構的 hikes / hike_tracks，並為其中 3 筆有真實
-- 百岳/小百岳/百大必訪代碼的紀錄建立對應的官方 trails 並掛上分類。
BEGIN;

-- 1. 建立 3 條先前不存在的官方步道（有真實分類代碼才需要）
INSERT INTO trails (name, slug, county, town)
VALUES
  ('合歡山主峰', 'hehuanshan-main-peak', '南投縣', '仁愛鄉'),
  ('觀音山', 'guanyinshan', '新北市', '五股區'),
  ('松羅步道', 'songluo-trail', '宜蘭縣', '大同鄉')
ON CONFLICT (slug) DO NOTHING;

-- 2. 掛上分類（百岳=1, 小百岳=2, 百大必訪步道=3）
INSERT INTO trail_category_map (trail_id, category_id)
SELECT id, 1 FROM trails WHERE slug = 'hehuanshan-main-peak'
UNION ALL
SELECT id, 2 FROM trails WHERE slug = 'guanyinshan'
UNION ALL
SELECT id, 3 FROM trails WHERE slug = 'songluo-trail'
ON CONFLICT DO NOTHING;

-- 3. 用臨時表橋接 uuid -> 新 hike id，避免用 name+date 對應（兩張舊表的 name 欄位不同步，會漏筆）
CREATE TEMP TABLE hike_uuid_map (uuid uuid PRIMARY KEY, hike_id integer);

INSERT INTO hikes (user_id, trail_id, name, county, town, date, distance_km, is_public, note, urls, created_at)
SELECT
  1,
  CASE
    WHEN i.hundred_trail_id = 'HT01' THEN (SELECT id FROM trails WHERE slug = 'songluo-trail')
    WHEN i.small_hundred_id = 'SH01' THEN (SELECT id FROM trails WHERE slug = 'guanyinshan')
    WHEN i.hundred_id = 'H01' THEN (SELECT id FROM trails WHERE slug = 'hehuanshan-main-peak')
    ELSE NULL
  END,
  i.name,
  i.county,
  i.town,
  i.time::date,
  t.length,
  COALESCE(i.public, true),
  NULLIF(i.note, ''),
  CASE WHEN i.url IS NOT NULL AND i.url != '' THEN ARRAY[i.url] ELSE '{}' END,
  i.time
FROM users_trails t
JOIN users_trails_info i ON i.uuid = t.uuid
WHERE t.owner_uuid = '1f8c9a7e-4b6e-4f8c-b24c-bcc7e537b91c';

-- 用 name/date/distance_km 三者組合反查剛插入的 id 寫進臨時表（在單一 transaction 內，資料尚未被其他人動過，足夠唯一）
INSERT INTO hike_uuid_map (uuid, hike_id)
SELECT i.uuid, h.id
FROM hikes h
JOIN users_trails_info i ON i.name = h.name AND i.time::date = h.date
JOIN users_trails t ON t.uuid = i.uuid AND t.length = h.distance_km
WHERE h.user_id = 1 AND t.owner_uuid = '1f8c9a7e-4b6e-4f8c-b24c-bcc7e537b91c';

-- 4. 遷移軌跡幾何資料
INSERT INTO hike_tracks (hike_id, geom)
SELECT m.hike_id, ST_Multi(t.geom)
FROM hike_uuid_map m
JOIN users_trails t ON t.uuid = m.uuid;

COMMIT;
