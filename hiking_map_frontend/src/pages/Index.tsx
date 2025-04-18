import Map from '../components/Map/Map';
import styles from './Index.module.scss';
import '../styles/main.scss';
import Panel from '../components/Panel/Panel';
import { MapProvider } from '../context/MapContext';
import { usePanel } from '../context/PanelContext';

export default function Index() {
    const { uiPanels, setUIPanels } = usePanel();

    return (
        <div className={styles.Index}>
            <MapProvider>
                <div className={`${styles.leftPanelContainer} ${uiPanels?.edit ? styles.Editing : ''}`}>
                    {uiPanels?.data && <Panel type={'data'} hasCloseButton={false} />}
                    {uiPanels?.detail && !uiPanels?.edit && setUIPanels && <Panel type={'detail'} onClose={() => setUIPanels((prev) => ({ ...prev, detail: false }))} />}
                    {uiPanels?.edit && setUIPanels && <Panel type={'edit'} onClose={() => setUIPanels((prev) => ({ ...prev, edit: false, data: true }))} />}
                </div>
                <Map />
                {(uiPanels?.info || uiPanels?.auth) && (
                    <div className={styles.rightPanelContainer}>
                        {uiPanels?.info && setUIPanels && <Panel type={'info'} onClose={() => setUIPanels((prev) => ({ ...prev, info: false }))} />}
                        {uiPanels?.auth && setUIPanels && <Panel type={'auth'} onClose={() => setUIPanels((prev) => ({ ...prev, auth: false }))} />}
                    </div>
                )}
            </MapProvider>
        </div>
    );
}
