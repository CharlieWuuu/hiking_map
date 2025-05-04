import { useEffect, useState } from 'react';
type trailsMonthData = {
    month: string;
    total_distance_km: string;
};

type Props = {
    uuid: string;
    type: string;
};

export function useTrailsMonthData({ uuid, type }: Props) {
    const [trailsMonthData, setTrailsMonthData] = useState<trailsMonthData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!uuid || !type) return;
        if (type === 'layer') return;

        const fetchCountyOrder = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/trails/trails_month_data?owner_uuid=${uuid}&type=${type}`);
                const data = await res.json();
                setTrailsMonthData(data);
            } catch (err) {
                console.error('county_order 抓取錯誤:', err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchCountyOrder();
    }, [uuid, type]);

    return { trailsMonthData, loading, error };
}
