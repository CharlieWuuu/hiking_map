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
import { useTableContext } from '../../context/TableContext';
import { useGeojson } from '../../context/GeojsonContext';
import { usePanel } from '../../context/PanelContext';
import Map_Detail from './Map_Detail';
import Map_Layer from './Map_Layer';
import { useLocation } from 'react-router-dom';
import DataUserChart from '../../assets/images/Menu_Data_User_Chart.svg';
import { Link } from 'react-router-dom';

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

function PanToEffect({ panToId, geojson }: { panToId: string | null; geojson: FeatureCollection | null }) {
    const map = useMap();

    useEffect(() => {
        if (!panToId || !geojson) return;

        const targetFeature = geojson.features.find((f) => f.properties?.uuid === panToId);
        if (!targetFeature) return;

        // 取得四角座標
        const bounds = targetFeature.properties?.bounds as [number, number][] | undefined;
        if (bounds) {
            map.fitBounds(L.latLngBounds(L.latLng(bounds[0][1], bounds[0][0]), L.latLng(bounds[2][1], bounds[2][0])), {
                paddingTopLeft: [200, 200],
                paddingBottomRight: [200, 200],
            });
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

export default function Map() {
    const { geojson } = useGeojson();
    const [IsZoomIn, setIsZoomIn] = useState(false);
    const { hoverFeatureUuid, setHoverFeatureUuid, activeFeatureUuid, setActiveFeatureUuid } = usePolyline();
    const { nowBaseMap, baseMapSetting } = useMapContext();

    const mapWrapperRef = useRef<HTMLDivElement>(null);
    const isResizing = useIsResizing(mapWrapperRef as React.RefObject<HTMLElement>, 600); // 600ms：你的動畫時間
    const hoverFeature = geojson?.features.find((f) => f.properties?.uuid === hoverFeatureUuid) ?? null;
    const activeFeature = geojson?.features.find((f) => f.properties?.uuid === activeFeatureUuid) ?? null;

    const activeRef = useRef<string | null>(null);
    useEffect(() => {
        activeRef.current = activeFeatureUuid;
    }, [activeFeatureUuid]);
    const { setFeatures } = useTableContext();
    useEffect(() => {
        if (geojson) setFeatures(geojson.features);
    }, [geojson]);

    const { uiPanels } = usePanel();
    const location = useLocation();
    const type = location.pathname.split('/')[1];
    const name = location.pathname.split('/')[2];

    return (
        <div className={`Map ${IsZoomIn ? 'ZoomIn' : ''} ${uiPanels?.edit ? 'Editing' : ''}`} ref={mapWrapperRef}>
            <Panel_Button IsZoomIn={IsZoomIn} setIsZoomIn={setIsZoomIn} hasCloseButton={false} />
            {activeFeatureUuid && <Map_Detail />}
            <MapContainer center={[25.047924, 121.517081]} zoom={12} scrollWheelZoom={true} zoomControl={false}>
                <TileEffect baseMap={nowBaseMap} setting={baseMapSetting[nowBaseMap]} />
                <TileLayer url={baseMapSetting[nowBaseMap].url} />
                <PanToEffect panToId={activeFeatureUuid} geojson={geojson} />
                <ZoomControl position="bottomright" />
                <ResizeEffect isResizing={isResizing} />
                <Map_Layer />
                <div className="ChartButton">
                    <Link to={`/${type}/${name}/chart`}>
                        <img src={DataUserChart} alt="Icon" />
                    </Link>
                </div>

                {!geojson && (
                    <span className="onLoading">
                        <div className="loader"></div>
                    </span>
                )}
                {geojson && (
                    <div>
                        <GeoJSON
                            data={geojson}
                            style={{ color: 'transparent', weight: 10 }}
                            onEachFeature={(feature, layer) => {
                                const pathLayer = layer as L.Path;
                                const uuid = feature.properties?.uuid;
                                const name = feature.properties?.name;
                                const map = useMap();
                                if (name) {
                                    layer.bindTooltip(name, { permanent: false, direction: 'center', className: 'line-tooltip', opacity: 1 });

                                    map.on('zoomend', () => {
                                        const zoom = map.getZoom();

                                        if (zoom >= 12) {
                                            layer.bindTooltip(name, { permanent: true, direction: 'center', className: 'line-tooltip', opacity: 1 });
                                        } else {
                                            layer.bindTooltip(name, { permanent: false, direction: 'center', className: 'line-tooltip', opacity: 1 });
                                        }
                                    });
                                }

                                pathLayer.on({
                                    mouseover: () => setHoverFeatureUuid(uuid),
                                    mouseout: () => setHoverFeatureUuid(null),
                                    click: () => {
                                        const currentActive = activeRef.current;
                                        setActiveFeatureUuid(currentActive === uuid ? null : uuid);
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
                        <GeoJSON key={`highlight-white-${hoverFeature.properties?.uuid}`} data={hoverFeature} style={{ color: '#ffffff', weight: 6, interactive: false }} />
                        <GeoJSON key={`highlight-yellow-${hoverFeature.properties?.uuid}`} data={hoverFeature} style={{ color: '#CFCF13', weight: 3, interactive: false }} />
                    </div>
                )}
                {activeFeature && (
                    <div>
                        <GeoJSON key={`highlight-white-${activeFeature.properties?.uuid}`} data={activeFeature} style={{ color: '#000000', weight: 6, interactive: false }} />
                        <GeoJSON key={`highlight-orange-${activeFeature.properties?.uuid}`} data={activeFeature} style={{ color: '#FFFF3C', weight: 3, interactive: false }} />
                    </div>
                )}
            </MapContainer>
        </div>
    );
}
