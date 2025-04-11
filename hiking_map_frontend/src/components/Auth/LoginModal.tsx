import { jwtDecode } from 'jwt-decode';

type JwtPayload = {
    sub: string; // 通常是 userId
    username?: string;
    exp: number; // 到期時間（秒）
    iat?: number;
};

async function handleLogin(username: string, password: string) {
    try {
        const res = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        const token = data.access_token;

        // 1️⃣ 儲存
        localStorage.setItem('auth_token', token);

        // 2️⃣ 解碼
        const decoded = jwtDecode<JwtPayload>(token);
        console.log('Token payload:', decoded);

        // 3️⃣ 確認是否過期
        const now = Date.now() / 1000;
        if (decoded.exp < now) {
            console.warn('Token 已過期');
            localStorage.removeItem('auth_token');
            return;
        }

        console.log('登入成功，使用者 ID:', decoded.sub);
    } catch (err) {
        console.error('登入失敗', err);
    }
}
