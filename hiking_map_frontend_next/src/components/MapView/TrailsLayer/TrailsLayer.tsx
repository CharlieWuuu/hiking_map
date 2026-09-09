'use client';

import L from 'leaflet';
import { Fragment, useEffect } from 'react';
import { Polyline, useMap, useMapEvents } from 'react-leaflet';

import { useMapStore, type LngLat } from '../../../lib/mapStore';
import MapView from '../MapView';

export type MapTrail = {
  slug: string;
  path: LngLat[]; // [經度, 緯度]，這是簡化後的線
  // 完整軌跡在 R2 的網址，放大到看得出差別時才會去抓
  trackUrl?: string | null;
  // [minLng, minLat, maxLng, maxLat]，用來判斷是否進入視野
  bbox?: [number, number, number, number] | null;
};

type Props = {
  trails: MapTrail[];
};

const DEFAULT_CENTER: [number, number] = [23.7, 120.9];
const DEFAULT_ZOOM = 7;

// 簡化線的容差約 45 公尺，大概在這個層級以下看不出差別。
// 超過就去 R2 換上完整軌跡
const DETAIL_ZOOM = 14;

// 選中路線變更時，讓地圖平移縮放到該路線範圍
function PanToActiveEffect({ trail }: { trail: MapTrail | null }) {
  const map = useMap();

  useEffect(() => {
    if (!trail) return;
    // 有 bbox 就直接用，不必為了算範圍走過整條路徑
    const bounds = trail.bbox
      ? L.latLngBounds([trail.bbox[1], trail.bbox[0]], [trail.bbox[3], trail.bbox[2]])
      : L.latLngBounds(trail.path.map(([lng, lat]) => [lat, lng] as [number, number]));
    if (!bounds.isValid()) return;
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [trail, map]);

  return null;
}

// 把地圖目前的縮放與範圍同步進 store，並在放大時載入視野內路線的完整軌跡
function DetailTrackLoader({ trails }: { trails: MapTrail[] }) {
  const zoom = useMapStore((state) => state.zoom);
  const bounds = useMapStore((state) => state.bounds);
  const setViewport = useMapStore((state) => state.setViewport);
  const loadTrack = useMapStore((state) => state.loadTrack);
  const touchTracks = useMapStore((state) => state.touchTracks);

  const map = useMap();

  function sync() {
    const b = map.getBounds();
    setViewport(map.getZoom(), [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
  }

  useMapEvents({ zoomend: sync, moveend: sync });

  // 掛載時先同步一次，之後才由事件接手
  useEffect(sync, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!bounds) return;

    const visible = trails.filter((trail) => intersects(trail.bbox, bounds));
    // 進入視野就算用到，即使還沒放大到要換完整軌跡——
    // 這樣淘汰時被丟掉的一定是使用者已經離開很久的區域
    touchTracks(visible.map((trail) => trail.slug));

    if (zoom < DETAIL_ZOOM) return;
    for (const trail of visible) {
      if (trail.trackUrl) void loadTrack(trail.slug, trail.trackUrl);
    }
  }, [trails, bounds, zoom, loadTrack, touchTracks]);

  return null;
}

// bbox 缺漏時一律當作在視野內，寧可多載入也不要整條線消失
function intersects(bbox: MapTrail['bbox'], view: [number, number, number, number]) {
  if (!bbox) return true;
  return bbox[0] <= view[2] && bbox[2] >= view[0] && bbox[1] <= view[3] && bbox[3] >= view[1];
}

export default function TrailsLayer({ trails }: Props) {
  const hoverSlug = useMapStore((state) => state.hoverSlug);
  const activeSlug = useMapStore((state) => state.activeSlug);
  const setHoverSlug = useMapStore((state) => state.setHoverSlug);
  const setActiveSlug = useMapStore((state) => state.setActiveSlug);
  const tracks = useMapStore((state) => state.tracks);

  const activeTrail = trails.find((trail) => trail.slug === activeSlug) ?? null;

  return (
    <MapView center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="rounded-panel h-full w-full overflow-hidden">
      <PanToActiveEffect trail={activeTrail} />
      <DetailTrackLoader trails={trails} />

      {trails.map((trail) => {
        // 完整軌跡還沒到就先畫簡化線，載好再換掉，中間不要出現空白
        const path = tracks.get(trail.slug)?.path ?? trail.path;
        const latLngPath: [number, number][] = path.map(([lng, lat]) => [lat, lng]);
        const isActive = trail.slug === activeSlug;
        const isHover = trail.slug === hoverSlug;

        const [outlineColor, outlineWeight, coreColor, coreWeight] = isActive
          ? ['#000000', 8, '#90C8D0', 4]
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
                mouseover: () => setHoverSlug(trail.slug),
                mouseout: () => setHoverSlug(null),
                click: () => setActiveSlug(isActive ? null : trail.slug),
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
