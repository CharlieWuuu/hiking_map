import { create } from 'zustand'; // 匯入 create 函式

// 1. 定義 Store 的狀態 (State) 型別
interface TrailUIState {
    hoverFeatureUuid: string | null; // 你的 hover 狀態
    activeFeatureUuid: string | null; // 你的 active 狀態
}

// 2. 定義 Store 的動作 (Actions) 型別
interface TrailUIActions {
    setHoverFeatureUuid: (id: string | null) => void; // 設定 hover 狀態的函式
    setActiveFeatureUuid: (id: string | null) => void; // 設定 active 狀態的函式
}

// 3. 將 State 和 Actions 組合起來，形成完整的 Store 型別
type TrailUIStore = TrailUIState & TrailUIActions;

// 4. 使用 create 函式創建你的 Zustand Store
export const useTrailUIStore = create<TrailUIStore>((set, get) => ({
    // 初始化狀態 (相當於你的 useState 的初始值)
    hoverFeatureUuid: null,
    activeFeatureUuid: null,

    // 定義 Actions (這些函式將負責更新狀態)
    setHoverFeatureUuid: (id) => set({ hoverFeatureUuid: id }), // 直接設定狀態
    setActiveFeatureUuid: (id) => set({ activeFeatureUuid: id }), // 直接設定狀態
}));
