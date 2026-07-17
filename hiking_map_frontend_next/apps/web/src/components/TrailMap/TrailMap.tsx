'use client';

import 'leaflet/dist/leaflet.css';

import { useEffect } from 'react';
import { MapContainer, Polyline, TileLayer, useMap, ZoomControl } from 'react-leaflet';

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

export default function TrailMap({ path }: Props) {
  const latLngPath: [number, number][] = path.map(([lng, lat]) => [lat, lng]);
  const center = latLngPath[Math.floor(latLngPath.length / 2)];

  return (
    <div className="rounded-panel h-125 w-full overflow-hidden">
      <MapContainer center={center} zoom={15} scrollWheelZoom className="h-full w-full" zoomControl={false}>
        <TileEffect />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ZoomControl position="bottomright" />
        <Polyline positions={latLngPath} pathOptions={{ color: '#000000', weight: 8 }} interactive={false} />
        <Polyline positions={latLngPath} pathOptions={{ color: '#FFFF3C', weight: 4 }} interactive={false} />
      </MapContainer>
    </div>
  );
}
