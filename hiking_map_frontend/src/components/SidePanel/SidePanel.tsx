import styles from './SidePanel.module.scss';
import SidePanel_Layer from './SidePanel_Layer';
import SidePanel_Data from './SidePanel_Data';
import SidePanel_Login from './SidePanel_Login';
import { BaseMapEn, BaseMapLayerSettings } from '../../types/baseMapSettings';
import type { FeatureCollection } from 'geojson';

type Props = {
    panelType: 'layer' | 'data' | 'login';
    isActive: boolean;
    baseMap: BaseMapEn;
    setBaseMap: (baseMap: BaseMapEn) => void;
    baseMap_setting: BaseMapLayerSettings;
    updateBaseMap_setting: (key: BaseMapEn, settingKey: 'opacity' | 'saturate', newValue: number) => void;
    geojson: FeatureCollection | null;
    setPanToId: (id: number | null) => void;
    hoverFeatureId: number | null;
    setHoverFeatureId: (id: number | null) => void;
    activeFeatureId: number | null;
    setActiveFeatureId: (id: number | null) => void;
    loginStatus: boolean;
    setLoginStatus: (loginStatus: boolean) => void;
};

export default function SidePanel({ panelType, isActive, baseMap, setBaseMap, baseMap_setting, updateBaseMap_setting, geojson, setPanToId, hoverFeatureId, setHoverFeatureId, activeFeatureId, setActiveFeatureId, loginStatus, setLoginStatus }: Props) {
    return (
        <div className={`${styles.sidePanel} ${isActive ? styles.open : styles.close}`}>
            <div>
                {panelType === 'layer' && <SidePanel_Layer baseMap={baseMap} setBaseMap={setBaseMap} baseMap_setting={baseMap_setting} updateBaseMap_setting={updateBaseMap_setting} />}
                {panelType === 'data' && <SidePanel_Data geojson={geojson} setPanToId={setPanToId} hoverFeatureId={hoverFeatureId} setHoverFeatureId={setHoverFeatureId} activeFeatureId={activeFeatureId} setActiveFeatureId={setActiveFeatureId} />}
                {panelType === 'login' && <SidePanel_Login loginStatus={loginStatus} setLoginStatus={setLoginStatus} />}
            </div>
        </div>
    );
}
