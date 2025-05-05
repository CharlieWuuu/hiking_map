import { useMapEvent } from 'react-leaflet';

type Props = {
    setActiveFeatureUuid: (id: string | null) => void;
};

export default function _MapClickHandler({ setActiveFeatureUuid }: Props) {
    useMapEvent('click', (e) => {
        console.log(e);
        const isGeoJsonLayer = (e.originalEvent?.target as HTMLElement)?.closest('.leaflet-interactive');
        if (isGeoJsonLayer) return;
        setActiveFeatureUuid(null);
    });

    return null; // 不 render UI，只處理事件
}
