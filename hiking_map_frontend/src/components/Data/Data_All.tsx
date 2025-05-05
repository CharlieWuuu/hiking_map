import styles from './Data_All.module.scss'; // 引入樣式
import { usePolyline } from '../../context/PolylineContext';
import { useTableContext } from '../../context/TableContext';
import { useRef, useEffect, useState, Fragment } from 'react';
import { useModal } from '../../context/ModalContext';
import Pagination from '../../assets/images/Table_Pagination.svg';
import { useSearchParams } from 'react-router-dom';
import Data_Detail from './Data_Detail';
import Close from '../../assets/images/Panel_ClosePanel.svg';
import { usePatchData } from '../../context/PatchDataContext';
import { useParams } from 'react-router-dom';
import { useOwnerDetail } from '../../hooks/useOwnerDetail';

// 定義元件
export default function Data_All() {
    const { loading, trails } = usePolyline();
    const { hoverFeatureUuid, setHoverFeatureUuid, activeFeatureUuid, setActiveFeatureUuid, setActiveFeature, version } = usePolyline();
    const { currentPage, setCurrentPage, startIndex, currentPageData, totalPages } = useTableContext();
    const { setPatchData } = usePatchData();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode');
    const itemsPerPage = 50; // 每頁顯示的項目數

    const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
    useEffect(() => {
        if (activeFeatureUuid !== null && rowRefs.current[activeFeatureUuid]) {
            rowRefs.current[activeFeatureUuid]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentPage, activeFeatureUuid]);

    const features = trails?.features; // 取得 geojson 中的 features
    const pageIndexStart = startIndex + 1;
    const pageIndexEnd = Math.min(startIndex + itemsPerPage, features?.length ?? 0);
    const { setModalIsOpen, setModalType } = useModal();

    const [selectedFormat, setSelectedFormat] = useState('下載');
    const { name, type } = useParams<{ name: string; type: string }>();
    const { owner } = useOwnerDetail({ name: name!, type: type! });
    const handleExport = async (type: string) => {
        setSelectedFormat('loading');
        const baseURL = import.meta.env.VITE_API_URL;
        const res = await fetch(`${baseURL}/trails/export?type=${type}&owner_uuid=${owner?.uuid}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trails.${type}`;
        a.click();
        URL.revokeObjectURL(url);
        setSelectedFormat('placeholder');
    };

    const [onLoading, setOnLoading] = useState(false);
    useEffect(() => {
        if (trails === null || loading) {
            setOnLoading(true);
        } else {
            setOnLoading(false);
            setModalIsOpen(false);
        }
    }, [trails, version, loading]);

    return (
        <div className={`${styles.Panel_Data_All} ${onLoading ? styles.onLoading : ''}`}>
            <div className={styles.loader}></div>
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
                {mode === 'edit' && <hr />}
                {mode === 'edit' && (
                    <button
                        onClick={() => {
                            setModalIsOpen(true);
                            setModalType('file_upload');
                        }}>
                        <img src={Close} alt="新增" style={{ transform: 'rotate(45deg)' }} />
                    </button>
                )}
                {mode === 'edit' && (
                    <select
                        value={selectedFormat}
                        onChange={(e) => {
                            setSelectedFormat(e.target.value);
                            handleExport(e.target.value);
                        }}>
                        <option value="placeholder" style={{ display: 'none' }}>
                            下載
                        </option>
                        <option value="loading" style={{ display: 'none' }}>
                            下載中...
                        </option>
                        <option value="geojson">GeoJSON</option>
                        <option value="gpx">GPX</option>
                        <option value="csv">CSV</option>
                    </select>
                )}
            </div>
            <div className={styles.Table_ScrollWrapper}>
                <table cellSpacing="0">
                    {/* 表頭 */}
                    <thead>
                        <tr>
                            <th className={styles.Table_id}>#</th>
                            <th>名稱</th>
                            {/* <th>長度</th> */}
                            <th>縣市</th>
                            <th>鄉鎮</th>
                            <th>時間</th>
                            {/* <th>網址</th>
                            <th>公開</th>
                            <th>備註</th> */}
                            {/* <th>{editFeatureUuid && '檔案'}</th>
                            <th>{editFeatureUuid && '操作'}</th> */}
                        </tr>
                    </thead>
                    {/* 表身 */}
                    <tbody>
                        {currentPageData.map((feature, index) => (
                            <Fragment key={feature.properties?.uuid ?? index}>
                                {activeFeatureUuid !== feature.properties?.uuid && (
                                    <tr
                                        ref={(el) => {
                                            if (feature.properties?.uuid) {
                                                rowRefs.current[feature.properties.uuid] = el;
                                            }
                                        }}
                                        className={`${hoverFeatureUuid === feature.properties?.uuid ? styles.hover : ''} ${activeFeatureUuid === feature.properties?.uuid ? styles.active : ''} ${feature.properties?.public ? '' : styles.private}`}
                                        onMouseEnter={() => setHoverFeatureUuid(feature.properties?.uuid)}
                                        onMouseLeave={() => setHoverFeatureUuid(null)}
                                        onClick={() => {
                                            setActiveFeature(feature);
                                            const uuid = activeFeatureUuid === feature.properties?.uuid ? null : feature.properties?.uuid;
                                            setActiveFeatureUuid(uuid);
                                            setPatchData(null);
                                        }}>
                                        <td className={styles.Table_id}>{feature.properties?.id}</td>
                                        <td className={styles.Table_name}>{feature.properties?.name}</td>
                                        <td className={styles.Table_county}>{feature.properties?.county ?? '-'}</td>
                                        <td className={styles.Table_town}>{feature.properties?.town ?? '-'}</td>
                                        <td className={styles.Table_time}>
                                            {(() => {
                                                const date = new Date(feature.properties?.time);
                                                const year = date.getFullYear();
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const day = String(date.getDate()).padStart(2, '0');
                                                return `${year}/${month}/${day}`;
                                            })()}
                                        </td>
                                    </tr>
                                )}

                                {activeFeatureUuid === feature.properties?.uuid && (
                                    <tr
                                        ref={(el) => {
                                            if (feature.properties?.uuid) {
                                                rowRefs.current[feature.properties.uuid] = el;
                                            }
                                        }}
                                        className={`${activeFeatureUuid === feature.properties?.uuid ? styles.edit : ''}`}
                                        onClick={(e) => {
                                            const target = e.target as HTMLElement;
                                            const tag = target.tagName.toLowerCase();
                                            if (['button', 'input', 'a', 'select', 'textarea', 'img'].includes(tag)) return;
                                            setActiveFeatureUuid(null); // 展開或其他父層邏輯
                                        }}>
                                        <td className={styles.Table_detail} colSpan={5}>
                                            <Data_Detail trails={activeFeatureUuid === feature.properties?.uuid ? feature.properties : null} />
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
