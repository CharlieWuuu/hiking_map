import { useState, useEffect } from 'react';
import Map from '../components/Map/Map';
import styles from './Index.module.scss';
import '../styles/main.scss';
import type { FeatureCollection } from 'geojson';
import Panel from '../components/Panel/Panel';
import type { UIPanels, PanelType } from '../types/uiPanels';
import { PolylineProvider } from '../context/PolylineContext';
import { MapProvider } from '../context/MapContext';
// import Panel_Tab from '../components/Panel/Panel_Tab';

type Props = {
    uiPanels?: UIPanels;
    setUIPanels?: React.Dispatch<React.SetStateAction<Record<PanelType, boolean>>>;
};

export default function Index({ uiPanels, setUIPanels }: Props) {
    // const [panelDataType, setPanelDataType] = useState<'All' | 'Chart' | 'Layer'>('All');

    const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
    useEffect(() => {
        fetch('http://localhost:3001/trails')
            .then((res) => res.json())
            .then((data: FeatureCollection) => setGeojson(data));
    }, []);

    return (
        <div className={styles.Index}>
            <MapProvider>
                <PolylineProvider>
                    <div className={styles.leftPanelContainer}>
                        {/* <Panel_Tab panelDataType={panelDataType} setPanelDataType={setPanelDataType} /> */}

                        <Panel geojson={geojson} type={'data'} hasCloseButton={false} />
                        {uiPanels?.detail && setUIPanels && <Panel type={'detail'} onClose={() => setUIPanels((prev) => ({ ...prev, detail: false }))} />}
                    </div>
                    <Map geojson={geojson} />
                    {(uiPanels?.info || uiPanels?.auth) && (
                        <div className={styles.rightPanelContainer}>
                            {uiPanels?.info && setUIPanels && <Panel type={'info'} onClose={() => setUIPanels((prev) => ({ ...prev, info: false }))} />}
                            {uiPanels?.auth && setUIPanels && <Panel type={'auth'} onClose={() => setUIPanels((prev) => ({ ...prev, auth: false }))} />}
                        </div>
                    )}
                </PolylineProvider>
            </MapProvider>
        </div>
    );
}
