import { useEffect, useState } from 'react';
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

export function useOwnerList() {
    const [ownerList, setOwnerList] = useState<Owner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchCountyOrder = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/owners/list`);
                const data = await res.json();
                setOwnerList(data);
            } catch (err) {
                console.error('county_order 抓取錯誤:', err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchCountyOrder();
    }, []);

    return { ownerList, loading, error };
}
