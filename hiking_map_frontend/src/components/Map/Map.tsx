// styles
import './Map.scss'; // 1. 因為要改 Leaflet 的樣式而不能用 modules 2. 因為 Panel、Map 的 hover 行為影響到 Panel_Button 的樣式，所以不用 modules
import 'leaflet/dist/leaflet.css';

import { MapContainer, TileLayer, GeoJSON, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { useIsResizing } from '../../hooks/useIsResizing';
import Map_ZoomIn from './Map_ZoomIn';
import { usePolyline } from '../../context/PolylineContext';
import { useMapContext } from '../../context/MapContext';
import { useTableContext } from '../../context/TableContext';
import Map_Detail from './Map_Detail';
import Map_Layer from './Map_Layer';
import { useLocation } from 'react-router-dom';

import _MapClickHandler from './_MapClickHandler';
import _PanToEffect from './_PanToEffect';
import _ResizeEffect from './_ResizeEffect';
import _TileEffect from './_TileEffect';

import { useParams, useNavigate } from 'react-router-dom';
import DataUserEdit from '../../assets/images/Menu_Data_User_Edit.svg';
import Menu_Data from '../../assets/images/Menu_Data.svg';
import './Map_Button.scss';

export default function Map() {
    const { trails, version, loading } = usePolyline();

    const { hoverFeatureUuid, setHoverFeatureUuid, activeFeatureUuid, setActiveFeatureUuid } = usePolyline();
    useEffect(() => {
        setActiveFeatureUuid(null);
    }, []);

    const { nowBaseMap, baseMapSetting } = useMapContext();

    const mapWrapperRef = useRef<HTMLDivElement>(null);
    const isResizing = useIsResizing(mapWrapperRef as React.RefObject<HTMLElement>, 600); // 600ms：你的動畫時間
    const hoverFeature = trails?.features.find((f) => f.properties?.uuid === hoverFeatureUuid) ?? null;
    const activeFeature = trails?.features.find((f) => f.properties?.uuid === activeFeatureUuid) ?? null;

    const activeRef = useRef<string | null>(null);

    useEffect(() => {
        activeRef.current = activeFeatureUuid;
    }, [activeFeatureUuid]);
    const { setFeatures } = useTableContext();

    useEffect(() => {
        setFeatures(trails?.features ?? []);
    }, [trails, version]);

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    const [IsZoomIn, setIsZoomIn] = useState(mode === 'map');

    const { name, type } = useParams<{ name: string; type: string; mode: string }>();
    const navigate = useNavigate();
    const handleMode = () => {
        if (mode === 'edit') {
            navigate(`/owner/${type}/${name}/data?mode=data`, { replace: true });
        } else {
            navigate(`/owner/${type}/${name}/data?mode=edit`, { replace: true });
        }
    };

    return (
        <div className={`Map ${mode === 'map' ? 'ZoomIn' : ''} ${mode !== 'map' ? 'ZoomOut' : ''}`} ref={mapWrapperRef}>
            <Map_ZoomIn IsZoomIn={IsZoomIn} setIsZoomIn={setIsZoomIn} />
            {activeFeatureUuid && <Map_Detail trails={activeFeature} />}
            <MapContainer center={[23.7, 120.9]} zoom={7} scrollWheelZoom={true} zoomControl={false}>
                <_TileEffect baseMap={nowBaseMap} setting={baseMapSetting[nowBaseMap]} />
                <_PanToEffect panToId={activeFeatureUuid} trails={trails} />
                <_ResizeEffect isResizing={isResizing} />
                <_MapClickHandler setActiveFeatureUuid={setActiveFeatureUuid} />

                <TileLayer url={baseMapSetting[nowBaseMap].url} />
                <ZoomControl position="bottomright" />
                <Map_Layer />

                {(!trails || loading) && (
                    <span className="onLoading">
                        <div className="loader"></div>
                    </span>
                )}

                <button className="Map_Button" onClick={() => handleMode()} style={{ bottom: '4rem', left: '1rem', position: 'absolute' }}>
                    <img src={mode === 'edit' ? Menu_Data : DataUserEdit} alt={mode === 'edit' ? '資料' : '編輯'} width={16} />
                </button>

                {trails && (
                    <div>
                        <GeoJSON
                            key={Math.random()}
                            data={trails}
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
                        <GeoJSON key={Math.random()} data={trails} style={{ color: '#ffffff', weight: 6, interactive: false }} />
                        <GeoJSON key={Math.random()} data={trails} style={{ color: '#747009', weight: 3, interactive: false }} />
                    </div>
                )}
                {hoverFeature && hoverFeature !== activeFeature && (
                    <div>
                        <GeoJSON key={`white-${hoverFeature.properties?.uuid}`} data={hoverFeature} style={{ color: '#ffffff', weight: 8, interactive: false }} />
                        <GeoJSON key={`yellow-${hoverFeature.properties?.uuid}`} data={hoverFeature} style={{ color: '#CFCF13', weight: 4, interactive: false }} />
                    </div>
                )}
                {activeFeature && (
                    <div>
                        <GeoJSON key={`white-${activeFeature.properties?.uuid}`} data={activeFeature} style={{ color: '#000000', weight: 8, interactive: false }} />
                        <GeoJSON key={`orange-${activeFeature.properties?.uuid}`} data={activeFeature} style={{ color: '#FFFF3C', weight: 4, interactive: false }} />
                    </div>
                )}
            </MapContainer>
        </div>
    );
}
