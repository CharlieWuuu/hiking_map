import styles from './Panel_Data_All.module.scss'; // 引入樣式
import { usePolyline } from '../../context/PolylineContext';
import { usePanel } from '../../context/PanelContext';
import { useTableContext } from '../../context/TableContext';
import { useRef, useEffect } from 'react';
import { useGeojson } from '../../context/GeojsonContext';
import { useModal } from '../../context/ModalContext';

// 定義元件
export default function Panel_Edit() {
    const { geojson } = useGeojson();
    const itemsPerPage = 50; // 每頁顯示的項目數
    const { hoverFeatureId, setHoverFeatureId, activeFeatureId, setActiveFeatureId, editFeatureId, setEditFeatureId } = usePolyline();
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

    const features = geojson?.features; // 取得 geojson 中的 features
    const pageIndexStart = startIndex + 1;
    const pageIndexEnd = Math.min(startIndex + itemsPerPage, features?.length ?? 0);
    const { setUiModal } = useModal();

    return (
        <div className={`${styles.Panel_Data_All} ${styles.Panel_Edit}`}>
            <div className={styles.Table_Header}>
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
                <hr />
                <button onClick={() => setUiModal((prev) => ({ ...prev, upload: true }))}>新增</button>
            </div>
            <div className={styles.Table_ScrollWrapper}>
                <table cellSpacing="0">
                    {/* 表頭 */}
                    <thead>
                        <tr>
                            <th className={styles.Table_id}>#</th>
                            <th>名稱</th>
                            <th>長度</th>
                            <th>縣市</th>
                            <th>鄉鎮</th>
                            <th>時間</th>
                            <th>網址</th>
                            <th>備註</th>
                            <th></th>
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
                                <td className={styles.Table_name}>
                                    {editFeatureId !== feature.properties?.id && feature.properties?.name}
                                    {editFeatureId === feature.properties?.id && <input type="text" defaultValue={feature.properties?.name} />}
                                </td>
                                <td className={styles.Table_length}>
                                    {editFeatureId !== feature.properties?.id && feature.properties?.length}
                                    {editFeatureId === feature.properties?.id && <input type="text" defaultValue={feature.properties?.length} />}
                                </td>
                                <td className={styles.Table_county}>
                                    {editFeatureId !== feature.properties?.id && feature.properties?.county}
                                    {editFeatureId === feature.properties?.id && <input type="text" defaultValue={feature.properties?.county} />}
                                </td>
                                <td className={styles.Table_town}>
                                    {editFeatureId !== feature.properties?.id && feature.properties?.town}
                                    {editFeatureId === feature.properties?.id && <input type="text" defaultValue={feature.properties?.town} />}
                                </td>
                                <td className={styles.Table_time}>
                                    {editFeatureId !== feature.properties?.id &&
                                        (() => {
                                            const date = new Date(feature.properties?.time);
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const day = String(date.getDate()).padStart(2, '0');
                                            return `${year}年${month}月${day}日`;
                                        })()}
                                    {editFeatureId === feature.properties?.id && <input type="date" defaultValue={new Date(feature.properties?.time).toISOString().split('T')[0]} />}
                                </td>
                                <td className={styles.Table_url}>
                                    {editFeatureId !== feature.properties?.id &&
                                        (Array.isArray(feature.properties?.url) && feature.properties?.url.length > 0 ? (
                                            feature.properties?.url.map((element: string, index: number) => (
                                                <div key={index}>
                                                    <a href={element} target="_blank" rel="noopener noreferrer">
                                                        連結-{index + 1}
                                                    </a>
                                                </div>
                                            ))
                                        ) : (
                                            <p>無</p>
                                        ))}
                                    {editFeatureId === feature.properties?.id && (
                                        <div>
                                            <input type="text" defaultValue="aaa" />
                                            <button>新增</button>
                                        </div>
                                    )}
                                </td>
                                <td className={styles.Table_note}>
                                    {editFeatureId !== feature.properties?.id && feature.properties?.note}
                                    {editFeatureId === feature.properties?.id && <input type="text" defaultValue={feature.properties?.note} />}
                                </td>
                                <td className={styles.Table_edit}>
                                    {editFeatureId !== feature.properties?.id && (
                                        <div>
                                            <button
                                                onClick={() => {
                                                    setActiveFeatureId(feature.properties?.id);
                                                    setEditFeatureId(feature.properties?.id);
                                                }}>
                                                編輯
                                            </button>
                                            <button onClick={(e) => e.stopPropagation()}>刪除</button>
                                        </div>
                                    )}
                                    {editFeatureId === feature.properties?.id && (
                                        <div>
                                            <button
                                                className={styles.cancel}
                                                onClick={(e) => {
                                                    setActiveFeatureId(null);
                                                    setEditFeatureId(null);
                                                    e.stopPropagation();
                                                }}>
                                                取消
                                            </button>
                                            <button className={styles.save} onClick={(e) => e.stopPropagation()}>
                                                儲存
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
