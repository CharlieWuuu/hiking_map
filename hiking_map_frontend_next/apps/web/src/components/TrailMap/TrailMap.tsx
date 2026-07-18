'use client';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { MapContainer, Polyline, TileLayer, useMap, ZoomControl } from 'react-leaflet';

import { useIsResizing } from '../../hooks/useIsResizing';

type Props = {
  // 路線座標序列，[經度, 緯度]
  path: [number, number][];
};

// 讓底圖去飽和、降低不透明度，襯托上層的路線描邊
function TileEffect() {
  const map = useMap();

  useEffect(() => {
    const tilePane = map.getPanes().tilePane;
    if (tilePane) {
      tilePane.style.filter = 'saturate(0)';
      tilePane.style.opacity = '0.3';
    }
  }, [map]);

  return null;
}

// 容器在 resize 動畫期間（例如側邊欄展開/收合）持續讓地圖重新量測尺寸並保持中心點，避免動畫過程中版面跑掉
function ResizeEffect({ isResizing }: { isResizing: boolean }) {
  const map = useMap();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isResizing) {
      intervalRef.current = window.setInterval(() => {
        map.invalidateSize();
        map.panTo(L.latLng(map.getCenter().lat, map.getCenter().lng), { animate: false });
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isResizing, map]);

  return null;
}

export default function TrailMap({ path }: Props) {
  const latLngPath: [number, number][] = path.map(([lng, lat]) => [lat, lng]);
  const center = latLngPath[Math.floor(latLngPath.length / 2)];

  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const isResizing = useIsResizing(mapWrapperRef, 600);

  return (
    <div ref={mapWrapperRef} className="rounded-panel h-125 w-full overflow-hidden">
      <MapContainer center={center} zoom={15} scrollWheelZoom className="h-full w-full" zoomControl={false}>
        <TileEffect />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ZoomControl position="bottomright" />
        <ResizeEffect isResizing={isResizing} />
        <Polyline positions={latLngPath} pathOptions={{ color: '#000000', weight: 8 }} interactive={false} />
        <Polyline positions={latLngPath} pathOptions={{ color: '#FFFF3C', weight: 4 }} interactive={false} />
      </MapContainer>
    </div>
  );
}
