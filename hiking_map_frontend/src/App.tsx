import Navbar from './components/Layout/Navbar';
import Index from './pages/Index';
import styles from './App.module.scss';
import { PanelProvider } from './context/PanelContext';
import { TableProvider } from './context/TableContext';
import { PolylineProvider } from './context/PolylineContext';
import { GeojsonProvider } from './context/GeojsonContext';
import { ModalProvider } from './context/ModalContext';
import { PatchDataProvider } from './context/PatchDataContext';
import Modal from './components/Modal/Modal';

export default function App() {
    return (
        <div className={styles.App}>
            <GeojsonProvider>
                <PanelProvider>
                    <TableProvider>
                        <PolylineProvider>
                            <ModalProvider>
                                <PatchDataProvider>
                                    <Navbar />
                                    <Index />
                                    <Modal />
                                </PatchDataProvider>
                            </ModalProvider>
                        </PolylineProvider>
                    </TableProvider>
                </PanelProvider>
            </GeojsonProvider>
        </div>
    );
}
