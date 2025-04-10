import styles from './SideBar.module.scss';
import { SidePanelStatus } from '../../types/SidePanelStatus';

type panelStatus = {
    changePanelType: (panelType: SidePanelStatus['panelType']) => void;
    isActive: boolean;
    togglePanel: (isActive: boolean) => void;
};

export default function SideBar({ changePanelType, isActive, togglePanel }: panelStatus) {
    return (
        <div className={styles.sideBar}>
            <button style={{ backgroundColor: 'transparent', border: '1px solid black', pointerEvents: 'none' }}>LOGO</button>
            <button className={isActive ? styles.active : ''} onClick={() => togglePanel(!isActive)}>
                ☰
            </button>
            <button onClick={() => changePanelType('layer')}>圖層</button>
            <button onClick={() => changePanelType('data')}>資料</button>
            <button onClick={() => changePanelType('login')}>登入</button>
        </div>
    );
}
