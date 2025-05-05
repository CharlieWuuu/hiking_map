import { useState, useContext, createContext, ReactNode } from 'react';

type patchData = {
    name: string;
    county: string;
    town: string;
    time: string;
    url: string[];
    note: string;
    public: boolean;
    hundred_id: string | null;
    small_hundred_id: string | null;
    hundred_trail_id: string | null;
};

type PatchDataContextType = {
    patchData: patchData | null;
    setPatchData: React.Dispatch<React.SetStateAction<patchData | null>>;
};

const PatchDataContext = createContext<PatchDataContextType | undefined>(undefined);

export const PatchDataProvider = ({ children }: { children: ReactNode }) => {
    const [patchData, setPatchData] = useState<patchData | null>(null);

    return <PatchDataContext.Provider value={{ patchData, setPatchData }}>{children}</PatchDataContext.Provider>;
};

export const usePatchData = () => {
    const context = useContext(PatchDataContext);
    if (!context) throw new Error('usePatchData 必須包在 <PatchDataProvider> 內');
    return context;
};
