// styles
import styles from '../styles/pages/Login.module.scss';

// react
import { useState } from 'react';

// context
import { useAuth } from '../context/AuthContext';

// image
import AvatarUrl from '../assets/images/Panel_Avatar.svg';

export default function Login() {
    const { isLoggedIn, user, login, logout } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [onSubmit, setOnSubmit] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async () => {
        setOnSubmit(true);
        setErrorMsg('');

        try {
            const baseURL = import.meta.env.VITE_API_URL;
            const res = await fetch(`${baseURL}/auth/login`, {
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
        <div className={styles.Login}>
            <div className={styles.Login_Container}>
                <h2>{isLoggedIn ? '帳號' : '登入'}</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                    {isLoggedIn ? (
                        <div>
                            <div className={styles.avatar}>
                                <img src={AvatarUrl} alt="avatar" />
                                <p>{user?.username ?? '未知使用者'}</p>
                            </div>
                            {/* <div className={styles.lastLogin}>
                                <p>上次登入</p>
                                <p>2025/04/20 20:20</p>
                            </div> */}
                            <button type="button" onClick={logout}>
                                登出
                            </button>
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
        </div>
    );
}
