import styles from './SideBar.module.scss';

type Props = {
    changePanelType: (panelType: 'layer' | 'data' | 'login') => void;
    isActive: boolean;
    togglePanel: (isActive: boolean) => void;
    loginStatus: boolean;
};

export default function SideBar({ changePanelType, isActive, togglePanel, loginStatus }: Props) {
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
            <button onClick={() => changePanelType('login')}>{loginStatus ? '登出' : '登入'}</button>
        </div>
    );
}
