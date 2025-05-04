import { useEffect, useState } from 'react';
import type { FeatureCollection } from 'geojson';

type Props = {
    uuid: string;
    type: string;
    trail_uuid?: string;
};

const memoryCache: Record<string, FeatureCollection> = {};

export function useTrails({ uuid, type, trail_uuid }: Props) {
    const [trails, setTrails] = useState<FeatureCollection | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchTrails = async () => {
        if (!uuid || !type) return;

        const key = `${uuid}_${type}_${trail_uuid || 'all'}`;
        if (memoryCache[key]) {
            setTrails(memoryCache[key]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        let url = `${import.meta.env.VITE_API_URL}/trails?owner_uuid=${uuid}&type=${type}`;
        if (trail_uuid) url += `&uuid=${trail_uuid}`;

        try {
            const res = await fetch(url);
            const data = await res.json();
            memoryCache[key] = data;
            setTrails(data);
        } catch (err) {
            console.error('trails 抓取錯誤:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrails();
    }, [uuid, type, trail_uuid]);

    return { trails, loading, error, fetchTrails };
}
