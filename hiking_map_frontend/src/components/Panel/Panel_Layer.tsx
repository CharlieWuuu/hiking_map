import styles from './Panel_Layer.module.scss';
import { BaseMapEn } from '../../types/baseMapSettings';
import { useMapContext } from '../../context/MapContext';

export default function Panel_Layer() {
    const { nowBaseMap, setNowBaseMap, baseMapSetting, setBaseMapSetting } = useMapContext();

    return (
        <div className={styles.Panel_Layer}>
            {/* <div className={styles.Layer}>
                <p>圖層</p>
                <div>
                    <fieldset>
                        <label>
                            <input type="radio" name="layer" value="all" />
                            <span>待開發</span>
                        </label>
                    </fieldset>
                </div>
            </div> */}
            <div className={styles.Layer}>
                <p>背景</p>
                <div>
                    {/* 之後用成類似 google 地圖顯示截圖 */}
                    {/* {Object.keys(baseMapSetting).map((key) => {
                        return (
                            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                                <img src="" alt="" />
                                <p>
                                    {baseMapSetting[key as keyof typeof baseMapSetting].label_zh}｜{baseMapSetting[key as keyof typeof baseMapSetting].label}
                                </p>
                            </div>
                        );
                    })} */}
                    {Object.keys(baseMapSetting).map((key) => {
                        const nowBaseMapSetting = baseMapSetting[key as keyof typeof baseMapSetting];
                        return (
                            <fieldset key={key}>
                                <label>
                                    <input type="radio" name="baseMap" value={key} checked={nowBaseMap === key} onChange={() => setNowBaseMap(key as BaseMapEn)} />
                                    <span>
                                        {nowBaseMapSetting.label_zh}｜{nowBaseMapSetting.label}
                                    </span>
                                </label>
                                {nowBaseMap === key && (
                                    <div>
                                        {(['opacity', 'saturate'] as const).map((settingKey) => (
                                            <div key={settingKey}>
                                                <label htmlFor={`${key}-${settingKey}`}>{settingKey === 'opacity' ? '透明度' : '飽和度'}</label>
                                                <input id={`${key}-${settingKey}`} type="range" min={0} max={1} step={0.01} value={baseMapSetting[key][settingKey]} onChange={(e) => setBaseMapSetting((prev) => ({ ...prev, [key]: { ...prev[key], [settingKey]: parseFloat(e.target.value) } }))} />
                                                <span>{Math.round(baseMapSetting[key][settingKey] * 100)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </fieldset>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
