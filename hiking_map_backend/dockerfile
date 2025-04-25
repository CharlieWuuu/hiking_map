# Dockerfile

# 1. 使用 Node 環境
FROM node:18-alpine

# 2. 建立 app 目錄
WORKDIR /app

# 3. 複製 package 資料並安裝依賴
COPY package*.json ./
RUN npm install

# 4. 複製所有程式碼
COPY . .

# 5. 編譯 Nest 專案
RUN npm run build

# 6. 設定啟動指令
CMD ["node", "dist/main"]

# 7. 預設對外開啟的 port
ENV PORT=3000
EXPOSE 3000
