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
    const { setHoverFeatureUuid, activeFeatureUuid, setActiveFeatureUuid, editFeatureUuid, setEditFeatureUuid, setDeleteFeatureUuid } = usePolyline();
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
    }, [activeFeatureUuid]);

    const features = geojson?.features; // 取得 geojson 中的 features
    const pageIndexStart = startIndex + 1;
    const pageIndexEnd = Math.min(startIndex + itemsPerPage, features?.length ?? 0);
    const { modalIsOpen, setModalIsOpen, setModalType } = useModal();

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
                <button
                    onClick={() => {
                        setModalIsOpen(!modalIsOpen);
                        setModalType('upload');
                    }}>
                    新增
                </button>
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
                            <th>{editFeatureUuid && '檔案'}</th>
                            <th>{editFeatureUuid && '操作'}</th>
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
                                className={`${activeFeatureUuid === feature.properties?.uuid ? styles.active : ''}`.trim()}
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
                                <td className={styles.Table_name}>
                                    {editFeatureUuid !== feature.properties?.uuid && feature.properties?.name}
                                    {editFeatureUuid === feature.properties?.uuid && <input type="text" defaultValue={feature.properties?.name} />}
                                </td>
                                <td className={styles.Table_length}>
                                    {editFeatureUuid !== feature.properties?.uuid && feature.properties?.length}
                                    {editFeatureUuid === feature.properties?.uuid && <input type="text" defaultValue={feature.properties?.length} />}
                                </td>
                                <td className={styles.Table_county}>
                                    {editFeatureUuid !== feature.properties?.uuid && (feature.properties?.county ?? '-')}
                                    {editFeatureUuid === feature.properties?.uuid && <input type="text" defaultValue={feature.properties?.county} />}
                                </td>
                                <td className={styles.Table_town}>
                                    {editFeatureUuid !== feature.properties?.uuid && (feature.properties?.town ?? '-')}
                                    {editFeatureUuid === feature.properties?.uuid && <input type="text" defaultValue={feature.properties?.town} />}
                                </td>
                                <td className={styles.Table_time}>
                                    {editFeatureUuid !== feature.properties?.uuid &&
                                        (() => {
                                            const date = new Date(feature.properties?.time);
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const day = String(date.getDate()).padStart(2, '0');
                                            return `${year}年${month}月${day}日`;
                                        })()}
                                    {editFeatureUuid === feature.properties?.uuid && <input type="date" defaultValue={new Date(feature.properties?.time).toISOString().split('T')[0]} />}
                                </td>
                                <td className={styles.Table_url}>
                                    {editFeatureUuid !== feature.properties?.uuid &&
                                        (Array.isArray(feature.properties?.url) && feature.properties?.url.length > 0 ? (
                                            feature.properties?.url.map((element: string, index: number) => (
                                                <div key={index}>
                                                    <a href={element} target="_blank" rel="noopener noreferrer">
                                                        連結-{index + 1}
                                                    </a>
                                                </div>
                                            ))
                                        ) : (
                                            <p>-</p>
                                        ))}
                                    {editFeatureUuid === feature.properties?.uuid && (
                                        <div>
                                            <input type="text" defaultValue="晚點做" />
                                            <button>新增</button>
                                        </div>
                                    )}
                                </td>
                                <td className={styles.Table_note}>
                                    {editFeatureUuid !== feature.properties?.uuid && (feature.properties?.note ?? '-')}
                                    {editFeatureUuid === feature.properties?.uuid && <input type="text" defaultValue={feature.properties?.note} />}
                                </td>

                                <td className={styles.Table_file}>{editFeatureUuid === feature.properties?.uuid && <button>檔案</button>}</td>

                                <td className={styles.Table_edit}>
                                    {editFeatureUuid !== feature.properties?.uuid && (
                                        <div>
                                            <button
                                                onClick={() => {
                                                    setActiveFeatureUuid(feature.properties?.uuid);
                                                    setEditFeatureUuid(feature.properties?.uuid);
                                                }}>
                                                編輯
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteFeatureUuid(feature.properties?.uuid);
                                                    setModalIsOpen(true);
                                                    setModalType('delete');
                                                }}>
                                                刪除
                                            </button>
                                        </div>
                                    )}
                                    {editFeatureUuid === feature.properties?.uuid && (
                                        <div>
                                            <button
                                                className={styles.cancel}
                                                onClick={(e) => {
                                                    setActiveFeatureUuid(null);
                                                    setEditFeatureUuid(null);
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
