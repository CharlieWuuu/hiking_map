'use client';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { Fragment, useEffect, useRef } from 'react';
import { MapContainer, Polyline, TileLayer, useMap, ZoomControl } from 'react-leaflet';

import { useIsResizing } from '../../hooks/useIsResizing';

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

export default function MultiTrailMap({ trails, hoverSlug, activeSlug, onHoverChange, onSelect }: Props) {
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const isResizing = useIsResizing(mapWrapperRef, 600);
  const activeTrail = trails.find((trail) => trail.slug === activeSlug) ?? null;

  return (
    <div ref={mapWrapperRef} className="rounded-panel h-full w-full overflow-hidden">
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom className="h-full w-full" zoomControl={false}>
        <TileEffect />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ZoomControl position="bottomright" />
        <ResizeEffect isResizing={isResizing} />
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
      </MapContainer>
    </div>
  );
}
