import { useLocation, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import '../components/Map/Map.scss'; // 1. 因為要改 Leaflet 的樣式而不能用 modules 2. 因為 Panel、Map 的 hover 行為影響到 Panel_Button 的樣式，所以不用 modules
import { useIsResizing } from '../hooks/useIsResizing';
import { usePolyline } from '../context/PolylineContext';
import { useTableContext } from '../context/TableContext';
import { useGeojson } from '../context/GeojsonContext';
import styles from './Owner_Trail.module.scss';
import GoBack from '../components/GoBack/GoBack';

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

export default function Owner_Trail() {
    const location = useLocation();
    const props = location.state?.features.properties;
    const { name, type } = useParams();

    const { geojson } = useGeojson();
    const { activeFeatureUuid } = usePolyline();

    const mapWrapperRef = useRef<HTMLDivElement>(null);
    const isResizing = useIsResizing(mapWrapperRef as React.RefObject<HTMLElement>, 600); // 600ms：你的動畫時間

    const activeRef = useRef<string | null>(null);
    useEffect(() => {
        activeRef.current = activeFeatureUuid;
    }, [activeFeatureUuid]);
    const { setFeatures } = useTableContext();
    useEffect(() => {
        if (geojson) setFeatures(geojson.features);
    }, [geojson]);

    return (
        <div className={styles.Owner_Trail}>
            <div className={styles.Owner_Trail_GoBack}></div>
            <div className={styles.Owner_Trail_Title}>
                <GoBack url={`/owner/${type}/${name}`} />
                <div className={styles.Card_title}>
                    <h1>{props.name}</h1>
                    <p>
                        {props.county}
                        {props.town}
                    </p>
                </div>
                <div className={styles.Card_properties}>
                    <div>
                        <span>日期</span>
                        <p>{props.time.substring(0, 10)}</p>
                    </div>
                    <div>
                        <span>距離</span> <p>{props.length} 公里</p>
                    </div>
                    <div>
                        <span>路線連結</span>
                        <div>
                            {Array.isArray(props.url) && props.url.length > 0 ? (
                                props.url.map((element: string, index: number) => (
                                    <a
                                        key={element || index} // 用網址作為 key，若為空備援用 index
                                        href={element}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: 'white' }}>
                                        連結-{index + 1}
                                    </a>
                                ))
                            ) : (
                                <p>-</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <span>說明</span>
                        <p>{props.note ?? '-'}</p>
                    </div>
                </div>
            </div>
            {type === 'layer' && (
                <div className={styles.Owner_Trail_Intro}>
                    <h2>介紹</h2>
                    <p>這條步道位於自然環境豐富的山林之中，全長約數公里，沿途林蔭茂密、景觀多變，不僅能欣賞壯麗的山景與溪流，還能觀察到豐富的生態系統。步道沿線設有導覽牌與休憩設施，適合親子同行或輕鬆健行。春季可見繁花盛開，夏季林蔭涼爽，秋季楓紅轉色，冬季雲霧繚繞，各有風情。地形以緩坡為主，部分區段設有階梯與棧道，提升行走的安全性與舒適度。無論是初學者還是資深山友，都能在這條步道中找到適合自己的節奏，是一條四季皆宜、兼具自然與人文特色的健行路線。</p>
                </div>
            )}
            <section className={styles.Owner_Trail_Map}>
                <h2>地圖</h2>
                <MapContainer
                    center={[props.center[1], props.center[0]]}
                    bounds={[
                        [props.bounds[0][1], props.bounds[0][0]],
                        [props.bounds[2][1], props.bounds[2][0]],
                    ]}
                    scrollWheelZoom={true}
                    zoomControl={false}>
                    <TileEffect />
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <ZoomControl position="bottomright" />
                    <ResizeEffect isResizing={isResizing} />
                    <GeoJSON key={`highlight-white-${props.uuid}`} data={location.state.features} style={{ color: '#000000', weight: 8, interactive: false }} />
                    <GeoJSON key={`highlight-orange-${props.uuid}`} data={location.state.features} style={{ color: '#FFFF3C', weight: 4, interactive: false }} />
                </MapContainer>
            </section>
        </div>
    );
}
