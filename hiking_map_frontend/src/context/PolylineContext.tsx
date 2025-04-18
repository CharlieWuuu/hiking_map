// 匯入 React 的核心 hook 和型別，ReactNode 是用來定義 children 的型別
import { createContext, useContext, useState, ReactNode } from 'react';

// 定義這個 context 的資料格式，包含兩組 state（hover 和 active）與對應的 set 函式
type PolylineContextType = {
    hoverFeatureId: number | null;
    setHoverFeatureId: (id: number | null) => void;
    activeFeatureId: number | null;
    setActiveFeatureId: (id: number | null) => void;
    editFeatureId: number | null;
    setEditFeatureId: (id: number | null) => void;
};

// 創建一個 Context，初始值為 undefined（因為會在 Provider 裡面真正提供值）
const PolylineContext = createContext<PolylineContextType | undefined>(undefined);

// 寫一個 Provider 元件，讓外層可以包住整個應用，把這組 state 提供下去
export const PolylineProvider = ({ children }: { children: ReactNode }) => {
    // 宣告兩個 state，管理目前 hover 到的項目 ID 以及點選的 active 項目 ID
    const [hoverFeatureId, setHoverFeatureId] = useState<number | null>(null);
    const [activeFeatureId, setActiveFeatureId] = useState<number | null>(null);
    const [editFeatureId, setEditFeatureId] = useState<number | null>(null);

    // 把這些 state 綁定到 PolylineContext.Provider 上，這樣被包住的所有 component 就都能使用了
    return <PolylineContext.Provider value={{ hoverFeatureId, setHoverFeatureId, activeFeatureId, setActiveFeatureId, editFeatureId, setEditFeatureId }}>{children}</PolylineContext.Provider>;
};

// 自定義 hook usePolyline()，讓你在 component 裡可以用得像 useState 一樣直覺。
export const usePolyline = () => {
    const context = useContext(PolylineContext);

    // 如果沒包在 Provider 裡就會直接拋錯，幫你 catch bug
    if (!context) throw new Error('usePolyline 必須包在 <PolylineProvider> 內');
    return context;
};
