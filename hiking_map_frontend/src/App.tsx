import Navbar from './components/Layout/Navbar';
import Index from './pages/Index';
import styles from './App.module.scss';
import { PanelProvider } from './context/PanelContext';
import { TableProvider } from './context/TableContext';
import { PolylineProvider } from './context/PolylineContext';
import { GeojsonProvider } from './context/GeojsonContext';

export default function App() {
    return (
        <div className={styles.App}>
            <GeojsonProvider>
                <PanelProvider>
                    <TableProvider>
                        <PolylineProvider>
                            <Navbar />
                            <Index />
                        </PolylineProvider>
                    </TableProvider>
                </PanelProvider>
            </GeojsonProvider>
        </div>
    );
}
