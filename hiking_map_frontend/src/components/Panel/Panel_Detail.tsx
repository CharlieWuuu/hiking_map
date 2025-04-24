import { usePolyline } from '../../context/PolylineContext';
import styles from './Panel_Detail.module.scss';
import { useGeojson } from '../../context/GeojsonContext';
import { useAuth } from '../../context/AuthContext';

export default function Panel_Detail() {
    const { geojson } = useGeojson();
    const { activeFeatureUuid } = usePolyline();
    const features = geojson?.features.find((f) => f.properties?.uuid === activeFeatureUuid);
    const detailCard = features?.properties;
    const { isLoggedIn } = useAuth();

    const date = new Date(detailCard?.time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = isLoggedIn ? `${year}年${month}月${day}日` : `${year}年${month}月`;

    return (
        <div className={styles.Panel_Detail}>
            {detailCard && (
                <div className={`${styles.Detail_Card}`}>
                    <div className={styles.Card_title}>
                        <div className={styles.Card_name}>
                            <p>{detailCard.name}</p>
                        </div>
                        <div className={styles.Card_id}>
                            <p>#{detailCard.id}</p>
                        </div>
                    </div>
                    <div className={styles.Card_district}>
                        <span>縣市</span>
                        <p>
                            {detailCard.county}
                            {detailCard.town}
                        </p>
                    </div>
                    <div className={styles.Card_time}>
                        <span>日期</span>
                        <p>{time}</p>
                    </div>
                    <div className={styles.Card_length}>
                        <span>距離</span> <p>{detailCard.length} 公里</p>
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
                            <p>-</p>
                        )}
                    </div>
                    <div className={styles.Card_note}>
                        <span>說明</span>
                        <p>{detailCard.note ?? '-'}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
