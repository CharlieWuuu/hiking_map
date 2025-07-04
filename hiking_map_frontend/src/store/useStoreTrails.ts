// src/store/useTrailsStore.ts
import { create } from 'zustand';
import { FeatureCollection } from 'geojson'; // 假設你用 geojson 的型別

// 定義 Store 的狀態型別
interface TrailsState {
    data: FeatureCollection | null;
    loading: boolean;
    error: Error | null;
    owner_uuid: string | null;
    type: string | null;
    trail_uuid: string | null;
    version: number;
    share: string | null;

    // actions
    setOwnerUuid: (uuid: string | null) => void;
    setType: (type: string | null) => void;
    setTrailUuid: (uuid: string | null) => void;
    setVersion: (index: number) => void;
    setShare: (friend: string | null) => void;
    fetchTrails: () => Promise<void>; // fetchTrails 是一個非同步動作
}

// 創建 Zustand Store
export const useTrailsStore = create<TrailsState>((set, get) => ({
    // 初始狀態
    data: null,
    loading: false,
    error: null,
    owner_uuid: null,
    type: null,
    trail_uuid: null,
    version: 0,
    share: null,

    // Actions
    setOwnerUuid: (uuid) => set({ owner_uuid: uuid }),
    setType: (t) => set({ type: t }),
    setTrailUuid: (uuid) => set({ trail_uuid: uuid }),
    setVersion: (index) => set({ version: index }),
    setShare: (friend) => set({ share: friend }),

    fetchTrails: async () => {
        const { owner_uuid, type, trail_uuid, version, share, data: currentData } = get(); // 使用 get() 獲取當前狀態

        if (!owner_uuid || !type) {
            console.log('Missing owner_uuid or type, skipping fetch.');
            return;
        }

        // 可以自行實現 lastKeyRef 類似的邏輯，或者讓組件層控制呼叫時機
        // const key = `${owner_uuid}_${type}_${trail_uuid || 'all'}_${version}`;
        // if (get()._lastFetchKey === key) return; // 假設你在 store 裡也存了這個 key

        set({ loading: true, error: null }); // 設定載入狀態

        let url = `${import.meta.env.VITE_API_URL}/trails?owner_uuid=${owner_uuid}&type=${type}`;
        if (trail_uuid) url += `&uuid=${trail_uuid}`;
        if (share) url += `&share=${share}`;

        try {
            const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data: FeatureCollection = await res.json();
            set({ data: data, loading: false }); // 更新數據並關閉載入狀態
        } catch (err) {
            console.error('trails 抓取錯誤:', err);
            set({ error: err as Error, loading: false, data: null }); // 設定錯誤訊息並關閉載入狀態
        }
    },
}));
