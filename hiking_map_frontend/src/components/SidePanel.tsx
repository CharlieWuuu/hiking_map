import styles from './SidePanel.module.scss';
import SidePanel_Layer from './SidePanel_Layer';
import { SidePanelStatus } from '../types/SidePanelStatus';
import { BaseMapEn, BaseMapLayerSettings, BaseMapSettingEn } from '../types/baseMapSettings';

type Props = {
    panelType: SidePanelStatus['panelType'];
    isActive: SidePanelStatus['isActive'];
    baseMap: BaseMapEn;
    setBaseMap: (baseMap: BaseMapEn) => void;
    baseMap_setting: BaseMapLayerSettings;
    updateBaseMap_setting: (key: BaseMapEn, settingKey: BaseMapSettingEn, newValue: number) => void;
};

export default function SidePanel({ panelType, isActive, baseMap, setBaseMap, baseMap_setting, updateBaseMap_setting }: Props) {
    return (
        <div className={`${styles.sidePanel} ${isActive ? styles.open : styles.close}`}>
            {panelType === 'layer' && (
                <div>
                    <h2>圖層設定</h2>
                    <SidePanel_Layer baseMap={baseMap} setBaseMap={setBaseMap} baseMap_setting={baseMap_setting} updateBaseMap_setting={updateBaseMap_setting} />
                </div>
            )}
            {panelType === 'data' && <h2>這是資料內容</h2>}
            {panelType === 'login' && <h2>這是登入表單</h2>}
        </div>
    );
}
