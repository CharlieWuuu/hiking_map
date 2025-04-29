import { createContext, useState, useContext, ReactNode } from 'react';
import type { BaseMapEn } from '../types/baseMapSettings';
import osmImgUrl from '../assets/images/Map_osm.png';
import OpenTopoMapImgUrl from '../assets/images/Map_OpenTopoMap.png';
import CartoLightImgUrl from '../assets/images/Map_carto_light.png';
import CartoDarkImgUrl from '../assets/images/Map_carto_dark.png';
import EsriTopoMapUrl from '../assets/images/Map_EsriTopoMap.png';

type BaseMapSetting = {
    [key in BaseMapEn]: {
        opacity: number;
        saturate: number;
        label: string;
        label_zh: string;
        label_detail_zh: string;
        url: string;
        img: string;
    };
};

type MapContextType = {
    nowBaseMap: BaseMapEn;
    setNowBaseMap: (map: BaseMapEn) => void;
    baseMapSetting: BaseMapSetting;
    setBaseMapSetting: React.Dispatch<React.SetStateAction<BaseMapSetting>>;
};

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: ReactNode }) => {
    const [nowBaseMap, setNowBaseMap] = useState<BaseMapEn>('osm');

    const [baseMapSetting, setBaseMapSetting] = useState<BaseMapSetting>({
        osm: {
            opacity: 0.3,
            saturate: 0,
            label: 'OpenStreetMap',
            label_zh: '一般',
            label_detail_zh: '開放街圖',
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            img: osmImgUrl,
        },
        OpenTopoMap: {
            opacity: 0.6,
            saturate: 0.6,
            label: 'OpenTopoMap',
            label_zh: '地形1',
            label_detail_zh: '開放地形圖',
            url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            img: OpenTopoMapImgUrl,
        },
        EsriTopoMap: {
            opacity: 0.6,
            saturate: 1,
            label: 'Esri World Topographic Map',
            label_zh: '地形2',
            label_detail_zh: 'Esri 世界地形圖',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
            img: EsriTopoMapUrl,
        },
        carto_light: {
            opacity: 1,
            saturate: 1,
            label: 'Carto Light',
            label_zh: '淺色',
            label_detail_zh: 'Carto 亮色地圖',
            url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            img: CartoLightImgUrl,
        },
        carto_dark: {
            opacity: 1,
            saturate: 1,
            label: 'Carto Dark',
            label_zh: '深色',
            label_detail_zh: 'Carto 深色地圖',
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            img: CartoDarkImgUrl,
        },
    });

    return <MapContext.Provider value={{ nowBaseMap, setNowBaseMap, baseMapSetting, setBaseMapSetting }}>{children}</MapContext.Provider>;
};

export const useMapContext = () => {
    const context = useContext(MapContext);
    if (!context) throw new Error('useMap 必須包在 <MapProvider> 內');
    return context;
};
