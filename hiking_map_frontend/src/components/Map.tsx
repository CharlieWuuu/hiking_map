import { MapContainer, TileLayer, GeoJSON, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import type { FeatureCollection } from 'geojson';
// 模組化 CSS 不會影響外部的 class，導致 leaflet 無法吃我設定的樣式，所以不用 module
import './Map.scss';

export default function Map() {
    // const [data, setData] = useState<FeatureCollection | null>(null);

    // useEffect(() => {
    //     fetch('http://localhost:3001/trails') // 換成你的 API
    //         .then((res) => res.json())
    //         .then((geojson: FeatureCollection) => {
    //             setData(geojson);
    //         });
    // }, []);

    return (
        <div className="Map">
            <MapContainer center={[24.944993, 121.404645]} zoom={13} scrollWheelZoom={true} zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {/* {data && <GeoJSON data={data} style={{ color: 'red', weight: 4 }} />} */}
                <ZoomControl position="bottomright" />
            </MapContainer>
        </div>
    );
}
