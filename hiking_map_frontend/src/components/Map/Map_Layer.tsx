import './Map_Layer.scss';
import MapLayer from '../../assets/images/Map_Layer.svg';
import { BaseMapEn } from '../../types/baseMapSettings';
import ClosePanel from '../../assets/images/Panel_ClosePanel.svg';
import { useMapContext } from '../../context/MapContext';
import { useState } from 'react';

export default function Map_Layer() {
    const { nowBaseMap, setNowBaseMap, baseMapSetting, setBaseMapSetting } = useMapContext();
    const [open, setOpen] = useState(false);
    return (
        <div className={`Map_Layer ${open ? 'open' : ''}`}>
            <div className="Map_Layer_Button" onClick={() => setOpen(true)}>
                <img src={MapLayer} alt="" />
            </div>
            <div className="Map_Layer_Panel">
                <button className="Map_Layer_Button_Close" onClick={() => setOpen(false)}>
                    <img src={ClosePanel} alt="關閉" />
                </button>
                {/* 待開發圖層樣式設定 */}
                <fieldset>
                    <p>背景</p>
                    <div>
                        {Object.keys(baseMapSetting).map((key) => {
                            const nowBaseMapSetting = baseMapSetting[key as keyof typeof baseMapSetting];
                            return (
                                <label className="layerLabel" key={key}>
                                    <input style={{ display: 'none' }} type="radio" name="baseMap" value={key} checked={nowBaseMap === key} onChange={() => setNowBaseMap(key as BaseMapEn)} />
                                    <img src={nowBaseMapSetting.img} alt="" className={`${nowBaseMap === key ? 'active' : ''}`} />
                                    <span>{nowBaseMapSetting.label_zh} </span>
                                </label>
                            );
                        })}
                    </div>
                </fieldset>
                <fieldset>
                    <p>背景樣式</p>
                    <div className="layerSetting">
                        {(['opacity', 'saturate'] as const).map((settingKey) => (
                            <div key={settingKey} className="layerSettingItem">
                                <label>{settingKey === 'opacity' ? '透明度' : '飽和度'}</label>
                                <input type="range" min={0} max={1} step={0.01} value={baseMapSetting[nowBaseMap][settingKey]} onChange={(e) => setBaseMapSetting((prev) => ({ ...prev, [nowBaseMap]: { ...prev[nowBaseMap], [settingKey]: parseFloat(e.target.value) } }))} />
                                <span>{Math.round(baseMapSetting[nowBaseMap][settingKey] * 100)}%</span>
                            </div>
                        ))}
                    </div>
                </fieldset>
            </div>
        </div>
    );
}
