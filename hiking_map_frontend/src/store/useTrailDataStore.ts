import { create } from 'zustand';
import type { FeatureCollection } from 'geojson';
import { useTrailMetaStore } from './useTrailMetaStore';

interface TrailDataState {
    trails: FeatureCollection | null;
    setTrails: (data: FeatureCollection | null) => void;
    loading: boolean;
    error: Error | null;
    fetchTrails: () => Promise<void>;
    // _lastKey: string | null;
}

export const useTrailDataStore = create<TrailDataState>((set) => ({
    trails: null,
    setTrails: (data) => set({ trails: data }),
    loading: false,
    error: null,
    // _lastKey: null,

    fetchTrails: async () => {
        // 更新「loading 中」狀態，並清掉前一次 error
        set({ loading: true, error: null });

        // 先從「條件」store 抓目前的篩選條件（同步不 re-render）
        const { owner_uuid, type, trail_uuid, share } = useTrailMetaStore.getState();

        // 沒有 owner 或 type 就直接退出（這組條件不足）
        if (!owner_uuid || !type) return;

        // 組 API URL
        let url = `${import.meta.env.VITE_API_URL}/trails?owner_uuid=${owner_uuid}&type=${type}`;
        if (trail_uuid) url += `&uuid=${trail_uuid}`; // 找特定的路線
        if (share) url += `&share=${share}`; // 分享模式

        try {
            const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            const data = await res.json();
            set({ trails: data });
        } catch (err) {
            set({ error: err as Error });
        } finally {
            set({ loading: false });
        }
    },
}));
