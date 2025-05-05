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
};

export const TableProvider = ({ children }: Props) => {
    const [currentPage, setCurrentPage] = useState(1);
    const { trails } = usePolyline();
    const features = trails?.features;
    const [Features, setFeatures] = useState(features);

    const itemsPerPage = 50;
    const startIndex = useMemo(() => (currentPage - 1) * itemsPerPage, [currentPage]);
    const currentPageData = useMemo(() => Features?.slice(startIndex, startIndex + itemsPerPage) ?? [], [Features, startIndex]);
    const totalPages = useMemo(() => Math.ceil((Features?.length as number) / itemsPerPage), [Features]);
    const { activeFeatureUuid } = usePolyline();

    useEffect(() => {
        setFeatures(features);
    }, [features]);

    useEffect(() => {
        if (activeFeatureUuid === null) return;
        const index = Features?.findIndex((f) => f.properties?.uuid === activeFeatureUuid);
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
                setFeatures,
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
