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
    UuidToPage: (id: string | null) => void;
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

    const UuidToPage = (uuid: string | null) => {
        if (uuid === null) return;
        const index = features.findIndex((f) => f.properties?.uuid === uuid);
        if (index === -1) return;
        const page = Math.floor(index / itemsPerPage) + 1;
        setCurrentPage(page);
    };

    return <TableContext.Provider value={{ currentPage, setCurrentPage, startIndex, currentPageData, totalPages, UuidToPage, setFeatures }}>{children}</TableContext.Provider>;
};

export const useTableContext = () => {
    const ctx = useContext(TableContext);
    if (!ctx) throw new Error('useTableContext 必須包在 TableProvider 中使用');
    return ctx;
};
