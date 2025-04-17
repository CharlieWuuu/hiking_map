import Map from '../components/Map/Map';
import styles from './Index.module.scss';
import '../styles/main.scss';
import type { FeatureCollection } from 'geojson';
import Panel from '../components/Panel/Panel';
import { MapProvider } from '../context/MapContext';
import { usePanel } from '../context/PanelContext';

type Props = {
    geojson: FeatureCollection | null;
};

export default function Index({ geojson }: Props) {
    const { uiPanels, setUIPanels } = usePanel();

    return (
        <div className={styles.Index}>
            <MapProvider>
                <div className={styles.leftPanelContainer}>
                    <Panel geojson={geojson} type={'data'} hasCloseButton={false} />
                    {uiPanels?.detail && setUIPanels && <Panel geojson={geojson} type={'detail'} onClose={() => setUIPanels((prev) => ({ ...prev, detail: false }))} />}
                </div>
                <Map geojson={geojson} />
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
