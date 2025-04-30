import styles from './Panel_Tab.module.scss';
import { Link, useLocation } from 'react-router-dom';

type Props = {
    panelDataType: 'All' | 'Chart' | 'Layer';
    setPanelDataType: (dataType: 'All' | 'Chart' | 'Layer') => void;
};

export default function Panel_Tab({ panelDataType, setPanelDataType }: Props) {
    const location = useLocation();
    const userName = location.pathname.split('/')[2];
    return (
        <div className={styles.Panel_Tab}>
            <button className={panelDataType === 'All' ? styles.active : ''} onClick={() => setPanelDataType('All')}>
                資料
            </button>
            <Link to={`/user/${userName}/chart`}>圖表</Link>
            {/* <button className={panelDataType === 'Layer' ? styles.active : ''} onClick={() => setPanelDataType('Layer')}>
                圖層
            </button> */}
        </div>
    );
}
