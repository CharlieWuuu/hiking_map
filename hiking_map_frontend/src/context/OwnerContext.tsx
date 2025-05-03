// import { useState, useContext, createContext, ReactNode, useEffect } from 'react';
// import { Owner } from '../types/owners';
// import { FeatureCollection } from 'geojson';

// type countyOrder = {
//     county: string;
//     county_count: number;
// };

// type trailsMonthData = {
//     month: string;
//     total_distance_km: string;
// };

// type OwnerContextType = {
//     ownerList: Owner[];
//     setOwnerList: (ownerList: Owner[]) => void;
//     owner: Owner | null;
//     setOwner: (owner: Owner) => void;
//     trails: FeatureCollection | null;
//     setTrails: (trails: FeatureCollection) => void;
//     loading: boolean;
//     setLoading: (loading: boolean) => void;
//     countyOrder: countyOrder[];
//     setCountyOrder: (countyOrder: countyOrder[]) => void;
//     trailsMonthData: trailsMonthData[];
//     setTrailsMonthData: (trailsMonthData: trailsMonthData[]) => void;
//     name: string;
//     setName: (name: string) => void;
//     type: string;
//     setType: (type: string) => void;
// };

// const OwnerContext = createContext<OwnerContextType | undefined>(undefined);

// type Props = {
//     children: ReactNode;
// };

// export const OwnerProvider = ({ children }: Props) => {
//     const [loading, setLoading] = useState(true);
//     const [name, setName] = useState('');
//     const [type, setType] = useState('');
//     useEffect(() => {
//         console.log(name, type);
//     }, [name, type]);

//     // 取得用戶與圖層清單
//     const [ownerList, setOwnerList] = useState<Owner[]>([]);
//     useEffect(() => {
//         setLoading(true);
//         if (ownerList.length > 0) return;
//         fetch(import.meta.env.VITE_API_URL + '/owners/list')
//             .then((res) => res.json())
//             .then((data) => setOwnerList(data))
//             .finally(() => setLoading(false));
//     }, [name, type]);

//     // 取得特定用戶與圖層的詳細資訊
//     const [owner, setOwner] = useState<Owner | null>(null);
//     // 設定 owner
//     useEffect(() => {
//         if (ownerList.length === 0) return;
//         if (name === undefined || type === undefined) return;
//         const foundOwner = ownerList.find((o) => o.name === name && o.type === type);

//         if (foundOwner) {
//             setOwner(foundOwner);
//         }
//     }, [name, type, ownerList]);

//     const [trails, setTrails] = useState<FeatureCollection | null>(null);
//     const [countyOrder, setCountyOrder] = useState<countyOrder[]>([]);
//     const [trailsMonthData, setTrailsMonthData] = useState<trailsMonthData[]>([]);

//     // 當 owner 設定好後，再去 fetch 資料
//     useEffect(() => {
//         if (!owner) return;
//         console.log(name, type);
//         setLoading(true);
//         fetch(`${import.meta.env.VITE_API_URL}/trails?owner_uuid=${owner.uuid}&type=${owner.type}`)
//             .then((res) => res.json())
//             .then((data) => setTrails(data))
//             .finally(() => setLoading(false))
//             .finally(() => setLoading(false));
//         if (type === 'user') {
//             fetch(`${import.meta.env.VITE_API_URL}/trails/county_order?owner_uuid=${owner.uuid}&type=${owner.type}`)
//                 .then((res) => res.json())
//                 .then((data) => setCountyOrder(data))
//                 .finally(() => setLoading(false));

//             fetch(`${import.meta.env.VITE_API_URL}/trails/trails_month_data?owner_uuid=${owner.uuid}&type=${owner.type}`)
//                 .then((res) => res.json())
//                 .then((data) => setTrailsMonthData(data))
//                 .finally(() => setLoading(false));
//         }
//     }, [owner]);

//     return <OwnerContext.Provider value={{ ownerList, setOwnerList, owner, setOwner, trails, setTrails, loading, setLoading, countyOrder, setCountyOrder, trailsMonthData, setTrailsMonthData, name, setName, type, setType }}>{children}</OwnerContext.Provider>;
// };

// export const useOwner = () => {
//     const context = useContext(OwnerContext);
//     if (!context) throw new Error('useOwner 必須包在 <OwnerProvider> 內');
//     return context;
// };
