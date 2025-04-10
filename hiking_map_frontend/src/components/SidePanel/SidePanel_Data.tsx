import type { FeatureCollection } from 'geojson'; // 引入 geojson 模組
import { useState, useEffect, use } from 'react'; // 引入 useState
import styles from './SidePanel_Data.module.scss'; // 引入樣式

// 定義參數
type Props = {
    geojson: FeatureCollection | null;
    setPanToId: (id: number | null) => void;
    hoverFeatureId: number | null;
    setHoverFeatureId: (id: number | null) => void;
    activeFeatureId: number | null;
    setActiveFeatureId: (id: number | null) => void;
};

type Detail_Card = {
    name: string;
    county: string;
    town: string;
    time: string;
    url: string;
    note: string;
    id: number;
    length: number;
};

// 定義元件
export default function SidePanel_Data({ geojson, setPanToId, hoverFeatureId, setHoverFeatureId, activeFeatureId, setActiveFeatureId }: Props) {
    const [currentPage, setCurrentPage] = useState(1); // 當前頁數，預設為第 1 頁
    const itemsPerPage = 50; // 每頁顯示的項目數

    // 檢查 geojson 是否為 null，如果為 null 表示資料還未讀取
    if (!geojson) {
        return (
            <div>
                <h2>資料</h2>
                <div>資料讀取中...</div>
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

    const [onEdit, setOnEdit] = useState<boolean>(false);

    const [detailCard, setDetailCard] = useState<Detail_Card>({
        name: '',
        county: '',
        town: '',
        time: '',
        url: '',
        note: '',
        id: 0,
        length: 0,
    });

    useEffect(() => {
        if (!activeFeatureId) return;
        let TargetProperties = features[activeFeatureId - 1]?.properties;

        if (!TargetProperties) return;
        setDetailCard({
            name: TargetProperties.name ?? '',
            county: TargetProperties.county ?? '',
            town: TargetProperties.town ?? '',
            time: TargetProperties.time ?? '',
            url: TargetProperties.url ?? '',
            note: TargetProperties.note ?? '',
            id: TargetProperties.id ?? 0,
            length: TargetProperties.length ?? 0,
        });
    }, [activeFeatureId]);

    return (
        <div className={styles.SidePanel_Data}>
            <h2>資料</h2>
            <div className={styles.Main_Container}>
                <div style={{ marginTop: '1em' }}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        上一頁
                    </button>
                    <span style={{ margin: '0 1em' }}>
                        第 {startIndex + 1} - {startIndex + itemsPerPage > features.length ? features.length : startIndex + itemsPerPage} 筆
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
                                {/* <th>長度</th> */}
                                <th>縣市</th>
                                <th>鄉鎮</th>
                                <th>時間</th>
                                {/* <th>網址</th>
                            <th>備註</th> */}
                            </tr>
                        </thead>
                        {/* 表身 */}
                        <tbody>
                            {currentPageData.map((feature, index) => (
                                <tr
                                    key={index}
                                    onMouseEnter={() => {
                                        setHoverFeatureId(feature.properties?.id);
                                    }}
                                    onClick={() => {
                                        setPanToId(feature.properties?.id);
                                        setActiveFeatureId(feature.properties?.id === activeFeatureId ? null : feature.properties?.id);
                                    }}
                                    className={activeFeatureId === feature.properties?.id ? styles.activeRow : ''}>
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
                {activeFeatureId && (
                    <div className={`${styles.Detail_Card} ${onEdit ? styles.editing : ''}`}>
                        <button onClick={() => setOnEdit(!onEdit)}>✏️</button>
                        <div className={styles.Card_title}>
                            <div className={styles.Card_name}>
                                <p>{detailCard.name}</p>
                                <input type="text" value={detailCard.name} onChange={(e) => setDetailCard({ ...detailCard, name: e.target.value })} />
                            </div>
                            <div className={styles.Card_id}>
                                <p>#{detailCard.id}</p>
                                <input type="text" value={`#${detailCard.id}`} onChange={(e) => setDetailCard({ ...detailCard, name: e.target.value })} />
                            </div>
                        </div>
                        <div className={styles.Card_district}>
                            <span>縣市</span>
                            <p>
                                {detailCard.county}
                                {detailCard.town}
                            </p>

                            <input type="text" value={detailCard.county} onChange={(e) => setDetailCard({ ...detailCard, name: e.target.value })} />

                            <input type="text" value={detailCard.town} onChange={(e) => setDetailCard({ ...detailCard, name: e.target.value })} />
                        </div>
                        <div className={styles.Card_time}>
                            <span>日期</span>
                            <p>{detailCard.time}</p>
                            <input type="text" value={detailCard.time} onChange={(e) => setDetailCard({ ...detailCard, name: e.target.value })} />
                        </div>
                        <div className={styles.Card_length}>
                            <span>距離</span> <p>{detailCard.length} 公里</p>
                            <input type="text" value={`${detailCard.length} 公里`} onChange={(e) => setDetailCard({ ...detailCard, name: e.target.value })} />
                        </div>
                        <div className={styles.Card_url}>
                            <span>路線連結</span>
                            {Array.isArray(detailCard.url) && detailCard.url.length > 0 ? (
                                detailCard.url.map((element: string, index: number) => (
                                    <div key={index}>
                                        <a href={element} target="_blank" rel="noopener noreferrer">
                                            連結-{index + 1}
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <p>無</p>
                            )}
                            <input type="text" value="另外處理喔～～～" onChange={(e) => setDetailCard({ ...detailCard, name: e.target.value })} />
                        </div>
                        <div className={styles.Card_note}>
                            <span>說明</span>
                            <p>{detailCard.note ?? '-'}</p>
                            <input type="text" value={detailCard.note ?? '-'} onChange={(e) => setDetailCard({ ...detailCard, name: e.target.value })} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
