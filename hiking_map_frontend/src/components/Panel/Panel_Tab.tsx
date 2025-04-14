import styles from './Panel_Tab.module.scss';

type Props = {
    panelDataType: 'All' | 'Chart' | 'Layer';
    setPanelDataType: (dataType: 'All' | 'Chart' | 'Layer') => void;
};

export default function Panel_Tab({ panelDataType, setPanelDataType }: Props) {
    return (
        <div className={styles.Panel_Tab}>
            <button className={panelDataType === 'All' ? styles.active : ''} onClick={() => setPanelDataType('All')}>
                所有資料
            </button>
            <button className={panelDataType === 'Chart' ? styles.active : ''} onClick={() => setPanelDataType('Chart')}>
                圖表
            </button>
            <button className={panelDataType === 'Layer' ? styles.active : ''} onClick={() => setPanelDataType('Layer')}>
                圖層
            </button>
        </div>
    );
}
