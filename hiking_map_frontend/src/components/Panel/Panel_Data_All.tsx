import type { FeatureCollection } from 'geojson'; // 引入 geojson 模組
import styles from './Panel_Data_All.module.scss'; // 引入樣式
import { usePolyline } from '../../context/PolylineContext';
import { usePanel } from '../../context/PanelContext';
import { useTableContext } from '../../context/TableContext';
import { useRef, useEffect } from 'react';

// 定義參數
type Props = {
    geojson?: FeatureCollection | null;
};

// 定義元件
export default function Panel_Data_All({ geojson }: Props) {
    const itemsPerPage = 50; // 每頁顯示的項目數
    const { hoverFeatureId, setHoverFeatureId, activeFeatureId, setActiveFeatureId } = usePolyline();
    const { setUIPanels } = usePanel();
    const { currentPage, setCurrentPage, startIndex, currentPageData, totalPages } = useTableContext();
    const rowRefs = useRef<{ [key: number]: HTMLTableRowElement | null }>({});
    useEffect(() => {
        if (activeFeatureId !== null && rowRefs.current[activeFeatureId]) {
            rowRefs.current[activeFeatureId]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center', // 可改為 'center' 看你喜好
            });
        }
    }, [activeFeatureId]);

    if (!geojson) {
        return (
            <div className={`${styles.Panel_Data_All} ${styles.onLoading}`}>
                <span className={styles.loader}></span>
            </div>
        );
    }
    const features = geojson?.features; // 取得 geojson 中的 features
    const pageIndexStart = startIndex + 1;
    const pageIndexEnd = Math.min(startIndex + itemsPerPage, features.length);

    return (
        <div className={styles.Panel_Data_All}>
            <div className={styles.Table_Pagination}>
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                    上一頁
                </button>
                <span>
                    第 {pageIndexStart} - {pageIndexEnd} 筆
                </span>
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                    下一頁
                </button>
            </div>
            <div className={styles.Table_ScrollWrapper}>
                <table cellSpacing="0">
                    {/* 表頭 */}
                    <thead>
                        <tr>
                            <th className={styles.Table_id}>#</th>
                            <th>名稱</th>
                            <th>縣市</th>
                            <th>鄉鎮</th>
                            <th>時間</th>
                        </tr>
                    </thead>
                    {/* 表身 */}
                    <tbody>
                        {/* 更新時沒反應 */}
                        {currentPageData.map((feature, index) => (
                            <tr
                                ref={(el) => {
                                    if (feature.properties?.id !== undefined) {
                                        rowRefs.current[feature.properties.id] = el;
                                    }
                                }}
                                className={`${hoverFeatureId === feature.properties?.id ? styles.hover : ''} ${activeFeatureId === feature.properties?.id ? styles.active : ''}`.trim()}
                                key={index}
                                onMouseEnter={() => setHoverFeatureId(feature.properties?.id)}
                                onMouseLeave={() => setHoverFeatureId(null)}
                                onClick={() => {
                                    activeFeatureId !== feature.properties?.id && setActiveFeatureId(feature.properties?.id);
                                    activeFeatureId !== feature.properties?.id && setUIPanels((prev) => ({ ...prev, detail: true }));

                                    activeFeatureId === feature.properties?.id && setActiveFeatureId(null);
                                    activeFeatureId === feature.properties?.id && setUIPanels((prev) => ({ ...prev, detail: false }));
                                }}>
                                <td className={styles.Table_id}>{feature.properties?.id}</td>
                                <td className={styles.Table_name}>{feature.properties?.name}</td>
                                <td className={styles.Table_county}>{feature.properties?.county}</td>
                                <td className={styles.Table_town}>{feature.properties?.town}</td>
                                <td className={styles.Table_time}>
                                    {(() => {
                                        const date = new Date(feature.properties?.time);
                                        const year = date.getFullYear();
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        return `${year}年${month}月`;
                                    })()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
