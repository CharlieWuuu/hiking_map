// page
import Index from './pages/Index';
import Data_User from './pages/Data_User';
// import Data_Layer from './pages/Data_Layer';
import Login from './pages/Login';
import Data_User_Edit from './pages/Data_User_Edit';
import Intro from './pages/Intro';
import BottomBar from './components/BottomBar/BottomBar';
import Owner_View from './pages/Owner_View';
import Search_Owner from './pages/Search_Owner';
import Owner_Trail from './pages/Owner_Trail';

// component
import Navbar from './components/Navbar/Navbar';
import Modal from './components/Modal/Modal';
import Menu from './components/Menu/Menu';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop';

// css
import styles from './App.module.scss';
import './styles/main.scss';

// context
import { useAuth } from './context/AuthContext';
import { useFullScreenContext } from './context/FullScreenContext';

// react
import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Data_User_Chart from './pages/Data_User_Chart';

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

export default function App() {
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const { user } = useAuth();
    const { isFullScreen } = useFullScreenContext();
    const [ownerList, setOwnerList] = useState<Owner[]>([]);

    useEffect(() => {
        fetch(import.meta.env.VITE_API_URL + '/owners/list')
            .then((res) => res.json())
            .then((data) => setOwnerList(data));
    }, []);

    return (
        <>
            <ScrollToTop />
            <Navbar setMenuIsOpen={setMenuIsOpen} ownerList={ownerList} />
            <div className={`${styles.App}`}>
                {/* <div className={`${styles.App} ${isFullScreen ? styles.NoScroll : ''}`}> */}
                <Modal />
                <Menu menuIsOpen={menuIsOpen} setMenuIsOpen={setMenuIsOpen} />
                <main>
                    <Routes>
                        <Route path="/" element={<Index ownerList={ownerList} />} />
                        <Route path="/search" element={<Search_Owner ownerList={ownerList} />} />
                        <Route path="/owner/:type/:name" element={<Owner_View />} />
                        <Route path="/owner/:type/:name/trail/:uuid" element={<Owner_Trail />} />
                        <Route path="/owner/:type/:name/data/:status" element={<Data_User />} />
                        <Route path="/intro" element={<Intro />} />
                        <Route path="/login" element={<Login />} />

                        {/* {'用戶自己的資料，沒登入會導向登入頁'}
                        <Route path={`/user/${user?.username}/`} element={user?.username ? <Data_User /> : <Login />} /> */}
                        {'用戶自己的資料，沒登入會導向登入頁'}
                        <Route path={`/user/${user?.username}/chart`} element={user?.username ? <Data_User_Chart /> : <Login />} />
                        {'任何用戶資料，目前先指向 charlie'}
                        {/* <Route path="/user/:username/" element={<Data_User />} /> */}
                        {'任何用戶資料，目前先指向 charlie'}
                        <Route path="/user/:username/chart" element={<Data_User_Chart />} />
                        {'任何圖層資料，目前先指向 charlie'}
                        <Route path="/layer/:layerName" element={<Data_User />} />
                        {'任何圖層資料，目前先指向 charlie'}
                        <Route path="/layer/:layerName/chart" element={<Data_User_Chart />} />
                        <Route path={`/user/${user?.username}/edit`} element={user?.username ? <Data_User_Edit /> : <Login />} />
                    </Routes>
                </main>
                {!isFullScreen && <Footer />}
                <BottomBar setMenuIsOpen={setMenuIsOpen} />
            </div>
        </>
    );
}
