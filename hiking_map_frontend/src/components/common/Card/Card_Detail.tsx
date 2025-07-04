import styles from './Card_Detail.module.scss';

type TrailProperties = {
    uuid: string;
    name: string;
    length: number;
    time: string;
    county: string;
    town: string;
    url: string[];
    note: string;
    public: boolean;
};

type Props = {
    properties: TrailProperties;
};

export default function Panel_Detail({ properties }: Props) {
    const detail_data = properties;
    const date = new Date(detail_data.time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = `${year}年${month}月${day}日`;

    return (
        <div className={styles.Panel_Detail}>
            {detail_data && (
                <div className={`${styles.Detail_Card}`}>
                    <div className={styles.Card_title}>
                        <div className={styles.Card_name}>
                            <p>{detail_data.name}</p>
                        </div>
                        <div className={styles.Card_district}>
                            <p>
                                {detail_data.county}
                                {detail_data.town}
                            </p>
                        </div>
                    </div>
                    <hr />
                    <div className={styles.Card_properties}>
                        <div className={styles.Card_time}>
                            <span>日期</span>
                            <p>{time}</p>
                        </div>
                        <div className={styles.Card_length}>
                            <span>距離</span> <p>{detail_data.length} 公里</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
