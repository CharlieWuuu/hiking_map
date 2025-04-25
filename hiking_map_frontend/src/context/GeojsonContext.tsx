import { createContext, useContext, useState, useEffect } from 'react';
import type { FeatureCollection } from 'geojson';

type GeojsonContextType = {
    geojson: FeatureCollection | null;
    setGeojson: (id: FeatureCollection | null) => void;
    refreshGeojson: () => void;
};

const GeojsonContext = createContext<GeojsonContextType | undefined>(undefined);

export const GeojsonProvider = ({ children }: { children: React.ReactNode }) => {
    const [geojson, setGeojson] = useState<FeatureCollection | null>(null);

    const refreshGeojson = async () => {
        const token = localStorage.getItem('token');

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        try {
            const baseURL = import.meta.env.VITE_API_URL;
            console.log('baseURL', baseURL);
            fetch(`${baseURL}/trails`, {
                headers,
            })
                .then((res) => res.json())
                .then((data: FeatureCollection) => setGeojson(data));
        } catch (error) {
            console.error('取得 GeoJSON 失敗', error);
        }
    };

    useEffect(() => {
        refreshGeojson();
    }, []);

    return <GeojsonContext.Provider value={{ geojson, setGeojson, refreshGeojson }}>{children}</GeojsonContext.Provider>;
};

export const useGeojson = () => {
    const context = useContext(GeojsonContext);

    if (!context) throw new Error('useGeojson 必須包在 <GeojsonProvider> 內');
    return context;
};
