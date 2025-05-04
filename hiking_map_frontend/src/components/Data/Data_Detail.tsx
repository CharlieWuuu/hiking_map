import styles from './Data_Detail.module.scss';
import { TrailProperties } from '../../types/trails';
import { useEffect, useState } from 'react';

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
    trails: TrailProperties;
};
export default function Data_Detail({ trails }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const date = new Date(trails.time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = `${year}年${month}月${day}日`;
    const [patchData, setPatchData] = useState<patchData | null>(null);

    useEffect(() => {
        console.log(patchData);
    }, [patchData]);

    return (
        <div className={`${styles.Data_Detail}`}>
            <div className={`${styles.Detail_Card}`}>
                <div className={styles.Card_title}>
                    <div className={styles.Card_name}>
                        {!isEditing && <p>{trails.name}</p>}
                        {isEditing && <input type="text" defaultValue={trails.name} onChange={(e) => setPatchData({ ...(patchData as patchData), name: e.target.value as string })} />}
                        <span>#{trails.id}</span>
                    </div>
                    <div className={styles.Card_edit}>
                        {!isEditing && <button onClick={() => setIsEditing(true)}>編輯</button>}
                        {isEditing && <button onClick={() => setIsEditing(false)}>取消（待移）</button>}
                        {isEditing && <button>更新軌跡</button>}
                        {isEditing && <button>儲存</button>}
                        {isEditing && <button>刪除</button>}
                    </div>
                </div>

                <div className={styles.Card_properties}>
                    <div className={styles.Card_district}>
                        <span>縣市</span>
                        <p>{trails.county}</p>
                    </div>

                    <div className={styles.Card_district}>
                        <span>鄉鎮</span>
                        <p>{trails.town}</p>
                    </div>
                    <div className={styles.Card_time}>
                        <span>日期</span>
                        <p>{time}</p>
                    </div>

                    <div className={styles.Card_length}>
                        <span>距離</span> <p>{trails.length} 公里</p>
                    </div>

                    <div className={styles.Card_url}>
                        <span>路線連結</span>
                        <div>
                            {Array.isArray(trails.url) && trails.url.length > 0 ? (
                                trails.url.map((element: string, index: number) => (
                                    <a
                                        key={element || index} // 用網址作為 key，若為空備援用 index
                                        href={element}
                                        target="_blank"
                                        rel="noopener noreferrer">
                                        連結-{index + 1}
                                    </a>
                                ))
                            ) : (
                                <p>-</p>
                            )}
                        </div>
                    </div>

                    <div className={styles.Card_note}>
                        <span>說明</span>
                        <p>{trails.note ?? '-'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
