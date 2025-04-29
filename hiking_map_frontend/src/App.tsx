// page
import Index from './pages/Index';
import Data_User from './pages/Data_User';
import Data_Layer from './pages/Data_Layer';
import Login from './pages/Login';
import Data_User_Edit from './pages/Data_User_Edit';
import Intro from './pages/Intro';

// component
import Navbar from './components/Navbar/Navbar';
import Modal from './components/Modal/Modal';
import Menu from './components/Menu/Menu';

// css
import styles from './App.module.scss';
import './styles/main.scss';

// context
import { useAuth } from './context/AuthContext';

// react
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { useState } from 'react';
import Data_User_Chart from './pages/Data_User_Chart';

export default function App() {
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const { user } = useAuth();

    return (
        <BrowserRouter>
            <Navbar setMenuIsOpen={setMenuIsOpen} />
            <div className={styles.App}>
                <Modal />
                <Menu menuIsOpen={menuIsOpen} setMenuIsOpen={setMenuIsOpen} />
                <main>
                    <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path={`/user/${user?.username}`} element={user?.username ? <Data_User /> : <Login />} />
                        <Route path="/user/charlie" element={<Data_User />} /> {'功能完成後就會關掉這個地方'}
                        <Route path="/user/:username/chart" element={<Data_User_Chart />} />
                        <Route path="/layer/:layerName" element={<Data_Layer />} />
                        <Route path="/layer/:layerName/chart" element={<Data_Layer />} />
                        <Route path="/edit" element={<Data_User_Edit />} />
                        <Route path="/intro" element={<Intro />} />
                        <Route path="/login" element={<Login />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}
