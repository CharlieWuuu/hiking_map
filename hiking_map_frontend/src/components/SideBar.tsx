import styles from './SideBar.module.scss';

type panelStatus = {
    changePanelType: (panelType: 'layer' | 'data' | 'login') => void;
    isActive: boolean;
    togglePanel: (isActive: boolean) => void;
};

export default function SideBar({ changePanelType, isActive, togglePanel }: panelStatus) {
    return (
        <div className={styles.sideBar}>
            <button onClick={() => togglePanel(!isActive)}>🍔</button>
            <button onClick={() => changePanelType('layer')}>圖層</button>
            <button onClick={() => changePanelType('data')}>資料</button>
            <button onClick={() => changePanelType('login')}>登入</button>
        </div>
    );
}
