# 健行軌跡專案
https://hiking-map.vercel.app/

## 快速啟動
```bash
# 一鍵啟動整個專案
docker-compose up --build

# 訪問網址
- 前端: http://localhost:5173
- 後端: http://localhost:3000
```

## 架構概覽
- 前端: React + TypeScript + Vite
- 後端: NestJS + TypeScript
- 資料庫: PostgreSQL
- 部署: Vercel (前端) + Render (後端)

## 常見問題
### Q: Docker 啟動失敗
A: 檢查 Docker Desktop 是否啟動

### Q: 前端抓不到後端
A: 檢查 .env 中的 VITE_API_URL 設定

## 開發筆記
- 2024/11: 從 Mac 遷移到 Windows，改用 Docker 開發
- 2024/4-6: 初版開發完成