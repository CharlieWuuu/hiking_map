'use client';

import L from 'leaflet';
import { useEffect } from 'react';
import { Marker, Polyline, useMap } from 'react-leaflet';

import MapView from '../MapView';

const DEFAULT_CENTER: [number, number] = [23.7, 120.9];

const markerIcon = L.divIcon({
  className: '',
  html: '<div style="width: 16px; height: 16px; border-radius: 50%; background: #FFFF3C; border: 2px solid #000000;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

type Props = {
  // 路線座標序列，[經度, 緯度]
  path: [number, number][];
};

// 目前位置變更時，讓地圖跟著平移到最新座標
function FollowCurrentPositionEffect({ position }: { position: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (position) map.panTo(position);
  }, [position, map]);

  return null;
}

export default function RecordLayer({ path }: Props) {
  const latLngPath: [number, number][] = path.map(([lng, lat]) => [lat, lng]);
  const currentPosition = latLngPath.length > 0 ? latLngPath[latLngPath.length - 1] : null;

  return (
    <MapView center={currentPosition ?? DEFAULT_CENTER} zoom={16} className="rounded-panel h-full w-full overflow-hidden">
      <FollowCurrentPositionEffect position={currentPosition} />
      {latLngPath.length > 1 && <Polyline positions={latLngPath} pathOptions={{ color: '#FFFF3C', weight: 4 }} />}
      {currentPosition && <Marker position={currentPosition} icon={markerIcon} />}
    </MapView>
  );
}
