import styles from './SidePanel_Layer.module.scss';
import { BaseMapEn, BaseMapLayerSettings, BaseMapSettingEn } from '../types/baseMapSettings';

type Props = {
    baseMap: BaseMapEn;
    setBaseMap: (baseMap: BaseMapEn) => void;
    baseMap_setting: BaseMapLayerSettings;
    updateBaseMap_setting: (key: BaseMapEn, settingKey: BaseMapSettingEn, newValue: number) => void;
};

export default function SidePanel_Layer({ baseMap, setBaseMap, baseMap_setting, updateBaseMap_setting }: Props) {
    const baseMaps = [
        { key: 'osm', label: 'OpenStreetMap' },
        { key: 'carto', label: 'Carto' },
    ] as const;

    return (
        <div className={styles.SidePanel_Layer}>
            {baseMaps.map(({ key, label }) => (
                <fieldset key={key}>
                    <label>
                        <input type="radio" name="baseMap" value={key} checked={baseMap === key} onChange={() => setBaseMap(key)} /> {label}
                    </label>
                    {baseMap === key && (
                        <div>
                            {(['opacity', 'saturate'] as const).map((settingKey) => (
                                <div key={settingKey}>
                                    <label htmlFor={`${key}-${settingKey}`}>{settingKey === 'opacity' ? '透明度' : '飽和度'}</label>
                                    <input id={`${key}-${settingKey}`} type="range" min={0} max={1} step={0.01} value={baseMap_setting[key][settingKey]} onChange={(e) => updateBaseMap_setting(key, settingKey, parseFloat(e.target.value))} />
                                    <span>{Math.round(baseMap_setting[key][settingKey] * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    )}
                </fieldset>
            ))}
        </div>
    );
}
