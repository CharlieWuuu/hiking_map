import Map from '../components/Map/Map';
import styles from './Data_User.module.scss';
import Panel from '../components/Panel/Panel';
import { usePanel } from '../context/PanelContext';

export default function Data_User() {
    const { ZoomIn } = usePanel();
    return (
        <div className={styles.Data_User}>
            <div className={`${styles.leftPanelContainer} ${ZoomIn ? styles.ZoomIn : ''}`}>
                <Panel type={'data'} />
            </div>
            <Map />
        </div>
    );
}
