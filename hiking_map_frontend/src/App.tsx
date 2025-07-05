// page
import Index from './pages/Index';
import Owner_Data from './pages/Owner_Data';
import Login from './pages/Login';
import Intro from './pages/Intro';
import BottomBar from './components/layout/BottomBar/BottomBar';
import Owner_View from './pages/Owner_View/Owner_View';
import Search_Owner from './pages/Search_Owner';
import Owner_Trail from './pages/Owner_Trail';

// component
import Navbar from './components/layout/Navbar/Navbar';
import Modal from './components/common/Modal/Modal';
import Menu from './components/layout/Menu/Menu';
import Footer from './components/layout/Footer/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import LandingAnimation from './components/common/LandingAnimation';

// css
import styles from './App.module.scss';
import './styles/main.scss';

// context
import { useFullScreenContext } from './context/FullScreenContext';

// react
import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';

// hook
import { useOwnerList } from './hooks/useOwnerList';

export default function App() {
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const { isFullScreen } = useFullScreenContext();
    const { ownerList } = useOwnerList();

    return (
        <>
            <LandingAnimation />
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
