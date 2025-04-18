import type { UIPanels } from '../types/uiPanels';
import { useState, useContext, createContext, ReactNode } from 'react';

type PanelContextType = {
    uiPanels: UIPanels;
    setUIPanels: React.Dispatch<React.SetStateAction<UIPanels>>;
};

const PanelContext = createContext<PanelContextType | undefined>(undefined);

export const PanelProvider = ({ children }: { children: ReactNode }) => {
    const [uiPanels, setUIPanels] = useState<UIPanels>({
        data: true,
        detail: false,
        auth: false,
        info: false,
        edit: false,
    });

    return <PanelContext.Provider value={{ uiPanels, setUIPanels }}>{children}</PanelContext.Provider>;
};

export const usePanel = () => {
    const context = useContext(PanelContext);
    if (!context) throw new Error('usePanel 必須包在 <PanelProvider> 內');
    return context;
};
