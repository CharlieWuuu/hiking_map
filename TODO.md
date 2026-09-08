# TODO

盤點日期：2026-09-05。來源包含 `/code-review high` 的結果、全專案一致性掃描，以及 git 歷史稽核。

---

## P0 — 安全性

- [ ] **輪替 Neon 資料庫密碼**（Charlie 預計 2026-09-06 自行處理）
  - `neon.sh` 的連線字串（role `hiking_map_owner`）明文寫在根 commit `406902e`（2025-04-07），倉庫是 **public**，已外洩約 17 個月
  - 步驟：Neon Console → Roles → Reset password → 更新 Render 的 `DATABASE_URL` 與本機 `.env`
  - `neon.sh` 已改為讀 `$DATABASE_URL`，不再有明文密碼
  - 換完密碼後查 Neon Monitoring 的連線來源，並核對 `users` / `hikes` 資料有無異常
  - 事後可選：`git filter-repo` 清歷史（換密碼後就不緊急）

- [ ] **掛上全域 ValidationPipe**
  - `main.ts` 沒有 `ValidationPipe`，16 個 DTO 裡只有 `v1/dto/trails_info.dio.ts` 用了 class-validator
  - 也就是**所有 DTO 目前只是型別宣告，執行期擋不住任何東西**
  - `hikes.service.ts` 的 `merge()` 現在自己手寫驗證當權宜之計，掛上 pipe 後應改回裝飾器
  - 注意：現有 DTO 都沒有裝飾器，開 `whitelist: true` 會讓既有端點全部收到空 body，要逐一補完再開

- [ ] **R2 孤兒檔案沒有清除**
  - 每次 trim / merge 都上傳新的 UUID key 並把舊的 `track_url` 設為 NULL，但舊物件仍留在 R2 且可公開存取
  - 不可預測的 key 是私人軌跡唯一的保護，孤兒檔等於永久外流
  - 修法：`UploadsService` 加 delete，寫入新 URL 前刪掉舊的

---

## P1 — GPX 編輯的正確性

- [ ] **`delete_sources` 會弄丟成就統計**
  - 合併只保留第一筆的 `trail_id`，而 `getStats` 用 `COUNT(DISTINCT h.trail_id)` 算百岳
  - 三天縱走三座百岳合併後刪來源，百岳數會從 3 掉到 1
  - 修法擇一：合併後保留來源（改為封存而非刪除）／改成多對多的 `hike_trail_map`／合併時把來源的 category map 複製到新紀錄

- [ ] **`distance_km` 有兩套定義**
  - `create()` 存前端傳來的值；`recalcDistance()` 用 PostGIS 的 2D `ST_Length`
  - 結果是裁掉一個點就可能讓距離明顯跳動，而 `getStats` 會把兩種來源的數字加總
  - 要決定單一真實來源。建議一律用 PostGIS 重算（含 `create()`），並考慮是否納入爬升的 3D 距離

- [ ] **裁切索引沒有跟軌跡版本綁定**
  - `findAll` / `findInView` 給前端的是 `geom_simplified`，但索引是拿完整 `geom` 驗證的
  - 前端若用簡化線的索引送出，會落在合法範圍內、靜靜裁錯位置還回 200
  - 修法：回傳並要求帶上 `point_count` 或軌跡版本號，對不上就回 409

---

## P2 — 一致性

- [ ] **Prettier 設定與實際碼風不符（全專案）**
  - 後端 `.prettierrc` 沒有 `printWidth`，等於用預設的 80；但程式碼是照 ~120 寫的
  - 結果：`npx eslint src` 有 **58 個檔案、456 個錯誤**，幾乎全是 prettier
  - 前端 `.prettierrc.json` 用的是 `printWidth: 160`
  - 修法：後端補上 `"printWidth": 120`（或與前端統一），再跑一次 `npm run lint`
  - ⚠️ 這會產生一筆大 diff，建議獨立成一個 commit

- [ ] **`geo-convert.utils.ts` 與 `v1/utils/covert.utils.ts` 內容完全相同**
  - 兩檔 3664 bytes 一字不差，是複製貼上
  - 順帶：`covert` 是 `convert` 的拼字錯誤
  - 修法：v1 改為 import `common/utils/geo-convert.utils.ts`，刪掉重複檔

- [ ] **`console.*` 與 `Logger` 混用**
  - `v1/trails/trails.controller.ts`（2 處）、兩個 geo-convert（各 1 處）仍用 `console`
  - `scripts/` 底下的 console 是合理的（一次性 CLI），可保留

- [ ] **query 參數命名混用 camelCase 與 snake_case**
  - `hikes.controller.ts` 用 `userId` / `includeGeojson`
  - `v1/trails/trails.controller.ts` 用 `owner_uuid`
  - 同一個檔案裡甚至混用參數名 `ownerUuid` 與 `owner_uuid`
  - v1 是相容層不該動；新 API 應統一（建議 camelCase for query、snake_case for body，並寫進 CLAUDE.md）

- [ ] **`ForbiddenException` 用在非權限情境**
  - `hikes.service.ts:96` 的「geojson 中沒有可用的軌跡」是輸入錯誤，應為 `BadRequestException`（403 → 400）

- [ ] **註解語言混用**：中文 170 行 vs 英文 29 行。建議統一為中文並寫進 CLAUDE.md

---

## P3 — 測試與基礎建設

- [ ] **`test:e2e` 是壞的**：script 指向 `./test/jest-e2e.json`，但 `test/` 目錄不存在
- [ ] **`hikes.service` 沒有測試**：純函式 `track-edit.utils` 已有 16 個測試，但 service 層（權限、交易、合併順序）還沒有
- [ ] **`auth` 模組沒有測試**：JWT、Google OAuth、忘記密碼流程全無覆蓋
- [ ] **沒有 CI 跑測試**：5 個 workflow 都在管版號與分支流程，沒有一個跑 `npm test`
- [ ] **冷啟動**：Render 免費方案閒置 15 分鐘休眠、喚醒 30–60 秒；Neon 另有 scale-to-zero
  - 修法：加 `GET /health`（含輕量 DB 查詢）+ GitHub Actions 排程每 10 分鐘 ping，一次解決兩段
  - 注意 Render 免費方案每月 750 instance hours 的額度

---

## P4 — 功能

- [ ] **GPX 編輯的前端 UI**：後端 API（`POST /hikes/merge`、`PATCH /hikes/:id/track/trim`）已完成，前端尚未接
- [ ] **刪除單一 segment**：`track-edit.utils.ts` 的結構已經支援，補一個 `dropSegment` 即可
- [ ] **`any` 使用 30 處**：主要在 `@Req() req: any`，可改為具型別的 request
