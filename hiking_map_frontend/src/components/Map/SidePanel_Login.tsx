export default function SidePanel_Login() {
    return (
        <div>
            <h2>登入</h2>
            <form>
                <label htmlFor="username">使用者名稱:</label>
                <input type="text" id="username" name="username" required />
                <br />
                <label htmlFor="password">密碼:</label>
                <input type="password" id="password" name="password" required />
                <br />
                <button type="submit">登入</button>
                <button type="button" onClick={() => alert('註冊功能尚未實作')}>
                    註冊
                </button>
                <button type="button" onClick={() => alert('忘記密碼功能尚未實作')}>
                    忘記密碼
                </button>
            </form>
            <p>使用者名稱和密碼是必填的。</p>
            <p>請確保您已經註冊並擁有有效的帳戶。</p>
            <p>如有任何問題，請聯繫我們的客服。</p>
            <p>客服電話：123-456-7890</p>
        </div>
    );
}
