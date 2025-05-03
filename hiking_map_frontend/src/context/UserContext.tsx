// import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
// import type { FeatureCollection } from 'geojson';

// type User = {
//     username: string;
//     id: string;
//     uuid: string;
//     avatar: string;
//     level: string;
// };

// type UserContextType = {
//     user: User | null;
//     setUser: (user: User) => void;
//     trails: FeatureCollection | null;
//     setTrails: (t: FeatureCollection | null) => void;
//     refreshTrails: () => void;
// };

// const UserContext = createContext<UserContextType | undefined>(undefined);

// export const UserProvider = ({ children }: { children: ReactNode }) => {
//     const [user, setUser] = useState<User | null>(null);
//     const [trails, setTrails] = useState<FeatureCollection | null>(null);

//     // 初次抓 user
//     useEffect(() => {
//         const username = localStorage.getItem('username');
//         if (!username) return;
//         fetch(import.meta.env.VITE_API_URL + '/users?username=' + username)
//             .then((res) => res.json())
//             .then((data) => setUser(data));
//     }, []);

//     // 每當 user 改變就自動 fetch trails
//     useEffect(() => {
//         if (!user?.uuid) return;
//         fetch(import.meta.env.VITE_API_URL + '/trails?owner_uuid=' + user.uuid)
//             .then((res) => res.json())
//             .then((data) => setTrails(data));
//     }, [user]);

//     const refreshTrails = () => {
//         if (!user?.uuid) return;
//         fetch(import.meta.env.VITE_API_URL + '/trails?owner_uuid=' + user.uuid)
//             .then((res) => res.json())
//             .then((data) => setTrails(data));
//     };

//     return <UserContext.Provider value={{ user, setUser, trails, setTrails, refreshTrails }}>{children}</UserContext.Provider>;
// };

// export const useUser = () => {
//     const context = useContext(UserContext);
//     if (!context) throw new Error('useUser 必須包在 <UserProvider> 裡');
//     return context;
// };
