import type { FeatureCollection } from 'geojson';
import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { usePolyline } from './PolylineContext';

type TableContextType = {
    currentPage: number;
    setCurrentPage: (page: number) => void;
    startIndex: number;
    currentPageData: any[];
    totalPages: number;
    setFeatures: (f: any[]) => void;
};

const TableContext = createContext<TableContextType | undefined>(undefined);

type Props = {
    children: React.ReactNode;
    features?: FeatureCollection['features'];
};

export const TableProvider = ({ children, features }: Props) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [internalFeatures, setInternalFeatures] = useState(features);

    const itemsPerPage = 50;
    const startIndex = useMemo(() => (currentPage - 1) * itemsPerPage, [currentPage]);
    const currentPageData = useMemo(() => internalFeatures?.slice(startIndex, startIndex + itemsPerPage) ?? [], [internalFeatures, startIndex]);
    const totalPages = useMemo(() => Math.ceil((internalFeatures?.length as number) / itemsPerPage), [internalFeatures]);
    const { activeFeatureUuid } = usePolyline();

    useEffect(() => {
        setInternalFeatures(features);
    }, [features]);

    useEffect(() => {
        if (activeFeatureUuid === null) return;
        const index = internalFeatures?.findIndex((f) => f.properties?.uuid === activeFeatureUuid);
        if (index === -1) return;
        const page = Math.floor((index as number) / itemsPerPage) + 1;
        setCurrentPage(page);
    }, [activeFeatureUuid]);

    return (
        <TableContext.Provider
            value={{
                currentPage,
                setCurrentPage,
                startIndex,
                currentPageData,
                totalPages,
                setFeatures: setInternalFeatures,
            }}>
            {children}
        </TableContext.Provider>
    );
};

export const useTableContext = () => {
    const ctx = useContext(TableContext);
    if (!ctx) throw new Error('useTableContext 必須包在 TableProvider 中使用');
    return ctx;
};
