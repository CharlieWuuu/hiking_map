import styles from './Panel_Detail.module.scss';
import { usePolyline } from '../../context/PolylineContext';

export default function Panel_Detail() {
    return (
        <div className={styles.Panel_Detail}>
            <h2>詳細資料</h2>
        </div>
    );
}
