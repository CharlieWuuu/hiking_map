import { useState } from 'react';
import SideBar from '../components/SideBar';
import SidePanel from '../components/SidePanel';
import Map from '../components/Map';
import styles from './Index.module.scss';
import '../styles/main.scss';
import { BaseMapEn, BaseMapSettingEn, BaseMapLayerSettings } from '../types/baseMapSettings';
import { SidePanelStatus } from '../types/SidePanelStatus';

export default function Index() {
    const [panelType, setPanelType] = useState<SidePanelStatus['panelType']>('layer');
    const [isActive, setIsActive] = useState(false);
    const [baseMap, setBaseMap] = useState<BaseMapEn>('osm');

    const [baseMap_setting, setBaseMap_setting] = useState<BaseMapLayerSettings>({
        osm: { opacity: 0.6, saturate: 0.6 },
        carto: { opacity: 1, saturate: 1 },
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

    return (
        <div className={styles.Index}>
            <SideBar changePanelType={changePanelType} isActive={isActive} togglePanel={setIsActive} />
            <SidePanel panelType={panelType} isActive={isActive} baseMap={baseMap} setBaseMap={setBaseMap} baseMap_setting={baseMap_setting} updateBaseMap_setting={updateBaseMap_setting} />
            <Map baseMap={baseMap} baseMap_setting={baseMap_setting} />
        </div>
    );
}
