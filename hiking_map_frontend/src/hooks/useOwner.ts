// import { use, useEffect, useState } from 'react';
// import type { FeatureCollection } from 'geojson';
// import { useParams } from 'react-router-dom';

// type Owner = {
//     name: string;
//     name_zh: string;
//     id: string;
//     uuid: string;
//     avatar: string;
//     level: string;
//     description: string;
//     type: string;
// };

// type countyOrder = {
//     county: string;
//     county_count: number;
// };

// type trailsMonthData = {
//     month: string;
//     total_distance_km: string;
// };

// export function useOwner() {
//     const { name, type } = useParams();
//     const [user, setUser] = useState<Owner | null>(null);
//     const [trails, setTrails] = useState<FeatureCollection | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [countyOrder, setCountyOrder] = useState<countyOrder[]>([]);
//     const [trailsMonthData, setTrailsMonthData] = useState<trailsMonthData[]>([]);

//     useEffect(() => {
//         if (!name || !type) return;

//         const fetchAll = async () => {
//             setLoading(true);
//             try {
//                 // 一次 fetch owner detail
//                 const ownerRes = await fetch(`${import.meta.env.VITE_API_URL}/owners/detail?name=${name}&type=${type}`);
//                 const ownerData = await ownerRes.json();
//                 const currentUser: Owner = ownerData[0];
//                 setUser(currentUser);

//                 // 準備資料 fetch
//                 const promises: Promise<any>[] = [];
//                 const actions: ((data: any) => void)[] = [];

//                 if (type === 'user') {
//                     promises.push(fetch(`${import.meta.env.VITE_API_URL}/trails/county_order?owner_uuid=${currentUser.uuid}&type=${type}`).then((res) => res.json()));
//                     actions.push(setCountyOrder);

//                     promises.push(fetch(`${import.meta.env.VITE_API_URL}/trails/trails_month_data?owner_uuid=${currentUser.uuid}&type=${type}`).then((res) => res.json()));
//                     actions.push(setTrailsMonthData);
//                 }

//                 promises.push(fetch(`${import.meta.env.VITE_API_URL}/trails?owner_uuid=${currentUser.uuid}&type=${type}`).then((res) => res.json()));
//                 actions.push(setTrails);

//                 const results = await Promise.all(promises);
//                 results.forEach((data, i) => actions[i](data));
//             } catch (err) {
//                 console.error('fetchAll 發生錯誤:', err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchAll();
//     }, [name, type]);

//     return {
//         user,
//         trails,
//         loading,
//         countyOrder,
//         trailsMonthData,
//     };
// }
