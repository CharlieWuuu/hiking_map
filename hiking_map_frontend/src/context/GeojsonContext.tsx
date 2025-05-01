import { createContext, useContext, useState, useEffect } from 'react';
import type { FeatureCollection } from 'geojson';

type GeojsonContextType = {
    geojson: FeatureCollection | null;
    setGeojson: (id: FeatureCollection | null) => void;
    refreshGeojson: () => void;
};

const GeojsonContext = createContext<GeojsonContextType | undefined>(undefined);

// 💡 在 module 層建立一個記憶體快取（重新整理會清掉，但切頁不會）
let inMemoryCache: FeatureCollection | null = null;

export const GeojsonProvider = ({ children }: { children: React.ReactNode }) => {
    const [geojson, setGeojson] = useState<FeatureCollection | null>(null);

    const refreshGeojson = async () => {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const baseURL = import.meta.env.VITE_API_URL;
            const res = await fetch(`${baseURL}/trails`, { headers });
            const data: FeatureCollection = await res.json();

            inMemoryCache = data;
            localStorage.setItem('geojson-cache', JSON.stringify(data));
            setGeojson(data);
        } catch (error) {
            console.error('取得 GeoJSON 失敗', error);
        }
    };

    useEffect(() => {
        // 先檢查記憶體快取
        if (inMemoryCache) {
            setGeojson(inMemoryCache);
            console.log('📦 使用 in-memory cache');
            return;
        }

        // 再檢查 localStorage（跨頁重整時有效）
        const local = localStorage.getItem('geojson-cache');
        if (local) {
            try {
                const parsed = JSON.parse(local);
                inMemoryCache = parsed;
                setGeojson(parsed);
                console.log('💾 使用 localStorage cache');
                return;
            } catch {
                console.warn('⚠️ localStorage 格式錯誤，忽略');
            }
        }

        // 最後 fallback 到實際 fetch
        refreshGeojson();
    }, []);

    return <GeojsonContext.Provider value={{ geojson, setGeojson, refreshGeojson }}>{children}</GeojsonContext.Provider>;
};

export const useGeojson = () => {
    const context = useContext(GeojsonContext);
    if (!context) throw new Error('useGeojson 必須包在 <GeojsonProvider> 內');
    return context;
};
