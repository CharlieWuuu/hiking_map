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
import { useState, useEffect } from 'react';

export default function App() {
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    useEffect(() => {
        console.log('menuIsOpen', menuIsOpen);
    }, [menuIsOpen]);
    return (
        <div className={styles.App}>
            <GeojsonProvider>
                <PanelProvider>
                    <PolylineProvider>
                        <TableProvider>
                            <ModalProvider>
                                <PatchDataProvider>
                                    <Navbar setMenuIsOpen={setMenuIsOpen} />
                                    <Index />
                                    <Modal />
                                    <Menu menuIsOpen={menuIsOpen} setMenuIsOpen={setMenuIsOpen} />
                                </PatchDataProvider>
                            </ModalProvider>
                        </TableProvider>
                    </PolylineProvider>
                </PanelProvider>
            </GeojsonProvider>
        </div>
    );
}
