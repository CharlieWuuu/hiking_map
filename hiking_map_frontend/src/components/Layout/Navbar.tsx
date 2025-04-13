import styles from './Navbar.module.scss';
import LogoUrl from '../../assets/Navbar_Logo.svg';

export default function Navbar() {
    return (
        <div className={styles.Navbar}>
            <div className={styles.Logo}>
                <img src={LogoUrl} alt="LOGO" />
            </div>
            <div className={styles.SearchBar}>搜尋欄</div>
            <div className={styles.RightButton}>全螢幕 關於 登入</div>
        </div>
    );
}
