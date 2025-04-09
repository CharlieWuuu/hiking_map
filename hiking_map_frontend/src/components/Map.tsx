import { MapContainer, TileLayer, GeoJSON, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { BaseMapEn, BaseMapSettingEn } from '../types/baseMapSettings';
import type { FeatureCollection } from 'geojson';
import './Map.scss';

interface MapProps {
    baseMap: BaseMapEn;
    baseMap_setting: Record<BaseMapEn, Record<BaseMapSettingEn, number>>;
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


export default function Map({ baseMap, baseMap_setting }: MapProps) {
    const [geojson, setGeojson] = useState<FeatureCollection | null>(null);

    useEffect(() => {
        fetch('http://localhost:3001/trails')
            .then((res) => res.json())
            .then((data: FeatureCollection) => setGeojson(data));
    }, []);

    const baseMapUrl = {
        osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        carto: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    }[baseMap];

    return (
        <div className="Map">
            <MapContainer center={[24.944993, 121.404645]} zoom={13} scrollWheelZoom={true} zoomControl={false}>
                <TileEffect baseMap={baseMap} setting={baseMap_setting[baseMap]} />
                <TileLayer url={baseMapUrl} />
                <ZoomControl position="bottomright" />
                {geojson && <GeoJSON data={geojson} style={{ color: 'red', weight: 4 }} />}
            </MapContainer>
        </div>
    );
}
