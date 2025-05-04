import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

type Props = {
    isResizing: boolean;
};

// 保持地圖中心點
export default function _ResizeEffect({ isResizing }: Props) {
    const map = useMap();
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isResizing) {
            intervalRef.current = window.setInterval(() => {
                map.invalidateSize();
                map.panTo(L.latLng(map.getCenter().lat, map.getCenter().lng), { animate: false });
            }, 10); // 每 10ms 更新一次
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isResizing, map]);

    return null;
}
