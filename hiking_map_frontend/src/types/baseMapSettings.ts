// types/baseMapSettings.ts
import { TileLayer as LeafletTileLayer } from 'leaflet';

export type BaseMapEn = 'osm' | 'carto';
export type BaseMapZh = '開放街圖' | 'CARTO 地圖';
export type BaseMapSettingEn = 'opacity' | 'saturate';
export type BaseMapSettingZh = '透明度' | '飽和度';

export type BaseMapSetting = {
    setting_en: BaseMapSettingEn;
    setting_zh: BaseMapSettingZh;
    value: number;
};

export type BaseMapLayerSettings = {
    [key in BaseMapEn]: {
        opacity: number;
        saturate: number;
    };
};

export type BaseMapTileRefs = {
    [key in BaseMapEn]: React.RefObject<LeafletTileLayer | null>;
};
