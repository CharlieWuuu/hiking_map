import { cookies } from 'next/headers';

import { apiClient } from './apiClient';

// server component 用：取得目前請求的登入者（沒登入或 token 失效則回傳 null）。
// 用於判斷 isOwner 之類的顯示邏輯，不做強制導轉——頁面本身通常是公開的。
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  if (!authToken) return null;

  try {
    return await apiClient.profile.getMe({ headers: { Cookie: `auth_token=${authToken}` } });
  } catch {
    return null;
  }
}
