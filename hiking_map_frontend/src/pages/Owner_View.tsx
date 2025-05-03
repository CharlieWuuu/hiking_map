import { useParams } from 'react-router-dom';
import { useOwner } from '../hooks/useOwner';
import Panel_Detail from '../components/Panel/Panel_Detail';
import styles from './Owner_View.module.scss';
import TrailsMonthData from '../components/Chart/TrailsMonthData';
import Hundred from '../components/Chart/Hundred';
import CountyOrder from '../components/Chart/CountyOrder';
import Menu_Map from '../assets/images/Menu_Map.svg';
import Menu_Data from '../assets/images/Menu_Data.svg';
import Navbar_Edit from '../assets/images/Navbar_Edit.svg';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

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
    const { name, type } = useParams();
    const { user, trails, countyOrder, trailsMonthData, loading } = useOwner(name as string, type as string);
    useEffect(() => {
        console.log(loading);
    }, [loading]);
    const isUser = type === 'user';
    const isLayer = type === 'layer';

    // 🔧 Hooks 一定都寫在條件外面，不管資料有沒有來
    const [displayCount, setDisplayCount] = useState(10);
    const observerRef = useRef<HTMLDivElement | null>(null);

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry.isIntersecting && displayCount < (trails?.features.length ?? 0)) {
            setDisplayCount((prev) => prev + 10);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: '100px',
            threshold: 0.1,
        });

        if (observerRef.current) observer.observe(observerRef.current);
        return () => {
            if (observerRef.current) observer.unobserve(observerRef.current);
        };
    }, [trails?.features.length, displayCount]);

    if (loading || !user || !trails) {
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
        {
            totalDistance: 0,
            hundredCount: 0,
            smallHundredCount: 0,
            hundredTrailCount: 0,
        },
    );

    const roundedDistance = Math.round(totalDistance * 100) / 100;

    return (
        <div className={styles.Owner_View}>
            <section className={styles.Owner_Info}>
                <div className={styles.Owner_Avatar}>
                    <img src={user[0].avatar} alt="頭像" />
                </div>
                <div className={styles.Owner_Name}>
                    {isUser && <h1>{user[0].name}</h1>}
                    {isLayer && <h1>{user[0].name_zh}</h1>}
                    <div className={styles.Owner_Description}>
                        {isLayer && <p>{user[0].description}</p>}
                        {isUser && <p>{user[0].level}</p>}
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
                    <button>
                        <img src={Menu_Map} alt="" />
                        <span>地圖</span>
                    </button>
                    <button>
                        <img src={Menu_Data} alt="" />
                        <span>資料</span>
                    </button>
                    {isUser && (
                        <button>
                            <img src={Navbar_Edit} alt="" />
                            <span>編輯</span>
                        </button>
                    )}
                </div>
            </section>

            <section className={styles.Owner_Trails}>
                <h2>軌跡</h2>
                <div>
                    {trails.features.slice(0, displayCount).map((f, index) => (
                        <Link to={`/owner/${type}/${user[0].name}/trail/${f.properties?.uuid}`} key={f.properties?.uuid ?? `trail-${index}`} className={styles.Owner_Trail} state={{ features: f }}>
                            <Panel_Detail properties={f.properties as TrailProperties} />
                            {/* <p>{JSON.stringify(f)}</p> */}
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
