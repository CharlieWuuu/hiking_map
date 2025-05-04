import styles from './Data_All.module.scss'; // 引入樣式
import { usePolyline } from '../../context/PolylineContext';
import { useTableContext } from '../../context/TableContext';
import { useRef, useEffect, useState } from 'react';
import { useModal } from '../../context/ModalContext';
import { usePatchData } from '../../context/PatchDataContext';
import Pagination from '../../assets/images/Table_Pagination.svg';
import { useParams } from 'react-router-dom';
import Data_Detail from './Data_Detail';
import { useOwnerDetail } from '../../hooks/useOwnerDetail';
import { useTrails } from '../../hooks/useTrails';
import { FeatureCollection } from 'geojson';

type patchData = {
    name: string;
    county: string;
    town: string;
    time: string;
    url: string[];
    note: string;
    public: boolean;
};

type Props = {
    trails: FeatureCollection | null;
};
// 定義元件
export default function Data_All({ trails }: Props) {
    const { hoverFeatureUuid, setHoverFeatureUuid, activeFeatureUuid, setActiveFeatureUuid, editFeatureUuid, setEditFeatureUuid, setDeleteFeatureUuid } = usePolyline();
    const { currentPage, setCurrentPage, startIndex, currentPageData, totalPages } = useTableContext();

    const { name, type, mode } = useParams<{ name: string; type: string; mode: string }>();
    const { owner } = useOwnerDetail({ name: name!, type: type! });
    const { fetchTrails } = useTrails({ uuid: owner?.uuid ?? '', type: type! });
    const itemsPerPage = 50; // 每頁顯示的項目數

    const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

    useEffect(() => {
        if (activeFeatureUuid !== null && rowRefs.current[activeFeatureUuid]) {
            rowRefs.current[activeFeatureUuid]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [currentPage, activeFeatureUuid]);

    const features = trails?.features; // 取得 geojson 中的 features
    const pageIndexStart = startIndex + 1;
    const pageIndexEnd = Math.min(startIndex + itemsPerPage, features?.length ?? 0);
    const { modalIsOpen, setModalIsOpen, setModalType } = useModal();
    const { patchData, setPatchData } = usePatchData();
    const patchProperties = async () => {
        try {
            const baseURL = import.meta.env.VITE_API_URL;
            const res = await fetch(`${baseURL}/trails/${editFeatureUuid}/properties`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(patchData),
            });

            const result = await res.json();
            if (result.success) {
                setModalType('complete');
                setModalIsOpen(true);
                setActiveFeatureUuid(null);
                setEditFeatureUuid(null);
                fetchTrails();
                setPatchData(null);
            } else {
                alert('上傳失敗');
            }
        } catch (err) {
            console.error(err);
            alert('錯誤：無法上傳');
        }
    };

    const [selectedFormat, setSelectedFormat] = useState('下載');
    const handleExport = async (type: string) => {
        setSelectedFormat('loading');
        const baseURL = import.meta.env.VITE_API_URL;
        const res = await fetch(`${baseURL}/trails/export?type=${type}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trails.${type}`;
        a.click();
        URL.revokeObjectURL(url);
        setSelectedFormat('placeholder');
    };

    return (
        <div className={`${styles.Panel_Data_All} ${styles.Panel_Edit}`}>
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
                            setModalIsOpen(!modalIsOpen);
                            setModalType('file_upload');
                        }}>
                        新增
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
                        {/* 更新時沒反應 */}
                        {currentPageData.map((feature, index) => (
                            <>
                                {activeFeatureUuid !== feature.properties?.uuid && (
                                    <tr key={index} onClick={() => setActiveFeatureUuid(activeFeatureUuid === feature.properties?.uuid ? null : feature.properties?.uuid)}>
                                        <td>{feature.properties?.id}</td>
                                        <td>{feature.properties?.name}</td>
                                        <td>{feature.properties?.county ?? '-'}</td>
                                        <td>{feature.properties?.town ?? '-'}</td>
                                        <td>
                                            {(() => {
                                                const date = new Date(feature.properties?.time);
                                                const year = date.getFullYear();
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                return `${year}年${month}月`;
                                            })()}
                                        </td>
                                    </tr>
                                )}

                                {activeFeatureUuid === feature.properties?.uuid && (
                                    <tr className={`${styles.Table_detail} ${activeFeatureUuid === feature.properties?.uuid ? styles.active : ''}`}>
                                        <td colSpan={5}>
                                            <Data_Detail trails={activeFeatureUuid === feature.properties?.uuid ? feature.properties : null} />
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
