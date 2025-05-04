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
import { usePanel } from '../../context/PanelContext';
import Map_Detail from './Map_Detail';
import Map_Layer from './Map_Layer';
import { useTrails } from '../../hooks/useTrails';
import { useParams } from 'react-router-dom';

import _MapClickHandler from './_MapClickHandler';
import _PanToEffect from './_PanToEffect';
import _ResizeEffect from './_ResizeEffect';
import _TileEffect from './_TileEffect';

export default function Map() {
    const { uuid, type } = useParams<{ uuid: string; type: string }>();
    const { trails } = useTrails({
        uuid: uuid!,
        type: type!,
    });
    const geojson = trails;
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

    return (
        <div className={`Map ${IsZoomIn ? 'ZoomIn' : ''} ${uiPanels?.edit ? 'Editing' : ''}`} ref={mapWrapperRef}>
            <Map_ZoomIn IsZoomIn={IsZoomIn} setIsZoomIn={setIsZoomIn} />
            {activeFeatureUuid && <Map_Detail trails={activeFeature} />}
            <MapContainer center={[25.047924, 121.517081]} zoom={12} scrollWheelZoom={true} zoomControl={false}>
                <_TileEffect baseMap={nowBaseMap} setting={baseMapSetting[nowBaseMap]} />
                <_PanToEffect panToId={activeFeatureUuid} geojson={geojson} />
                <_ResizeEffect isResizing={isResizing} />
                <_MapClickHandler setActiveFeatureUuid={setActiveFeatureUuid} />

                <TileLayer url={baseMapSetting[nowBaseMap].url} />
                <ZoomControl position="bottomright" />
                <Map_Layer />

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
                        <GeoJSON data={geojson} style={{ color: '#ffffff', weight: 6, interactive: false }} />
                        <GeoJSON data={geojson} style={{ color: '#747009', weight: 3, interactive: false }} />
                    </div>
                )}
                {hoverFeature && hoverFeature !== activeFeature && (
                    <div>
                        <GeoJSON key={`highlight-white-${hoverFeature.properties?.uuid}`} data={hoverFeature} style={{ color: '#ffffff', weight: 8, interactive: false }} />
                        <GeoJSON key={`highlight-yellow-${hoverFeature.properties?.uuid}`} data={hoverFeature} style={{ color: '#CFCF13', weight: 4, interactive: false }} />
                    </div>
                )}
                {activeFeature && (
                    <div>
                        <GeoJSON key={`highlight-white-${activeFeature.properties?.uuid}`} data={activeFeature} style={{ color: '#000000', weight: 8, interactive: false }} />
                        <GeoJSON key={`highlight-orange-${activeFeature.properties?.uuid}`} data={activeFeature} style={{ color: '#FFFF3C', weight: 4, interactive: false }} />
                    </div>
                )}
            </MapContainer>
        </div>
    );
}
