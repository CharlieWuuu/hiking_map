import { useState, useEffect } from 'react';
import SidePanel from '../components/SidePanel/SidePanel';
import Map from '../components/Map/Map';
import styles from './Index.module.scss';
import '../styles/main.scss';
import { BaseMapEn, BaseMapSettingEn, BaseMapLayerSettings } from '../types/baseMapSettings';
import { SidePanelStatus } from '../types/SidePanelStatus';
import type { FeatureCollection } from 'geojson';
import Panel from '../components/Panel/Panel';
import type { UIPanels, PanelType } from '../types/uiPanels';
import { PanelProvider } from '../context/PanelContext';

type Props = {
    uiPanels?: UIPanels;
    setUIPanels?: React.Dispatch<React.SetStateAction<Record<PanelType, boolean>>>;
};

export default function Index({ uiPanels, setUIPanels }: Props) {
    const [panelType, setPanelType] = useState<SidePanelStatus['panelType']>('layer');
    const [isActive, setIsActive] = useState(false);
    const [baseMap, setBaseMap] = useState<BaseMapEn>('osm');

    const [baseMap_setting, setBaseMap_setting] = useState<BaseMapLayerSettings>({
        osm: { opacity: 0.3, saturate: 0 },
        OpenTopoMap: { opacity: 0.6, saturate: 0.6 },
        carto_light: { opacity: 1, saturate: 1 },
        carto_dark: { opacity: 1, saturate: 1 },
        EsriWorldTopographicMap: { opacity: 1, saturate: 1 },
    });

    const updateBaseMap_setting = (key: BaseMapEn, settingKey: BaseMapSettingEn, newValue: number) => {
        setBaseMap_setting((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                [settingKey]: newValue,
            },
        }));
    };

    const changePanelType = (newPanelType: SidePanelStatus['panelType']) => {
        if (panelType !== newPanelType) {
            setPanelType(newPanelType);
            setIsActive(true);
        } else {
            setIsActive(!isActive);
        }
    };

    const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
    useEffect(() => {
        fetch('http://localhost:3001/trails')
            .then((res) => res.json())
            .then((data: FeatureCollection) => setGeojson(data));
    }, []);

    const [panToId, setPanToId] = useState<number | null>(null);
    const [hoverFeatureId, setHoverFeatureId] = useState<number | null>(null);
    const [activeFeatureId, setActiveFeatureId] = useState<number | null>(null);

    const [loginStatus, setLoginStatus] = useState<boolean>(false);

    return (
        <div className={styles.Index}>
            <PanelProvider>
                <div className={styles.leftPanelContainer}>
                    <Panel geojson={geojson} type={'data'} hasCloseButton={false} />
                    {uiPanels?.detail && setUIPanels && <Panel type={'detail'} onClose={() => setUIPanels((prev) => ({ ...prev, detail: false }))} />}
                </div>
                <Map baseMap={baseMap} baseMap_setting={baseMap_setting} geojson={geojson} panToId={panToId} />
                {(uiPanels?.info || uiPanels?.auth) && (
                    <div className={styles.rightPanelContainer}>
                        {uiPanels?.info && setUIPanels && <Panel type={'info'} onClose={() => setUIPanels((prev) => ({ ...prev, info: false }))} />}
                        {uiPanels?.auth && setUIPanels && <Panel type={'auth'} onClose={() => setUIPanels((prev) => ({ ...prev, auth: false }))} />}
                    </div>
                )}
                {/* <SidePanel panelType={panelType} isActive={isActive} baseMap={baseMap} setBaseMap={setBaseMap} baseMap_setting={baseMap_setting} updateBaseMap_setting={updateBaseMap_setting} geojson={geojson} setPanToId={setPanToId} hoverFeatureId={hoverFeatureId} setHoverFeatureId={setHoverFeatureId} activeFeatureId={activeFeatureId} setActiveFeatureId={setActiveFeatureId} loginStatus={loginStatus} setLoginStatus={setLoginStatus} /> */}{' '}
            </PanelProvider>
        </div>
    );
}
