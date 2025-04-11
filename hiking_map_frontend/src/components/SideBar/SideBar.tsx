import styles from './SideBar.module.scss';
import { useAuth } from '../../context/AuthContext';

type Props = {
    changePanelType: (panelType: 'layer' | 'data' | 'login') => void;
    isActive: boolean;
    togglePanel: (isActive: boolean) => void;
};

export default function SideBar({ changePanelType, isActive, togglePanel }: Props) {
    const { isLoggedIn, logout } = useAuth();

    const handleAuthClick = () => {
        if (isLoggedIn) {
            logout();
        } else {
            changePanelType('login');
        }
    };

    return (
        <div className={styles.sideBar}>
            <button style={{ backgroundColor: 'transparent', border: '1px solid black', pointerEvents: 'none' }}>
                登山
                <br />
                筆記
            </button>
            {/* <button className={isActive ? styles.active : ''} onClick={() => togglePanel(!isActive)}>
                ☰
            </button> */}
            <button onClick={() => changePanelType('layer')}>圖層</button>
            <button onClick={() => changePanelType('data')}>資料</button>
            <button onClick={() => changePanelType('login')}>{isLoggedIn ? '帳號' : '登入'}</button>
        </div>
    );
}
