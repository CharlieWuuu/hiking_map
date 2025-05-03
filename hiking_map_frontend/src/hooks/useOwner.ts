import { useEffect, useState } from 'react';
import type { FeatureCollection } from 'geojson';

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

export function useOwner(name: string, type: string) {
    const [user, setUser] = useState<Owner[]>([{ name: '', name_zh: '', id: '', uuid: '', avatar: '', level: '', description: '', type: '' }]);
    const [trails, setTrails] = useState<FeatureCollection | null>(null);
    const [loading, setLoading] = useState(true);
    const [countyOrder, setCountyOrder] = useState<countyOrder[]>([]);
    const [trailsMonthData, setTrailsMonthData] = useState<trailsMonthData[]>([]);

    useEffect(() => {
        if (!name) return;

        setLoading(true);

        fetch(`${import.meta.env.VITE_API_URL}/owners/detail?name=${name}&type=${type}`)
            .then((res) => res.json())
            .then((userData) => {
                setUser(userData);
                if (!userData[0]?.uuid) return;

                if (type === 'user') {
                    fetch(`${import.meta.env.VITE_API_URL}/trails/county_order?owner_uuid=${userData[0].uuid}&type=${type}`)
                        .then((res) => res.json())
                        .then((countyData) => {
                            if (countyData) setCountyOrder(countyData);
                        })
                        .catch((err) => {
                            console.error('❌ 取得使用者或 county 失敗：', err);
                        });

                    fetch(`${import.meta.env.VITE_API_URL}/trails/trails_month_data?owner_uuid=${userData[0].uuid}&type=${type}`)
                        .then((res) => res.json())
                        .then((countyData) => {
                            if (countyData) setTrailsMonthData(countyData);
                        })
                        .catch((err) => {
                            console.error('❌ 取得使用者或 county 失敗：', err);
                        });
                }

                fetch(`${import.meta.env.VITE_API_URL}/trails?owner_uuid=${userData[0].uuid}&type=${type}`)
                    .then((res) => res?.json())
                    .then((trailData) => {
                        if (trailData) setTrails(trailData);
                    })
                    .catch((err) => {
                        console.error('❌ 取得使用者或 trails 失敗：', err);
                    });
            })
            .finally(() => setLoading(false));
    }, [name]);

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
