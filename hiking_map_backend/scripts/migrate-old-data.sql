-- 從舊 Neon branch (hiking_map, ep-red-fog) 搬遷 users / profiles / hikes 到新 schema
-- 透過 dblink 跨資料庫查詢舊資料，一次性腳本，已於 2026-07-20 執行並驗證成功，保留作為紀錄
--
-- 執行方式（密碼透過 -v 傳入，不寫死在檔案裡）：
--   psql "$DATABASE_URL" -v old_db_password="$OLD_DB_PASSWORD" -f scripts/migrate-old-data.sql

CREATE EXTENSION IF NOT EXISTS dblink;

DO $$
DECLARE
  old_conn text := 'host=ep-red-fog-a5f5lwxb-pooler.us-east-2.aws.neon.tech dbname=hiking_map user=hiking_map_owner password=' || :'old_db_password' || ' sslmode=require';
BEGIN

-- 1. users：依 username 對應，若新庫已存在同名帳號則跳過（保留密碼雜湊）
INSERT INTO users (username, password)
SELECT ou.username, ou.password
FROM dblink(old_conn, 'SELECT id, username, password, uuid FROM users')
  AS ou(id int, username varchar, password varchar, uuid uuid)
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.username = ou.username);

-- 2. profiles：依新 users.username 對回新 user_id，若已存在該 user 的 profile 則跳過
INSERT INTO profiles (user_id, avatar, level, description)
SELECT nu.id, op.avatar, op.level, op.description
FROM dblink(old_conn, '
    SELECT p.user_id, p.avatar, p.level, p.description, u.username
    FROM profiles p JOIN users u ON u.id = p.user_id
  ') AS op(user_id int, avatar varchar, level varchar, description varchar, username varchar)
JOIN users nu ON nu.username = op.username
WHERE NOT EXISTS (SELECT 1 FROM profiles pr WHERE pr.user_id = nu.id);

-- 3. hikes + hike_tracks：舊 users_trails (幾何) JOIN users_trails_info (屬性) via uuid
--    owner_uuid -> 舊 users.uuid -> 舊 users.username -> 新 users.id
--    用暫存表帶著舊 uuid 一起存，插入後靠 uuid 精確對應 hike_tracks，最後把暫存欄位丟掉

CREATE TEMP TABLE tmp_old_hikes AS
SELECT *
FROM dblink(old_conn, '
    SELECT t.uuid::text AS old_uuid, t.name, t.geom::text AS geom_wkt, ou.username,
           i.time::date AS hike_date, COALESCE(i.length, 0) AS distance_km,
           COALESCE(i.public, true) AS is_public
    FROM users_trails t
    JOIN users_trails_info i ON i.uuid = t.uuid
    JOIN users ou ON ou.uuid::text = t.owner_uuid
  ') AS oh(
    old_uuid text, name text, geom_wkt text, username varchar,
    hike_date date, distance_km double precision, is_public boolean
  );

ALTER TABLE hikes ADD COLUMN IF NOT EXISTS _migration_uuid text;

INSERT INTO hikes (user_id, name, date, distance_km, is_public, _migration_uuid)
SELECT nu.id, oh.name, oh.hike_date, oh.distance_km, oh.is_public, oh.old_uuid
FROM tmp_old_hikes oh
JOIN users nu ON nu.username = oh.username;

INSERT INTO hike_tracks (hike_id, geom)
SELECT h.id, ST_Multi(oh.geom_wkt::geometry)
FROM hikes h
JOIN tmp_old_hikes oh ON oh.old_uuid = h._migration_uuid;

ALTER TABLE hikes DROP COLUMN _migration_uuid;

END $$;
