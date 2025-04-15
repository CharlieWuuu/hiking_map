import type { FeatureCollection } from 'geojson'; // 引入 geojson 模組
import { useState } from 'react'; // 引入 useState
import styles from './Panel_Data_All.module.scss'; // 引入樣式
import { usePolyline } from '../../context/PolylineContext';

// 定義參數
type Props = {
    geojson?: FeatureCollection | null;
    setPanToId?: (id: number | null) => void;
};

// 定義元件
export default function Panel_Data_All({ geojson }: Props) {
    const [currentPage, setCurrentPage] = useState(1); // 當前頁數，預設為第 1 頁
    const itemsPerPage = 50; // 每頁顯示的項目數
    const { hoverFeatureId, setHoverFeatureId, activeFeatureId, setActiveFeatureId } = usePolyline();

    // 檢查 geojson 是否為 null，如果為 null 表示資料還未讀取
    if (!geojson) {
        return (
            <div className={`${styles.Panel_Data_All} ${styles.onLoading}`}>
                <span className={styles.loader}></span>
            </div>
        );
    }

    const features = geojson.features; // 取得 geojson 中的 features
    const totalPages = Math.ceil(features.length / itemsPerPage); // 計算總頁數，向上取整數，目前 136 筆所以總共 14 頁

    // 處理頁數變化的邏輯
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page); // 如果不是第 1 頁或最後一頁，則更新當前頁數，＊＊＊更新了這個以後，就會自動更新 currentPageData 嗎？？？＊＊＊
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage; // 計算當前頁數的起始索引，例如：位於第 1 頁則為 0
    const currentPageData = features.slice(startIndex, startIndex + itemsPerPage); // 計算當前頁數的資料，例如：從 features 取得從 0 到 0 + 10 (itemsPerPage) 的資料
    const pageIndexStart = startIndex + 1;
    const pageIndexEnd = startIndex + itemsPerPage > features.length ? features.length : startIndex + itemsPerPage;

    return (
        <div className={styles.Panel_Data_All}>
            <div className={styles.Table_Pagination}>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    上一頁
                </button>
                <span>
                    第 {pageIndexStart} - {pageIndexEnd} 筆
                </span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
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
                        {currentPageData.map((feature, index) => (
                            <tr
                                className={`${hoverFeatureId === feature.properties?.id ? styles.hover : ''} ${activeFeatureId === feature.properties?.id ? styles.active : ''}`.trim()}
                                key={index}
                                onMouseEnter={() => setHoverFeatureId(feature.properties?.id)}
                                onMouseLeave={() => setHoverFeatureId(null)}
                                onClick={() => {
                                    activeFeatureId !== feature.properties?.id && setActiveFeatureId(feature.properties?.id);

                                    activeFeatureId === feature.properties?.id && setActiveFeatureId(null);
                                }}>
                                <td className={styles.Table_id}>{feature.properties?.id}</td>
                                <td className={styles.Table_name}>{feature.properties?.name}</td>
                                <td className={styles.Table_county}>{feature.properties?.county}</td>
                                <td className={styles.Table_town}>{feature.properties?.town}</td>
                                <td className={styles.Table_time}>{feature.properties?.time.split('月')[0] + '月'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
