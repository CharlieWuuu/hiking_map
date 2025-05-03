import Map from '../components/Map/Map';
import styles from './Data_User.module.scss';
// import Panel from '../components/Panel/Panel';
// import { usePanel } from '../context/PanelContext';
import Panel_Data from '../components/Panel/Panel_Data';
import { useLocation } from 'react-router-dom';

export default function Data_User() {
    // const { ZoomIn } = usePanel();
    const location = useLocation();
    const trails = location.state?.trails;
    const owner = location.state?.owner;
    return (
        <div className={`${styles.Data_User}`}>
            {/* <div className={`${styles.leftPanelContainer} ${ZoomIn ? styles.ZoomIn : ''}`}>
                <Panel type={'data'} />
            </div> */}

            <Panel_Data />
            <Map />
        </div>
    );
}
