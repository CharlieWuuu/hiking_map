// types/baseMapSettings.ts
import { TileLayer as LeafletTileLayer } from 'leaflet';

export type BaseMapEn = 'osm' | 'OpenTopoMap' | 'carto_light' | 'carto_dark' | 'EsriWorldTopographicMap';

export type BaseMapZh = '開放街圖' | '開放地形圖' | 'Carto 亮色地圖' | 'Carto 深色地圖' | 'Esri 世界地形圖';

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
