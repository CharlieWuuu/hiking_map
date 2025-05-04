import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { BaseMapEn, BaseMapSettingEn } from '../../types/baseMapSettings';

type Props = {
    baseMap: BaseMapEn;
    setting: Record<BaseMapSettingEn, number>;
};

export default function _TileEffect({ baseMap, setting }: Props) {
    const map = useMap();
    useEffect(() => {
        const tilePane = map.getPanes().tilePane;
        if (tilePane) {
            tilePane.style.filter = `saturate(${setting.saturate})`;
            tilePane.style.opacity = `${setting.opacity}`;
        }
    }, [baseMap, setting, map]);

    return null;
}
