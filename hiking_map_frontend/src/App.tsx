import Navbar from './components/Layout/Navbar';
import Index from './pages/Index';
import styles from './App.module.scss';
import { PanelProvider } from './context/PanelContext';
import { TableProvider } from './context/TableContext';
import { PolylineProvider } from './context/PolylineContext';
import { GeojsonProvider } from './context/GeojsonContext';
import { ModalProvider } from './context/ModalContext';

export default function App() {
    return (
        <div className={styles.App}>
            <GeojsonProvider>
                <PanelProvider>
                    <TableProvider>
                        <PolylineProvider>
                            <ModalProvider>
                                <Navbar />
                                <Index />
                            </ModalProvider>
                        </PolylineProvider>
                    </TableProvider>
                </PanelProvider>
            </GeojsonProvider>
        </div>
    );
}
