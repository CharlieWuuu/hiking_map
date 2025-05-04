// page
import Index from './pages/Index';
import Owner_Data from './pages/Owner_Data';
// import Data_Layer from './pages/Data_Layer';
import Login from './pages/Login';
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
import { useFullScreenContext } from './context/FullScreenContext';

// react
import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

// hook
import { useOwnerList } from './hooks/useOwnerList';

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
    const { isFullScreen } = useFullScreenContext();
    const { ownerList } = useOwnerList();

    return (
        <>
            <ScrollToTop />
            <Navbar setMenuIsOpen={setMenuIsOpen} ownerList={ownerList} />
            <div className={`${styles.App} ${isFullScreen ? styles.NoScroll : ''}`}>
                <Modal />
                <Menu menuIsOpen={menuIsOpen} setMenuIsOpen={setMenuIsOpen} />
                <main>
                    <Routes>
                        <Route path="/" element={<Index ownerList={ownerList} />} />
                        <Route path="/search" element={<Search_Owner ownerList={ownerList} />} />
                        <Route path="/owner/:type/:name" element={<Owner_View />} />
                        <Route path="/owner/:type/:name/trail/:uuid" element={<Owner_Trail />} />
                        <Route path="/owner/:type/:name/data" element={<Owner_Data />} />
                        <Route path="/intro" element={<Intro />} />
                        <Route path="/login" element={<Login />} />
                    </Routes>
                </main>
                {!isFullScreen && <Footer />}
                <BottomBar setMenuIsOpen={setMenuIsOpen} />
            </div>
        </>
    );
}
