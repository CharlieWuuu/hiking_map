// styles
import styles from './Owner_View.module.scss';

// react
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';

// components
import Panel_Detail from '../components/Panel/Panel_Detail';
import TrailsMonthData from '../components/Chart/TrailsMonthData';
import Hundred from '../components/Chart/Hundred';
import CountyOrder from '../components/Chart/CountyOrder';

// image
import Menu_Map from '../assets/images/Menu_Map.svg';
import Menu_Data from '../assets/images/Menu_Data.svg';
import Navbar_Edit from '../assets/images/Navbar_Edit.svg';

// hooks
import { useOwner } from '../hooks/useOwner';

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

export default function Owner_View() {
    let owner = useLocation().state; // 從 Link 的 state 傳入的資料，如果沒有就 fetch
    if (owner == null) {
        const { name, type } = useParams();
        fetch(`${import.meta.env.VITE_API_URL}/owners/detail?name=${name}&type=${type}`)
            .then((res) => res.json())
            .then((data) => (owner = data));
    }
    const type = owner.type;
    const { trails, countyOrder, trailsMonthData, loading } = useOwner(owner);
    const isUser = type === 'user';
    const isLayer = type === 'layer';
    const [displayCount, setDisplayCount] = useState(10);
    const observerRef = useRef<HTMLDivElement | null>(null);

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry.isIntersecting && displayCount < (trails?.features.length ?? 0)) {
            setDisplayCount((prev) => prev + 10);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, { root: null, rootMargin: '100px', threshold: 0.1 });
        if (observerRef.current) observer.observe(observerRef.current);
        return () => {
            if (observerRef.current) observer.unobserve(observerRef.current);
        };
    }, [trails?.features.length, displayCount]);

    if (loading || !owner || !trails) {
        return (
            <div className={`${styles.Owner_View} ${styles.onLoading}`}>
                <span className={styles.loader}></span>
            </div>
        );
    }

    const { totalDistance, hundredCount, smallHundredCount, hundredTrailCount } = trails.features.reduce(
        (acc, feature) => {
            const props = feature.properties || {};
            acc.totalDistance += props.length || 0;
            if (props.hundred_id) acc.hundredCount += 1;
            if (props.small_hundred_id) acc.smallHundredCount += 1;
            if (props.hundred_trail_id) acc.hundredTrailCount += 1;
            return acc;
        },
        { totalDistance: 0, hundredCount: 0, smallHundredCount: 0, hundredTrailCount: 0 },
    );
    const roundedDistance = Math.round(totalDistance * 100) / 100;

    return (
        <div className={styles.Owner_View}>
            <section className={styles.Owner_Info}>
                <div className={styles.Owner_Avatar}>
                    <img src={owner.avatar} alt="頭像" />
                </div>
                <div className={styles.Owner_Name}>
                    {isUser && <h1>{owner.name}</h1>}
                    {isLayer && <h1>{owner.name_zh}</h1>}
                    <div className={styles.Owner_Description}>
                        {isLayer && <p>{owner.description}</p>}
                        {isUser && <p>{owner.level}</p>}
                        {isUser && <p>{roundedDistance} 公里</p>}
                        {isUser && <p>{trails?.features.length} 次健行</p>}
                    </div>
                </div>
            </section>

            {type === 'user' && (
                <section className={styles.Owner_Chart}>
                    <h2>統計</h2>
                    <div className={styles.Owner_Chart_Content}>
                        {isUser && (
                            <div>
                                <Hundred title="百岳" value={hundredCount} />
                            </div>
                        )}
                        {isUser && (
                            <div>
                                <Hundred title="小百岳" value={smallHundredCount} />
                            </div>
                        )}
                        {isUser && (
                            <div>
                                <Hundred title="百大必訪步道" value={hundredTrailCount} />
                            </div>
                        )}
                        {trailsMonthData.length > 0 && <div className={styles.Owner_Chart_Trails}>{isUser && <TrailsMonthData data={trailsMonthData} mode="year" />}</div>}
                        {countyOrder.length > 0 && <div>{isUser && <CountyOrder data={countyOrder} />}</div>}
                    </div>
                </section>
            )}

            <section className={styles.Owner_Navigation}>
                <h2>資料</h2>
                <div>
                    <Link to={`/owner/${type}/${owner.name}/data/map`} state={trails}>
                        <img src={Menu_Map} alt="" />
                        <span>地圖</span>
                    </Link>

                    <Link to={`/owner/${type}/${owner.name}/data/map`} state={trails}>
                        <img src={Menu_Data} alt="" />
                        <span>資料</span>
                    </Link>

                    {isUser && (
                        <Link to={`/owner/${type}/${owner.name}/data/map`} state={trails}>
                            <img src={Navbar_Edit} alt="" />
                            <span>編輯</span>
                        </Link>
                    )}
                </div>
            </section>

            <section className={styles.Owner_Trails}>
                <h2>軌跡</h2>
                <div>
                    {trails.features.slice(0, displayCount).map((f, index) => (
                        <Link to={`/owner/${type}/${owner.name}/trail/${f.properties?.uuid}`} key={f.properties?.uuid ?? `trail-${index}`} className={styles.Owner_Trail} state={{ features: f }}>
                            <Panel_Detail properties={f.properties as TrailProperties} />
                        </Link>
                    ))}

                    {displayCount < trails.features.length && (
                        <div className={styles.LoadMoreWrapper}>
                            <button className={styles.LoadMoreButton} onClick={() => setDisplayCount((prev) => prev + 10)}>
                                載入更多
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
