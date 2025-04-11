import styles from './SidePanel_Login.module.scss';
import { useState } from 'react';

type Props = {
    loginStatus: boolean;
    setLoginStatus: (loginStatus: boolean) => void;
};

export default function SidePanel_Login({ loginStatus, setLoginStatus }: Props) {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [onSubmit, setOnSubmit] = useState<boolean>(false);

    const login = () => {
        setOnSubmit(true);
        fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        })
            .then((res) => res.json())
            .then((data: any) => {
                if (data.statusCode !== 401) {
                    setOnSubmit(false);
                    setLoginStatus(true);
                    localStorage.setItem('token', data.token); // 或用 sessionStorage 看你需求
                }
            });
    };

    return (
        <div className={styles.SidePanel_Login}>
            <h2>登入</h2>
            <form>
                {loginStatus ? (
                    <div>
                        <p>歡迎回來：{username}</p>
                    </div>
                ) : (
                    <div>
                        {' '}
                        <fieldset>
                            <label htmlFor="username">使用者名稱：</label>
                            <input type="text" id="username" name="username" onInput={(e) => setUsername((e.target as HTMLInputElement).value)} required />
                        </fieldset>
                        <fieldset>
                            <label htmlFor="password">密　　　碼：</label>
                            <input type="password" id="password" name="password" onInput={(e) => setPassword((e.target as HTMLInputElement).value)} required />
                        </fieldset>
                    </div>
                )}

                <button onClick={login} type="button" disabled={onSubmit}>
                    {onSubmit ? '登入中...' : loginStatus ? '登出' : '登入'}
                </button>
            </form>
        </div>
    );
}
