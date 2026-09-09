'use client';

import L from 'leaflet';
import { useTranslations } from 'next-intl';
import { Fragment, useEffect } from 'react';
import { Polyline, Popup, useMap, useMapEvents } from 'react-leaflet';

import { useMapStore, type LngLat } from '../../../lib/mapStore';
import MapView from '../MapView';

export type MapTrail = {
  slug: string;
  path: LngLat[]; // [經度, 緯度]，這是簡化後的線
  // 完整軌跡在 R2 的網址，放大到看得出差別時才會去抓
  trackUrl?: string | null;
  // [minLng, minLat, maxLng, maxLat]，用來判斷是否進入視野
  bbox?: [number, number, number, number] | null;
  // 有給的話，選中路線時會在地圖上浮現這張資訊卡
  name?: string;
  county?: string;
  town?: string;
  distanceKm?: number;
};

type Props = {
  trails: MapTrail[];
  // 外層容器（例如全螢幕切換）尺寸明確變化時傳入新值，強制地圖重新量測——見 MapView 的 resizeKey
  resizeKey?: unknown;
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

// 選中路線時，浮現一張跟版面其他卡片同一套語言的懸浮資訊卡，取代 Leaflet 預設的白底泡泡。
// Popup 直接掛在 MapContainer 底下（沒有依附任何 layer）時，react-leaflet 掛載時就會自動開啟
function ActiveTrailPopup({ trail, position }: { trail: MapTrail; position: [number, number] }) {
  const t = useTranslations('TrailListItem');

  if (!trail.name) return null;

  return (
    <Popup position={position} closeButton={false} autoPan={false} className="hiking-map-popup" minWidth={180}>
      <div className="bg-panel rounded-panel flex flex-col gap-1 p-3">
        <span className="text-base font-bold">{trail.name}</span>
        <span className="text-background-contrary/60 text-xs">
          {trail.county} {trail.town}
        </span>
        {trail.distanceKm !== undefined && <span className="text-accent mt-1 text-sm font-semibold">{t('distanceValue', { distance: trail.distanceKm })}</span>}
      </div>
    </Popup>
  );
}

export default function TrailsLayer({ trails, resizeKey }: Props) {
  const hoverSlug = useMapStore((state) => state.hoverSlug);
  const activeSlug = useMapStore((state) => state.activeSlug);
  const setHoverSlug = useMapStore((state) => state.setHoverSlug);
  const setActiveSlug = useMapStore((state) => state.setActiveSlug);
  const tracks = useMapStore((state) => state.tracks);

  const activeTrail = trails.find((trail) => trail.slug === activeSlug) ?? null;
  const activeTrailPath = activeTrail ? (tracks.get(activeTrail.slug)?.path ?? activeTrail.path) : null;
  const activeTrailMidpoint = activeTrailPath?.[Math.floor(activeTrailPath.length / 2)];

  return (
    <MapView center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="rounded-panel h-full w-full overflow-hidden" resizeKey={resizeKey}>
      <PanToActiveEffect trail={activeTrail} />
      <DetailTrackLoader trails={trails} />

      {activeTrail && activeTrailMidpoint && (
        <ActiveTrailPopup key={activeTrail.slug} trail={activeTrail} position={[activeTrailMidpoint[1], activeTrailMidpoint[0]]} />
      )}

      {trails.map((trail) => {
        // 完整軌跡還沒到就先畫簡化線，載好再換掉，中間不要出現空白
        const path = tracks.get(trail.slug)?.path ?? trail.path;
        const latLngPath: [number, number][] = path.map(([lng, lat]) => [lat, lng]);
        const isActive = trail.slug === activeSlug;
        const isHover = trail.slug === hoverSlug;

        const [outlineColor, outlineWeight, coreColor, coreWeight] = isActive
          ? ['#000000', 8, '#FFFF3C', 4]
          : isHover
            ? ['#ffffff', 8, '#FFFF3C', 4]
            : ['#ffffff', 6, '#A67C00', 3];

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
