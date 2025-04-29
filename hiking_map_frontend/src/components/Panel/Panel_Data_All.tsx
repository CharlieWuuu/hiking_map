import styles from './Panel_Data_All.module.scss'; // 引入樣式
import { usePolyline } from '../../context/PolylineContext';
import { usePanel } from '../../context/PanelContext';
import { useTableContext } from '../../context/TableContext';
import { useRef, useEffect } from 'react';
import { useGeojson } from '../../context/GeojsonContext';
import SearchData from '../Search/SearchData'; // 引入搜尋元件
import Pagination from '../../assets/images/Table_Pagination.svg';

// 定義元件
export default function Panel_Data_All() {
    const { geojson } = useGeojson();
    const itemsPerPage = 50; // 每頁顯示的項目數
    const { hoverFeatureUuid, setHoverFeatureUuid, activeFeatureUuid, setActiveFeatureUuid } = usePolyline();
    const { setUIPanels } = usePanel();
    const { currentPage, setCurrentPage, startIndex, currentPageData, totalPages } = useTableContext();
    const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

    useEffect(() => {
        if (activeFeatureUuid !== null && rowRefs.current[activeFeatureUuid]) {
            rowRefs.current[activeFeatureUuid]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [currentPage, activeFeatureUuid]);

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
            <div className={styles.Table_Header}>
                <div className={styles.Table_Pagination}>
                    <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                        <img src={Pagination} alt="上一頁" style={{ transform: 'rotate(180deg)' }} />
                    </button>
                    <span>
                        {pageIndexStart} - {pageIndexEnd}
                    </span>
                    <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                        <img src={Pagination} alt="下一頁" />
                    </button>
                </div>
                <SearchData />
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
                                    if (feature.properties?.uuid !== undefined) {
                                        rowRefs.current[feature.properties.uuid] = el;
                                    }
                                }}
                                className={`${hoverFeatureUuid === feature.properties?.uuid ? styles.hover : ''} ${activeFeatureUuid === feature.properties?.uuid ? styles.active : ''}`.trim()}
                                key={index}
                                onMouseEnter={() => setHoverFeatureUuid(feature.properties?.uuid)}
                                onMouseLeave={() => setHoverFeatureUuid(null)}
                                onClick={() => {
                                    activeFeatureUuid !== feature.properties?.uuid && setActiveFeatureUuid(feature.properties?.uuid);
                                    activeFeatureUuid !== feature.properties?.uuid && setUIPanels((prev) => ({ ...prev, detail: true }));

                                    activeFeatureUuid === feature.properties?.uuid && setActiveFeatureUuid(null);
                                    activeFeatureUuid === feature.properties?.uuid && setUIPanels((prev) => ({ ...prev, detail: false }));
                                }}>
                                <td className={styles.Table_id}>{feature.properties?.id}</td>
                                <td className={styles.Table_name}>{feature.properties?.name}</td>
                                <td className={styles.Table_county}>{feature.properties?.county ?? '-'}</td>
                                <td className={styles.Table_town}>{feature.properties?.town ?? '-'} </td>
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
