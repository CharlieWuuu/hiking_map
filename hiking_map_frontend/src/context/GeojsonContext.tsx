import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { FeatureCollection } from 'geojson';

type GeojsonContextType = {
    geojson: FeatureCollection | null;
    setGeojson: (id: FeatureCollection | null) => void;
    refreshGeojson: () => void;
};

const GeojsonContext = createContext<GeojsonContextType | undefined>(undefined);

export const GeojsonProvider = ({ children }: { children: ReactNode }) => {
    const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
    const refreshGeojson = () => {
        fetch('http://localhost:3001/trails')
            .then((res) => res.json())
            .then((data: FeatureCollection) => setGeojson(data));
    };
    useEffect(() => {
        fetch('http://localhost:3001/trails')
            .then((res) => res.json())
            .then((data: FeatureCollection) => setGeojson(data));
    }, []);

    return <GeojsonContext.Provider value={{ geojson, setGeojson, refreshGeojson }}>{children}</GeojsonContext.Provider>;
};

export const useGeojson = () => {
    const context = useContext(GeojsonContext);

    if (!context) throw new Error('useGeojson 必須包在 <GeojsonProvider> 內');
    return context;
};
