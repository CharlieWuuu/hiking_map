import type { UIPanels } from '../types/uiPanels';
import { useState, useContext, createContext, ReactNode } from 'react';

type PanelContextType = {
    uiPanels: UIPanels;
    setUIPanels: React.Dispatch<React.SetStateAction<UIPanels>>;
    ZoomIn: boolean;
    setZoomIn: React.Dispatch<React.SetStateAction<boolean>>;
};

const PanelContext = createContext<PanelContextType | undefined>(undefined);

export const PanelProvider = ({ children }: { children: ReactNode }) => {
    const [uiPanels, setUIPanels] = useState<UIPanels>({
        data: true,
        auth: false,
        info: false,
        edit: false,
    });
    const [ZoomIn, setZoomIn] = useState(false);

    return <PanelContext.Provider value={{ uiPanels, setUIPanels, ZoomIn, setZoomIn }}>{children}</PanelContext.Provider>;
};

export const usePanel = () => {
    const context = useContext(PanelContext);
    if (!context) throw new Error('usePanel 必須包在 <PanelProvider> 內');
    return context;
};
