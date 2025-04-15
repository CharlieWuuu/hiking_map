import { MapContainer, TileLayer, GeoJSON, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { BaseMapEn, BaseMapSettingEn } from '../../types/baseMapSettings';
import type { FeatureCollection } from 'geojson';
import './Map.scss'; // 1. 因為要改 Leaflet 的樣式而不能用 modules 2. 因為 Panel、Map 的 hover 行為影響到 Panel_Button 的樣式，所以不用 modules
import { useIsResizing } from '../../hooks/useIsResizing';
import Panel_Button from '../Panel/Panel_Button';
import { usePolyline } from '../../context/PolylineContext';
import { useMapContext } from '../../context/MapContext';

interface Props {
    geojson: FeatureCollection | null;
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

export default function Map({ geojson }: Props) {
    const [IsZoomIn, setIsZoomIn] = useState(false);
    const { hoverFeatureId, setHoverFeatureId, activeFeatureId, setActiveFeatureId } = usePolyline();
    const { nowBaseMap, baseMapSetting } = useMapContext();

    const mapWrapperRef = useRef<HTMLDivElement>(null);
    const isResizing = useIsResizing(mapWrapperRef as React.RefObject<HTMLElement>, 600); // 600ms：你的動畫時間
    const hoverFeature = geojson?.features.find((f) => f.properties?.id === hoverFeatureId) ?? null;
    const activeFeature = geojson?.features.find((f) => f.properties?.id === activeFeatureId) ?? null;

    const activeRef = useRef<number | null>(null);
    useEffect(() => {
        activeRef.current = activeFeatureId;
    }, [activeFeatureId]);

    return (
        <div className={`Map ${IsZoomIn ? 'ZoomIn' : ''}`} ref={mapWrapperRef}>
            <Panel_Button IsZoomIn={IsZoomIn} setIsZoomIn={setIsZoomIn} hasCloseButton={false} />
            <MapContainer center={[25.047924, 121.517081]} zoom={12} scrollWheelZoom={true} zoomControl={false}>
                <TileEffect baseMap={nowBaseMap} setting={baseMapSetting[nowBaseMap]} />
                <TileLayer url={baseMapSetting[nowBaseMap].url} />
                <PanToEffect panToId={activeFeatureId} geojson={geojson} />
                <ZoomControl position="bottomright" />
                <ResizeEffect isResizing={isResizing} />
                {geojson && (
                    <div>
                        <GeoJSON
                            data={geojson}
                            style={{ color: 'transparent', weight: 10 }}
                            onEachFeature={(feature, layer) => {
                                const pathLayer = layer as L.Path;
                                const id = feature.properties?.id;
                                pathLayer.on({
                                    mouseover: () => setHoverFeatureId(id),
                                    mouseout: () => setHoverFeatureId(null),
                                    click: () => {
                                        const currentActive = activeRef.current;
                                        setActiveFeatureId(currentActive === id ? null : id);
                                    },
                                });
                            }}
                        />
                        <GeoJSON data={geojson} style={{ color: '#ffffff', weight: 4, interactive: false }} />
                        <GeoJSON data={geojson} style={{ color: '#747009', weight: 2, interactive: false }} />
                    </div>
                )}
                {hoverFeature && hoverFeature !== activeFeature && (
                    <div>
                        <GeoJSON key={`highlight-white-${hoverFeature.properties?.id}`} data={hoverFeature} style={{ color: '#ffffff', weight: 6, interactive: false }} />
                        <GeoJSON key={`highlight-yellow-${hoverFeature.properties?.id}`} data={hoverFeature} style={{ color: '#CFCF13', weight: 3, interactive: false }} />
                    </div>
                )}
                {activeFeature && (
                    <div>
                        <GeoJSON key={`highlight-white-${activeFeature.properties?.id}`} data={activeFeature} style={{ color: '#000000', weight: 6, interactive: false }} />
                        <GeoJSON key={`highlight-orange-${activeFeature.properties?.id}`} data={activeFeature} style={{ color: '#FFFF3C', weight: 3, interactive: false }} />
                    </div>
                )}
            </MapContainer>
        </div>
    );
}
