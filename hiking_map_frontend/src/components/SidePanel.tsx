import styles from './SidePanel.module.scss';

type panelStatus = {
    panelType: 'layer' | 'data' | 'login';
    isActive: boolean;
};

export default function SidePanel({ panelType, isActive }: panelStatus) {
    return (
        <div className={`${styles.sidePanel} ${isActive ? styles.open : styles.close}`}>
            <div>
                {panelType === 'layer' && <h2>這是圖層內容</h2>}
                {panelType === 'data' && <h2>這是資料內容</h2>}
                {panelType === 'login' && <h2>這是登入表單</h2>}
            </div>
        </div>
    );
}
