import { useEffect, useState } from 'react';
import type { FeatureCollection } from 'geojson';
import { useParams } from 'react-router-dom';

type Owner = {
    name: string;
    name_zh: string;
    id: string;
    uuid: string;
    avatar: string;
    level: string;
    description: string;
    type: string;
};

type countyOrder = {
    county: string;
    county_count: number;
};

type trailsMonthData = {
    month: string;
    total_distance_km: string;
};

export function useOwner(owner: Owner) {
    const [user, setUser] = useState<Owner>({ name: '', name_zh: '', id: '', uuid: '', avatar: '', level: '', description: '', type: '' });
    const [trails, setTrails] = useState<FeatureCollection | null>(null);
    const [loading, setLoading] = useState(true);
    const [countyOrder, setCountyOrder] = useState<countyOrder[]>([]);
    const [trailsMonthData, setTrailsMonthData] = useState<trailsMonthData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            let currentUser = owner;
            if (!currentUser) {
                const { name, type } = useParams();
                const res = await fetch(`${import.meta.env.VITE_API_URL}/owners/detail?name=${name}&type=${type}`);
                currentUser = await res.json();
            }
            setUser(currentUser);

            const promises: Promise<any>[] = [];
            const actions: ((data: any) => void)[] = [];

            if (currentUser.type === 'user') {
                promises.push(fetch(`${import.meta.env.VITE_API_URL}/trails/county_order?owner_uuid=${currentUser.uuid}&type=${currentUser.type}`).then((res) => res.json()));
                actions.push(setCountyOrder);

                promises.push(fetch(`${import.meta.env.VITE_API_URL}/trails/trails_month_data?owner_uuid=${currentUser.uuid}&type=${currentUser.type}`).then((res) => res.json()));
                actions.push(setTrailsMonthData);
            }

            // 不論哪種 type 都需要 trails
            promises.push(fetch(`${import.meta.env.VITE_API_URL}/trails?owner_uuid=${currentUser.uuid}&type=${currentUser.type}`).then((res) => res.json()));
            actions.push(setTrails);

            try {
                const results = await Promise.all(promises);
                results.forEach((data, index) => actions[index](data));
            } catch (err) {
                console.error('資料抓取失敗:', err);
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    return {
        user,
        setUser,
        trails,
        setTrails,
        loading,
        setLoading,
        countyOrder,
        setCountyOrder,
        trailsMonthData,
        setTrailsMonthData,
    };
}
