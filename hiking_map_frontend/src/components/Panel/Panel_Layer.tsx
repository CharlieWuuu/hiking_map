import styles from './Panel_Layer.module.scss';
import { BaseMapEn } from '../../types/baseMapSettings';
import { useMapContext } from '../../context/MapContext';

export default function Panel_Layer() {
    const { nowBaseMap, setNowBaseMap, baseMapSetting, setBaseMapSetting } = useMapContext();

    return (
        <div className={styles.Panel_Layer}>
            {/* 待開發圖層樣式設定 */}
            <fieldset>
                <p>背景</p>
                <div>
                    {Object.keys(baseMapSetting).map((key) => {
                        const nowBaseMapSetting = baseMapSetting[key as keyof typeof baseMapSetting];
                        return (
                            <label className={styles.layerLabel} key={key}>
                                <input style={{ display: 'none' }} type="radio" name="baseMap" value={key} checked={nowBaseMap === key} onChange={() => setNowBaseMap(key as BaseMapEn)} />
                                <img src={nowBaseMapSetting.img} alt="" className={`${nowBaseMap === key ? styles.active : ''}`} />
                                <span>{nowBaseMapSetting.label_zh} </span>
                            </label>
                        );
                    })}
                </div>
            </fieldset>
            <fieldset>
                <p>背景樣式</p>
                <div className={styles.layerSetting}>
                    {(['opacity', 'saturate'] as const).map((settingKey) => (
                        <div key={settingKey} className={styles.layerSettingItem}>
                            <label>{settingKey === 'opacity' ? '透明度' : '飽和度'}</label>
                            <input type="range" min={0} max={1} step={0.01} value={baseMapSetting[nowBaseMap][settingKey]} onChange={(e) => setBaseMapSetting((prev) => ({ ...prev, [nowBaseMap]: { ...prev[nowBaseMap], [settingKey]: parseFloat(e.target.value) } }))} />
                            <span>{Math.round(baseMapSetting[nowBaseMap][settingKey] * 100)}%</span>
                        </div>
                    ))}
                </div>
            </fieldset>
        </div>
    );
}
