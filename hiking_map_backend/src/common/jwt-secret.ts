// JWT 密鑰的唯一來源。
//
// 這裡刻意不提供預設值：原本七處都寫成 `process.env.JWT_SECRET || 'your-secret-key'`，
// 一旦正式環境漏設 JWT_SECRET，服務會照常啟動並用這個公開在 repo 裡的字串簽 token，
// 等於任何人都能自己簽一張冒充任意使用者的通行證，而且完全沒有徵兆。
// 寧可啟動就失敗，也不要安靜地跑在不安全的狀態。
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('缺少環境變數 JWT_SECRET，請在 .env（或部署平台的環境變數）設定一組夠長的隨機字串');
  }
  return secret;
}
