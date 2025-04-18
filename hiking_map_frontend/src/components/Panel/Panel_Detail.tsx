import { usePolyline } from '../../context/PolylineContext';
import styles from './Panel_Detail.module.scss';

import { useGeojson } from '../../context/GeojsonContext';

export default function Panel_Detail() {
    const { geojson } = useGeojson();
    const { activeFeatureId } = usePolyline();
    const detailCard = geojson?.features[(activeFeatureId as number) - 1]?.properties;

    const date = new Date(detailCard?.time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = `${year}年${month}月${day}日`;

    return (
        <div className={styles.Panel_Detail}>
            {/* <button onClick={() => setOnEdit(!onEdit)}>✏️</button> */}
            {detailCard && (
                <div className={`${styles.Detail_Card}`}>
                    <div className={styles.Card_title}>
                        <div className={styles.Card_name}>
                            <p>{detailCard.name}</p>
                            {/* <input type="text" value={detailCard.name} onChange={(e) => setDetailCard({ ...detailCard, name: e.target.value })} /> */}
                        </div>
                        <div className={styles.Card_id}>
                            <p>#{detailCard.id}</p>
                            {/* <input type="text" value={`#${detailCard.id}`} onChange={(e) => setDetailCard({ ...detailCard, name: e.target.value })} /> */}
                        </div>
                    </div>
                    <div className={styles.Card_district}>
                        <span>縣市</span>
                        <p>
                            {detailCard.county}
                            {detailCard.town}
                        </p>

                        {/* <input type="text" value={detailCard.county} onChange={(e) => setDetailCard({ ...detailCard, name: e.target.value })} /> */}

                        {/* <input type="text" value={detailCard.town} onChange={(e) => setDetailCard({ ...detailCard, name: e.target.value })} /> */}
                    </div>
                    <div className={styles.Card_time}>
                        <span>日期</span>
                        <p>{time}</p>
                        {/* <input type="text" value={detailCard.time} onChange={(e) => setDetailCard({ ...detailCard, name: e.target.value })} /> */}
                    </div>
                    <div className={styles.Card_length}>
                        <span>距離</span> <p>{detailCard.length} 公里</p>
                        {/* <input type="text" value={`${detailCard.length} 公里`} onChange={(e) => setDetailCard({ ...detailCard, name: e.target.value })} /> */}
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
                        {/* <input type="text" value="另外處理喔～～～" onChange={(e) => setDetailCard({ ...detailCard, name: e.target.value })} /> */}
                    </div>
                    <div className={styles.Card_note}>
                        <span>說明</span>
                        <p>{detailCard.note ?? '-'}</p>
                        {/* <input type="text" value={detailCard.note ?? '-'} onChange={(e) => setDetailCard({ ...detailCard, name: e.target.value })} /> */}
                    </div>
                </div>
            )}
        </div>
    );
}
