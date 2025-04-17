// import { useState, useMemo } from 'react';
// import type { FeatureCollection } from 'geojson';

// export function useTable(geojson: FeatureCollection | null, itemsPerPage = 50) {
//     const features = useMemo(() => geojson?.features ?? [], [geojson]);
//     const [currentPage, setCurrentPage] = useState(1);

//     const startIndex = useMemo(() => {
//         return (currentPage - 1) * itemsPerPage;
//     }, [currentPage, itemsPerPage]);

//     const currentPageData = useMemo(() => {
//         return features.slice(startIndex, startIndex + itemsPerPage);
//     }, [features, startIndex, itemsPerPage]);

//     const totalPages = useMemo(() => {
//         return Math.ceil(features.length / itemsPerPage);
//     }, [features, itemsPerPage]);

//     const handlePageChange = (page: number) => {
//         if (page >= 1 && page <= totalPages) {
//             setCurrentPage(page);
//         }
//     };

//     const IdToPage = (id: number | null) => {
//         if (id === null) return;
//         const index = features.findIndex((f) => f.properties?.id === id);
//         if (index === -1) return;
//         const page = Math.floor(index / itemsPerPage) + 1;
//         setCurrentPage(page);
//     };

//     return {
//         currentPage,
//         setCurrentPage,
//         totalPages,
//         handlePageChange,
//         currentPageData,
//         startIndex,
//         IdToPage,
//     };
// }
