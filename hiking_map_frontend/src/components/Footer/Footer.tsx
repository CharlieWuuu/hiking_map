import styles from './Footer.module.scss';
import Logo from '../../assets/images/Footer_Logo.svg';

export default function Footer() {
    return (
        <footer className={styles.Footer}>
            <div className={styles.Footer_Content}>
                <div className={styles.Footer_logo}>
                    <img src={Logo} alt="Logo" />
                </div>
                <hr />
                <div className={styles.Footer_links}>
                    <a href="#">關於我們</a>
                    <span>聯絡我們（製作中）</span>
                </div>
            </div>
        </footer>
    );
}
