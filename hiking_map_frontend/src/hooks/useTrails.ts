import { useEffect, useState } from 'react';
import type { FeatureCollection } from 'geojson';

type Props = {
    uuid: string;
    type: string;
    trail_uuid?: string;
};

export function useTrails({ uuid, type, trail_uuid }: Props) {
    const [trails, setTrails] = useState<FeatureCollection | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        console.log(uuid, type); // 缺 uuid，並且 uuid 更新以後也沒有再次呼叫
        if (!uuid || !type) return;

        const fetchCountyOrder = async () => {
            setLoading(true);
            setError(null);
            let url = `${import.meta.env.VITE_API_URL}/trails?owner_uuid=${uuid}&type=${type}`;
            if (trail_uuid) url += `&uuid=${trail_uuid}`;

            try {
                const res = await fetch(url);
                const data = await res.json();
                setTrails(data);
            } catch (err) {
                console.error('county_order 抓取錯誤:', err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchCountyOrder();
    }, [uuid, type, trail_uuid]);

    return { trails, loading, error };
}
