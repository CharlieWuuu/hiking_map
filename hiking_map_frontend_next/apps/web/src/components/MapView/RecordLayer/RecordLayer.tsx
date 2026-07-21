'use client';

import L from 'leaflet';
import { Marker } from 'react-leaflet';

import MapView from '../MapView';

// 尚未接上真的 GPS，先用固定的示範座標（台北 101 附近）當作目前位置
const DEMO_CENTER: [number, number] = [25.033, 121.5645];

const markerIcon = L.divIcon({
  className: '',
  html: '<div style="width: 16px; height: 16px; border-radius: 50%; background: #FFFF3C; border: 2px solid #000000;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function RecordLayer() {
  return (
    <MapView center={DEMO_CENTER} zoom={16} className="rounded-panel h-100 w-full overflow-hidden">
      <Marker position={DEMO_CENTER} icon={markerIcon} />
    </MapView>
  );
}
