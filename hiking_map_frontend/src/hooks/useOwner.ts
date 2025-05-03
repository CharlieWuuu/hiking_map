import { use, useEffect, useState } from 'react';
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

export function useOwner() {
    const { name, type } = useParams();
    const [user, setUser] = useState<Owner | null>(null);
    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/owners/detail?name=${name}&type=${type}`);
            const data = await res.json();
            console.log(data);
            setUser(data[0]);
            console.log(1);
        };
        fetchData();
    }, [name, type]);

    const [trails, setTrails] = useState<FeatureCollection | null>(null);
    const [loading, setLoading] = useState(true);
    const [countyOrder, setCountyOrder] = useState<countyOrder[]>([]);
    const [trailsMonthData, setTrailsMonthData] = useState<trailsMonthData[]>([]);

    useEffect(() => {
        if (user === null) return;
        const fetchData = async () => {
            console.log(user);
            setLoading(true);
            console.log(2);
            const promises: Promise<any>[] = [];
            const actions: ((data: any) => void)[] = [];

            if (type === 'user') {
                promises.push(fetch(`${import.meta.env.VITE_API_URL}/trails/county_order?owner_uuid=${user.uuid}&type=${type}`).then((res) => res.json()));
                actions.push(setCountyOrder);

                promises.push(fetch(`${import.meta.env.VITE_API_URL}/trails/trails_month_data?owner_uuid=${user.uuid}&type=${type}`).then((res) => res.json()));
                actions.push(setTrailsMonthData);
            }

            // 不論哪種 type 都需要 trails
            promises.push(fetch(`${import.meta.env.VITE_API_URL}/trails?owner_uuid=${user?.uuid}&type=${type}`).then((res) => res.json()));
            actions.push(setTrails);

            try {
                const results = await Promise.all(promises);
                results.forEach((data, index) => actions[index](data));
                console.log('資料抓取成功');
            } catch (err) {
                console.error('資料抓取失敗:', err);
            }

            setLoading(false);
        };

        fetchData();
    }, [user]);

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
