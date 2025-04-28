import Navbar from './components/Navbar/Navbar';
import Index from './pages/Index';
import Modal from './components/Modal/Modal';
import Menu from './components/Menu/Menu';
import styles from './App.module.scss';
import { PanelProvider } from './context/PanelContext';
import { TableProvider } from './context/TableContext';
import { PolylineProvider } from './context/PolylineContext';
import { GeojsonProvider } from './context/GeojsonContext';
import { ModalProvider } from './context/ModalContext';
import { PatchDataProvider } from './context/PatchDataContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
// import UserPage from './pages/UserPage';
import LoginPage from './pages/LoginPage';
import './styles/main.scss';

export default function App() {
    const [menuIsOpen, setMenuIsOpen] = useState(false);

    return (
        <div className={styles.App}>
            <BrowserRouter>
                <GeojsonProvider>
                    <PanelProvider>
                        <PolylineProvider>
                            <TableProvider>
                                <ModalProvider>
                                    <PatchDataProvider>
                                        <Navbar setMenuIsOpen={() => {}} />
                                        <Routes>
                                            <Route path="/" element={<Navigate to="/user/charlie" replace />} />
                                            <Route
                                                path="/user/:username"
                                                element={
                                                    <>
                                                        <Index />
                                                        <Modal />
                                                        <Menu menuIsOpen={menuIsOpen} setMenuIsOpen={setMenuIsOpen} />
                                                    </>
                                                }
                                            />
                                            <Route path="/login" element={<LoginPage />} />
                                        </Routes>
                                    </PatchDataProvider>
                                </ModalProvider>
                            </TableProvider>
                        </PolylineProvider>
                    </PanelProvider>
                </GeojsonProvider>
            </BrowserRouter>
        </div>
    );
}
