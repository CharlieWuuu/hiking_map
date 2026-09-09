'use client';

import { Polyline } from 'react-leaflet';

import MapView from '../MapView';

type Props = {
  // 路線座標序列，[經度, 緯度]
  path: [number, number][];
};

export default function TrailLayer({ path }: Props) {
  const latLngPath: [number, number][] = path.map(([lng, lat]) => [lat, lng]);
  const center = latLngPath[Math.floor(latLngPath.length / 2)];

  return (
    <MapView center={center} zoom={15}>
      <Polyline positions={latLngPath} pathOptions={{ color: '#000000', weight: 8 }} interactive={false} />
      <Polyline positions={latLngPath} pathOptions={{ color: '#FFFF3C', weight: 4 }} interactive={false} />
    </MapView>
  );
}
