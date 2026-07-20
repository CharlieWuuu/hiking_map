'use client';

import L from 'leaflet';
import { Fragment, useEffect } from 'react';
import { Polyline, useMap } from 'react-leaflet';

import MapView from '../MapView';

export type MapTrail = {
  slug: string;
  path: [number, number][]; // [經度, 緯度]
};

type Props = {
  trails: MapTrail[];
  hoverSlug: string | null;
  activeSlug: string | null;
  onHoverChange: (slug: string | null) => void;
  onSelect: (slug: string | null) => void;
};

const DEFAULT_CENTER: [number, number] = [23.7, 120.9];
const DEFAULT_ZOOM = 7;

// 選中路線變更時，讓地圖平移縮放到該路線範圍
function PanToActiveEffect({ trail }: { trail: MapTrail | null }) {
  const map = useMap();

  useEffect(() => {
    if (!trail) return;
    const latLngPath: [number, number][] = trail.path.map(([lng, lat]) => [lat, lng]);
    const bounds = L.latLngBounds(latLngPath);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [trail, map]);

  return null;
}

export default function TrailsLayer({ trails, hoverSlug, activeSlug, onHoverChange, onSelect }: Props) {
  const activeTrail = trails.find((trail) => trail.slug === activeSlug) ?? null;

  return (
    <MapView center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="rounded-panel h-full w-full overflow-hidden">
      <PanToActiveEffect trail={activeTrail} />

      {trails.map((trail) => {
        const latLngPath: [number, number][] = trail.path.map(([lng, lat]) => [lat, lng]);
        const isActive = trail.slug === activeSlug;
        const isHover = trail.slug === hoverSlug;

        const [outlineColor, outlineWeight, coreColor, coreWeight] = isActive
          ? ['#000000', 8, '#FFFF3C', 4]
          : isHover
            ? ['#ffffff', 8, '#CFCF13', 4]
            : ['#ffffff', 6, '#747009', 3];

        return (
          <Fragment key={trail.slug}>
            {/* 透明加寬的點擊/hover 熱區 */}
            <Polyline
              positions={latLngPath}
              pathOptions={{ color: 'transparent', weight: 16 }}
              eventHandlers={{
                mouseover: () => onHoverChange(trail.slug),
                mouseout: () => onHoverChange(null),
                click: () => onSelect(isActive ? null : trail.slug),
              }}
            />
            <Polyline positions={latLngPath} pathOptions={{ color: outlineColor, weight: outlineWeight }} interactive={false} />
            <Polyline positions={latLngPath} pathOptions={{ color: coreColor, weight: coreWeight }} interactive={false} />
          </Fragment>
        );
      })}
    </MapView>
  );
}
