import { create } from 'zustand'; // 匯入 create 函式

// 定義 Store 的狀態 (State) 型別
interface TrailUIStore {
    hoverFeatureUuid: string | null;
    setHoverFeatureUuid: (id: string | null) => void;
    activeFeatureUuid: string | null;
    setActiveFeatureUuid: (id: string | null) => void;
}

// 使用 create 函式創建你的 Zustand Store
export const useTrailUIStore = create<TrailUIStore>((set) => ({
    hoverFeatureUuid: null,
    setHoverFeatureUuid: (id) => set({ hoverFeatureUuid: id }),

    activeFeatureUuid: null,
    setActiveFeatureUuid: (id) => set({ activeFeatureUuid: id }),
}));
