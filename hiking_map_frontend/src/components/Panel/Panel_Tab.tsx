import styles from './Panel_Tab.module.scss';

export default function Panel_Tab() {
    return (
        <div className={styles.Panel_Tab}>
            <button>資料</button>
            <button>圖表</button>
            <button>圖層</button>
        </div>
    );
}
