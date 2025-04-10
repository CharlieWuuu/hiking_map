import { MapContainer, TileLayer, GeoJSON, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { BaseMapEn, BaseMapSettingEn } from '../../types/baseMapSettings';
import type { FeatureCollection } from 'geojson';
import './Map.scss';
import { useIsResizing } from './useIsResizing';

interface Props {
    baseMap: BaseMapEn;
    baseMap_setting: Record<BaseMapEn, Record<BaseMapSettingEn, number>>;
    geojson: FeatureCollection | null;
    panToId: number | null;
    hoverFeatureId: number | null;
    activeFeatureId: number | null;
}

function TileEffect({ baseMap, setting }: { baseMap: BaseMapEn; setting: Record<BaseMapSettingEn, number> }) {
    const map = useMap();
    useEffect(() => {
        const tilePane = map.getPanes().tilePane;
        if (tilePane) {
            tilePane.style.filter = `saturate(${setting.saturate})`;
            tilePane.style.opacity = `${setting.opacity}`;
        }
    }, [baseMap, setting, map]);

    return null;
}

function PanToEffect({ panToId, geojson }: { panToId: number | null; geojson: FeatureCollection | null }) {
    const map = useMap();

    useEffect(() => {
        if (!panToId || !geojson) return;

        const targetFeature = geojson.features.find((f) => f.properties?.id === panToId);
        if (!targetFeature) return;

        // 取得四角座標
        const bounds = targetFeature.properties?.bounds as [number, number][] | undefined;
        if (bounds) {
            map.fitBounds(L.latLngBounds(L.latLng(bounds[0][1], bounds[0][0]), L.latLng(bounds[2][1], bounds[2][0])), { padding: [100, 100] });
        }

        const center = targetFeature.properties?.center as [number, number] | undefined;
        if (!center) return;
        if (center.length > 0) {
            const latlng = L.latLng(center[1], center[0]);
            map.panTo(latlng);
        }
    }, [panToId, geojson, map]);

    return null;
}

// 保持地圖中心點
function ResizeEffect({ isResizing }: { isResizing: boolean }) {
    const map = useMap();
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isResizing) {
            intervalRef.current = window.setInterval(() => {
                map.invalidateSize();
                map.panTo(L.latLng(map.getCenter().lat, map.getCenter().lng), { animate: false });
            }, 10); // 每 10ms 更新一次
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isResizing, map]);

    return null;
}

export default function Map({ baseMap, baseMap_setting, geojson, panToId, hoverFeatureId, activeFeatureId }: Props) {
    const baseMapUrl = {
        osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        carto: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    }[baseMap];
    const mapWrapperRef = useRef<HTMLDivElement>(null);
    const isResizing = useIsResizing(mapWrapperRef as React.RefObject<HTMLElement>, 600); // 600ms：你的動畫時間
    const hoverFeature = geojson?.features.find((f) => f.properties?.id === hoverFeatureId) ?? null;
    const activeFeature = geojson?.features.find((f) => f.properties?.id === activeFeatureId) ?? null;

    return (
        <div className="Map" ref={mapWrapperRef}>
            <MapContainer center={[25.047924, 121.517081]} zoom={12} scrollWheelZoom={true} zoomControl={false}>
                <TileEffect baseMap={baseMap} setting={baseMap_setting[baseMap]} />
                <TileLayer url={baseMapUrl} />
                <PanToEffect panToId={panToId} geojson={geojson} />
                <ZoomControl position="bottomright" />
                <ResizeEffect isResizing={isResizing} />
                {geojson && <GeoJSON data={geojson} style={{ color: 'red', weight: 4 }} />}
                {hoverFeature && <GeoJSON key={`highlight-white-${hoverFeature.properties?.id}`} data={hoverFeature} style={{ color: 'darkred', weight: 6 }} />}
                {activeFeature && (
                    <div>
                        <GeoJSON key={`highlight-white-${activeFeature.properties?.id}`} data={activeFeature} style={{ color: 'white', weight: 12 }} />
                        <GeoJSON key={`highlight-orange-${activeFeature.properties?.id}`} data={activeFeature} style={{ color: 'orange', weight: 6 }} />
                    </div>
                )}
            </MapContainer>
        </div>
    );
}
