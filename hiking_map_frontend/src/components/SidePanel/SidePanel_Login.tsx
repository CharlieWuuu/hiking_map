import styles from './SidePanel_Login.module.scss';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function SidePanel_Login() {
    const { isLoggedIn, user, login, logout } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [onSubmit, setOnSubmit] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async () => {
        setOnSubmit(true);
        setErrorMsg('');

        try {
            const res = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            if (!res.ok || data.statusCode === 401 || !data.token) {
                setErrorMsg('登入失敗，請確認帳號密碼');
                setOnSubmit(false);
                return;
            }

            login(data.token); // 🔥 給 AuthContext 處理 token 儲存與解析
        } catch (err) {
            setErrorMsg('登入過程發生錯誤');
        }

        setOnSubmit(false);
    };

    return (
        <div className={styles.SidePanel_Login}>
            {isLoggedIn ? <div className={styles.avatar}>頭像</div> : <h2>登入</h2>}
            <form onSubmit={(e) => e.preventDefault()}>
                {isLoggedIn ? (
                    <div>
                        <div>
                            <p>{user?.username ?? '未知使用者'}</p>
                            <p>上次登入時間：</p>
                            <button type="button" onClick={logout}>
                                登出
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <fieldset>
                            <label htmlFor="username">使用者名稱：</label>
                            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </fieldset>
                        <fieldset>
                            <label htmlFor="password">密　　　碼：</label>
                            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </fieldset>

                        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

                        <button type="submit" onClick={handleLogin} disabled={onSubmit}>
                            {onSubmit ? '登入中...' : '登入'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
