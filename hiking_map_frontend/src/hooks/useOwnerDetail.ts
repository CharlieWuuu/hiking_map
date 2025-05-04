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

type Props = {
    name: string;
    type: string;
};

export function useOwnerDetail({ name, type }: Props) {
    const [owner, setOwner] = useState<Owner | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!name || !type) return;

        const fetchCountyOrder = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/owners/detail?name=${name}&type=${type}`);
                const data = await res.json();
                setOwner(data[0]);
            } catch (err) {
                console.error('county_order 抓取錯誤:', err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchCountyOrder();
    }, [name, type]);

    return { owner, loading, error };
}
