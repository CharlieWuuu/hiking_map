import styles from './Navbar.module.scss';

export default function Navbar() {
    return (
        <div className={styles.Navbar}>
            <button>☰</button>
            <div>登山筆記</div>
            <div></div>
        </div>
    );
}
