'use client';

import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

import L from 'leaflet';
import { useTranslations } from 'next-intl';
import { Fragment, useEffect, useState } from 'react';
import { CircleMarker, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

import type { Hike } from '../../../lib/api/adapters/hikes';
import { apiClient } from '../../../lib/apiClient';
import { CLUSTER_ZOOM, DETAIL_ZOOM, useMapStore, type LngLat } from '../../../lib/mapStore';
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
  county?: string | null;
  town?: string | null;
  distanceKm?: number;
};

type Props = {
  // 有給的話只畫這份固定清單（例如編輯頁預覽單一路線），不會動用 store 依視野動態抓資料。
  // 不給則由地圖自己依 zoom/bounds 呼叫 findInView，用於 /data 這種要顯示大量紀錄的頁面
  trails?: MapTrail[];
  // 動態模式底下要抓誰的紀錄
  userId?: string;
  // 外層容器（例如全螢幕切換）尺寸明確變化時傳入新值，強制地圖重新量測——見 MapView 的 resizeKey
  resizeKey?: unknown;
};

const DEFAULT_CENTER: [number, number] = [23.7, 120.9];
const DEFAULT_ZOOM = 7;

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

// 把地圖目前的縮放與範圍同步進 store。動態模式下由這裡驅動 fetchInView，
// 固定模式（trails 由外部傳入）則只驅動完整軌跡的載入
function ViewportSync({ trails, userId }: { trails?: MapTrail[]; userId?: string }) {
  const zoom = useMapStore((state) => state.zoom);
  const bounds = useMapStore((state) => state.bounds);
  const setViewport = useMapStore((state) => state.setViewport);
  const loadTrack = useMapStore((state) => state.loadTrack);
  const touchTracks = useMapStore((state) => state.touchTracks);
  const fetchInView = useMapStore((state) => state.fetchInView);

  const map = useMap();
  const isDynamic = trails === undefined;

  function sync() {
    const b = map.getBounds();
    setViewport(map.getZoom(), [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
  }

  useMapEvents({ zoomend: sync, moveend: sync });

  // 掛載時先同步一次，之後才由事件接手
  useEffect(sync, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 動態模式：視野或縮放層級一變就重新跟 findInView 要資料
  useEffect(() => {
    if (!isDynamic || !bounds) return;
    void fetchInView(bounds, zoom, userId);
  }, [isDynamic, bounds, zoom, userId, fetchInView]);

  // 固定模式：視野內的紀錄放大到 DETAIL_ZOOM 才換完整軌跡
  useEffect(() => {
    if (isDynamic || !trails || !bounds) return;

    const visible = trails.filter((trail) => intersects(trail.bbox, bounds));
    touchTracks(visible.map((trail) => trail.slug));

    if (zoom < DETAIL_ZOOM) return;
    for (const trail of visible) {
      if (trail.trackUrl) void loadTrack(trail.slug, trail.trackUrl);
    }
  }, [isDynamic, trails, bounds, zoom, loadTrack, touchTracks]);

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

// 動態模式選中某筆紀錄時，findInView 給的欄位不夠顯示浮現卡，額外打 findOne 補足 name/county/town/distanceKm。
// 職責刻意跟 findInView 分開：地圖列表只管位置與線，詳情資料只有選中當下才需要
function useActiveHikeDetail(activeSlug: string | null, isDynamic: boolean) {
  const [detail, setDetail] = useState<Hike | null>(null);

  useEffect(() => {
    if (!isDynamic || !activeSlug) return;
    let cancelled = false;
    apiClient.hikes
      .findOne(Number(activeSlug))
      .then((hike) => {
        if (!cancelled) setDetail(hike);
      })
      .catch(() => {
        if (!cancelled) setDetail(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeSlug, isDynamic]);

  // 沒有選中、不是動態模式，或 detail 還是上一筆選中紀錄的殘留（新請求還沒回來），都回傳 null
  return isDynamic && activeSlug && String(detail?.id) === activeSlug ? detail : null;
}

export default function TrailsLayer({ trails, userId, resizeKey }: Props) {
  const hoverSlug = useMapStore((state) => state.hoverSlug);
  const activeSlug = useMapStore((state) => state.activeSlug);
  const setHoverSlug = useMapStore((state) => state.setHoverSlug);
  const setActiveSlug = useMapStore((state) => state.setActiveSlug);
  const tracks = useMapStore((state) => state.tracks);
  const markers = useMapStore((state) => state.markers);
  const zoom = useMapStore((state) => state.zoom);

  const isDynamic = trails === undefined;
  const activeHikeDetail = useActiveHikeDetail(activeSlug, isDynamic);

  // 兩種模式統一成同一份 { slug, path, trackUrl, bbox } 陣列給下面畫線邏輯共用
  const lineTrails: MapTrail[] = isDynamic
    ? markers
        .filter((marker) => marker.geojson)
        .map((marker) => ({
          slug: String(marker.id),
          path: flattenGeojsonPath(marker.geojson),
          trackUrl: marker.trackUrl,
          bbox: marker.bbox,
          name: marker.name,
        }))
    : (trails ?? []);

  const activeTrail: MapTrail | null = isDynamic
    ? activeHikeDetail
      ? {
          slug: String(activeHikeDetail.id),
          path: [],
          name: activeHikeDetail.name,
          county: activeHikeDetail.county,
          town: activeHikeDetail.town,
          distanceKm: activeHikeDetail.distanceKm,
          bbox: activeHikeDetail.bbox,
        }
      : null
    : (lineTrails.find((trail) => trail.slug === activeSlug) ?? null);
  const activeTrailPath = activeTrail
    ? (tracks.get(activeTrail.slug)?.path ?? lineTrails.find((trail) => trail.slug === activeTrail.slug)?.path ?? activeTrail.path)
    : null;
  const activeTrailMidpoint = activeTrailPath?.[Math.floor(activeTrailPath.length / 2)];

  // < CLUSTER_ZOOM 只畫點位（走 cluster），達到門檻才畫線；固定模式一律畫線，本來資料量就小
  const showClusterOnly = isDynamic && zoom < CLUSTER_ZOOM;

  return (
    <MapView center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="rounded-panel h-full w-full overflow-hidden" resizeKey={resizeKey}>
      <PanToActiveEffect trail={activeTrail} />
      <ViewportSync trails={trails} userId={userId} />

      {activeTrail && activeTrailMidpoint && (
        <ActiveTrailPopup key={activeTrail.slug} trail={activeTrail} position={[activeTrailMidpoint[1], activeTrailMidpoint[0]]} />
      )}

      {showClusterOnly ? (
        <MarkerClusterGroup chunkedLoading>
          {markers.map((marker) =>
            marker.center ? (
              <CircleMarker
                key={marker.id}
                center={[marker.center[1], marker.center[0]]}
                radius={6}
                pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#A67C00', fillOpacity: 1 }}
                eventHandlers={{ click: () => setActiveSlug(activeSlug === String(marker.id) ? null : String(marker.id)) }}
              />
            ) : null
          )}
        </MarkerClusterGroup>
      ) : (
        lineTrails.map((trail) => {
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
        })
      )}
    </MapView>
  );
}

// 後端存的是 MultiLineString，這裡只取第一條線
function flattenGeojsonPath(geometry: unknown): LngLat[] {
  if (!geometry || typeof geometry !== 'object' || !('type' in geometry) || !('coordinates' in geometry)) return [];
  if (geometry.type === 'LineString') return geometry.coordinates as LngLat[];
  if (geometry.type === 'MultiLineString') return (geometry.coordinates as LngLat[][])[0] ?? [];
  return [];
}
