import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import type { FeatureCollection } from 'geojson';

type Props = {
    panToId: string | null;
    trails: FeatureCollection | null;
};

export default function _PanToEffect({ panToId, trails }: Props) {
    const map = useMap();

    useEffect(() => {
        if (!panToId || !trails) return;

        const targetFeature = trails.features.find((f) => f.properties?.uuid === panToId);
        if (!targetFeature) return;

        // 取得四角座標
        const bounds = targetFeature.properties?.bounds as [number, number][] | undefined;
        if (bounds) {
            map.fitBounds(L.latLngBounds(L.latLng(bounds[0][1], bounds[0][0]), L.latLng(bounds[2][1], bounds[2][0])), {
                paddingTopLeft: [20, 20],
                paddingBottomRight: [20, 20],
            });
        }

        const center = targetFeature.properties?.center as [number, number] | undefined;
        if (!center) return;
        if (center.length > 0) {
            const latlng = L.latLng(center[1], center[0]);
            map.panTo(latlng);
        }
    }, [panToId, trails, map]);

    return null;
}
