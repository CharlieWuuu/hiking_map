import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type FullScreenProviderProps = {
    children: React.ReactNode;
};

type FullScreenContextType = {
    isFullScreen: boolean;
    setFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
};

const FullScreenContext = createContext<FullScreenContextType | undefined>(undefined);

export const FullScreenProvider = ({ children }: FullScreenProviderProps) => {
    const [isFullScreen, setFullScreen] = useState(false);
    const location = useLocation();
    const FullScreenPaths = ['/data'];
    const hasFullScreenPaths = FullScreenPaths.some((path) => location.pathname.includes(path));
    useEffect(() => {
        setFullScreen(hasFullScreenPaths);
    }, [location]);

    return <FullScreenContext.Provider value={{ isFullScreen, setFullScreen }}>{children}</FullScreenContext.Provider>;
};

export const useFullScreenContext = () => {
    const ctx = useContext(FullScreenContext);
    if (!ctx) throw new Error('useFullScreenContext 必須包在 FullScreenProvider 中使用');
    return ctx;
};
