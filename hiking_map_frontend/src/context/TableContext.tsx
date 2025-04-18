import type { FeatureCollection } from 'geojson';
import { createContext, useContext, useMemo, useState } from 'react';
import { useGeojson } from './GeojsonContext';

type TableProviderProps = {
    children: React.ReactNode;
};

type TableContextType = {
    currentPage: number;
    setCurrentPage: (page: number) => void;
    startIndex: number;
    currentPageData: any[];
    totalPages: number;
    IdToPage: (id: number | null) => void;
    setFeatures: (f: any[]) => void;
};

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider = ({ children }: TableProviderProps) => {
    const { geojson } = useGeojson();
    const [features, setFeatures] = useState<FeatureCollection['features']>(geojson?.features ?? []);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const startIndex = useMemo(() => (currentPage - 1) * itemsPerPage, [currentPage]);
    const currentPageData = useMemo(() => features.slice(startIndex, startIndex + itemsPerPage), [features, startIndex]);
    const totalPages = useMemo(() => Math.ceil(features.length / itemsPerPage), [features]);

    const IdToPage = (id: number | null) => {
        if (id === null) return;
        const index = features.findIndex((f) => f.properties?.id === id);
        if (index === -1) return;
        const page = Math.floor(index / itemsPerPage) + 1;
        setCurrentPage(page);
    };

    return <TableContext.Provider value={{ currentPage, setCurrentPage, startIndex, currentPageData, totalPages, IdToPage, setFeatures }}>{children}</TableContext.Provider>;
};

export const useTableContext = () => {
    const ctx = useContext(TableContext);
    if (!ctx) throw new Error('useTableContext 必須包在 TableProvider 中使用');
    return ctx;
};
