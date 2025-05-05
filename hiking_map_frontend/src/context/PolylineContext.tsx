// 匯入 React 的核心 hook 和型別，ReactNode 是用來定義 children 的型別
import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import type { Feature, FeatureCollection } from 'geojson';

// 定義這個 context 的資料格式，包含兩組 state（hover 和 active）與對應的 set 函式
type PolylineContextType = {
    hoverFeatureUuid: string | null;
    setHoverFeatureUuid: (id: string | null) => void;
    activeFeatureUuid: string | null;
    setActiveFeatureUuid: (id: string | null) => void;
    activeFeature: Feature | null;
    setActiveFeature: (feature: Feature | null) => void;
    deleteFeatureUuid: string | null;
    setDeleteFeatureUuid: (id: string | null) => void;
    trails: FeatureCollection | null;
    setTrails: (t: FeatureCollection | null) => void;
    fetchTrails: () => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    error: Error | null;
    setError: (error: Error | null) => void;
    owner_uuid: string | null;
    setOwnerUuid: (uuid: string | null) => void;
    type: string | null;
    setType: (type: string | null) => void;
    trail_uuid: string | null;
    setTrailUuid: (uuid: string | null) => void;
    version: number;
    setVersion: (index: number) => void;
};

// 創建一個 Context，初始值為 undefined（因為會在 Provider 裡面真正提供值）
const PolylineContext = createContext<PolylineContextType | undefined>(undefined);

// 寫一個 Provider 元件，讓外層可以包住整個應用，把這組 state 提供下去
export const PolylineProvider = ({ children }: { children: ReactNode }) => {
    // 宣告兩個 state，管理目前 hover 到的項目 ID 以及點選的 active 項目 ID
    const [hoverFeatureUuid, setHoverFeatureUuid] = useState<string | null>(null);
    const [activeFeatureUuid, setActiveFeatureUuid] = useState<string | null>(null);
    // const [editFeatureUuid, setEditFeatureUuid] = useState<string | null>(null);
    const [activeFeature, setActiveFeature] = useState<Feature | null>(null);
    const [deleteFeatureUuid, setDeleteFeatureUuid] = useState<string | null>(null);

    const [trails, setTrails] = useState<FeatureCollection | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [owner_uuid, setOwnerUuid] = useState<string | null>(null);
    const [type, setType] = useState<string | null>(null);
    const [trail_uuid, setTrailUuid] = useState<string | null>(null);
    const [version, setVersion] = useState(0);
    const lastKeyRef = useRef<string | null>(null);

    const fetchTrails = async () => {
        if (!owner_uuid || !type) return;
        console.log(owner_uuid, type, trail_uuid);
        const key = `${owner_uuid}_${type}_${trail_uuid || 'all'}_${version}`;
        console.log(key);
        if (lastKeyRef.current === key) return; // 資料沒變就不再 fetch
        lastKeyRef.current = key; // 記住這次的 key

        setLoading(true);
        setError(null);

        let url = `${import.meta.env.VITE_API_URL}/trails?owner_uuid=${owner_uuid}&type=${type}`;
        if (trail_uuid) url += `&uuid=${trail_uuid}`;

        try {
            const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            const data = await res.json();
            setTrails(data);
        } catch (err) {
            console.error('trails 抓取錯誤:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrails();
    }, [owner_uuid, type, trail_uuid, version]);

    // 把這些 state 綁定到 PolylineContext.Provider 上，這樣被包住的所有 component 就都能使用了
    return (
        <PolylineContext.Provider
            value={{
                hoverFeatureUuid,
                setHoverFeatureUuid,
                activeFeatureUuid,
                setActiveFeatureUuid,
                activeFeature,
                setActiveFeature,
                deleteFeatureUuid,
                setDeleteFeatureUuid,
                trails,
                setTrails,
                fetchTrails,
                loading,
                setLoading,
                error,
                setError,
                owner_uuid,
                setOwnerUuid,
                type,
                setType,
                trail_uuid,
                setTrailUuid,
                version,
                setVersion,
            }}>
            {children}
        </PolylineContext.Provider>
    );
};

// 自定義 hook usePolyline()，讓你在 component 裡可以用得像 useState 一樣直覺。
export const usePolyline = () => {
    const context = useContext(PolylineContext);

    // 如果沒包在 Provider 裡就會直接拋錯，幫你 catch bug
    if (!context) throw new Error('usePolyline 必須包在 <PolylineProvider> 內');
    return context;
};
