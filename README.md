# 健行軌跡專案

https://hiking-map.vercel.app/

保存自己的健行紀錄，並用地圖與圖表呈現累積成果的個人工具。

## 開發

```bash
# 前端 http://localhost:4219
cd hiking_map_frontend_next && pnpm dev

# 後端 http://localhost:3001（Swagger: /api-docs）
cd hiking_map_backend && npm run start:dev
```

## 架構概覽

- 前端：Next.js + TypeScript + Tailwind
- 後端：NestJS + TypeScript
- 資料庫：PostgreSQL + PostGIS
- 部署：Vercel（前端）+ Render（後端）+ Neon（資料庫）

前端的 API client 由後端 Swagger 自動生成，後端改完端點後執行：

```bash
cd hiking_map_frontend_next && pnpm generate:api
```

## 目錄

| 目錄 | 說明 |
| --- | --- |
| `hiking_map_frontend_next/` | 前端，單一 Next.js 專案 |
| `hiking_map_backend/` | 後端 API |
| `hiking_map_data/` | 資料處理腳本與原始資料 |
| `hiking_map_frontend/` | 舊版前端（Vite），已停用 |
