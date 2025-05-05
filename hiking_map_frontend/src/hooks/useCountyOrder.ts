import { useEffect, useState } from 'react';

type CountyOrder = {
    county: string;
    county_count: number;
};

type Props = {
    uuid: string;
    type: string;
};

export function useCountyOrder({ uuid, type }: Props) {
    const [countyOrder, setCountyOrder] = useState<CountyOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!uuid || !type) return;
        if (type === 'layer') return;

        const fetchCountyOrder = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/trails/county_order?owner_uuid=${uuid}&type=${type}`);
                const data = await res.json();
                setCountyOrder(data);
            } catch (err) {
                console.error('county_order 抓取錯誤:', err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchCountyOrder();
    }, [uuid, type]);

    return { countyOrder, loading, error };
}
