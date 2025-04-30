// page
import Index from './pages/Index';
import Data_User from './pages/Data_User';
// import Data_Layer from './pages/Data_Layer';
import Login from './pages/Login';
import Data_User_Edit from './pages/Data_User_Edit';
import Intro from './pages/Intro';
import BottomBar from './components/BottomBar/BottomBar';

// component
import Navbar from './components/Navbar/Navbar';
import Modal from './components/Modal/Modal';
import Menu from './components/Menu/Menu';
import Footer from './components/Footer/Footer';

// css
import styles from './App.module.scss';
import './styles/main.scss';

// context
import { useAuth } from './context/AuthContext';

// react
import { Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Data_User_Chart from './pages/Data_User_Chart';

export default function App() {
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const { user } = useAuth();
    const location = useLocation();
    const hiddenFooterPaths = ['/user', '/layer', '/edit'];
    const shouldHideFooter = hiddenFooterPaths.some((path) => location.pathname.startsWith(path));

    return (
        <>
            <Navbar setMenuIsOpen={setMenuIsOpen} />
            <div className={styles.App}>
                <Modal />
                <Menu menuIsOpen={menuIsOpen} setMenuIsOpen={setMenuIsOpen} />
                {shouldHideFooter && (
                    <div className={styles.HundredVH}>
                        <Routes>
                            {'用戶自己的資料，沒登入會導向登入頁'}
                            <Route path={`/user/${user?.username}/`} element={user?.username ? <Data_User /> : <Login />} />
                            {'用戶自己的資料，沒登入會導向登入頁'}
                            <Route path={`/user/${user?.username}/chart`} element={user?.username ? <Data_User_Chart /> : <Login />} />
                            {'任何用戶資料，目前先指向 charlie'}
                            <Route path="/user/:username/" element={<Data_User />} />
                            {'任何用戶資料，目前先指向 charlie'}
                            <Route path="/user/:username/chart" element={<Data_User_Chart />} />
                            {'任何圖層資料，目前先指向 charlie'}
                            <Route path="/layer/:layerName" element={<Data_User />} />
                            {'任何圖層資料，目前先指向 charlie'}
                            <Route path="/layer/:layerName/chart" element={<Data_User_Chart />} />
                            <Route path="/edit" element={user?.username ? <Data_User_Edit /> : <Login />} />
                        </Routes>
                    </div>
                )}
                {!shouldHideFooter && (
                    <main>
                        <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/intro" element={<Intro />} />
                            <Route path="/login" element={<Login />} />
                        </Routes>
                    </main>
                )}
                {!shouldHideFooter && <Footer />}
                <BottomBar setMenuIsOpen={setMenuIsOpen} />
            </div>
        </>
    );
}
