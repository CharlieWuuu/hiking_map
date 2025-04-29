import Map from '../components/Map/Map';
import styles from './Data_User.module.scss';
import Panel from '../components/Panel/Panel';
import { usePanel } from '../context/PanelContext';

export default function Data_User() {
    const { uiPanels } = usePanel();

    return (
        <div className={styles.Data_User}>
            <div className={`${styles.leftPanelContainer} ${uiPanels?.edit ? styles.Editing : ''}`}>
                {uiPanels?.data && <Panel type={'data'} />}
                {uiPanels?.edit && <Panel type={'edit'} />}
            </div>
            <Map />
            {(uiPanels?.info || uiPanels?.auth) && (
                <div className={styles.rightPanelContainer}>
                    {uiPanels?.info && <Panel type={'info'} />}
                    {uiPanels?.auth && <Panel type={'auth'} />}
                </div>
            )}
        </div>
    );
}
