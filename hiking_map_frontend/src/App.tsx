import Navbar from './components/Layout/Navbar';
import Index from './pages/Index';
import styles from './App.module.scss';
import type { FeatureCollection } from 'geojson';
import { PanelProvider } from './context/PanelContext';
import { TableProvider } from './context/TableContext';
import { PolylineProvider } from './context/PolylineContext';

import { useState, useEffect } from 'react';

export default function App() {
    const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
    useEffect(() => {
        fetch('http://localhost:3001/trails')
            .then((res) => res.json())
            .then((data: FeatureCollection) => setGeojson(data));
    }, []);
    return (
        <div className={styles.App}>
            <PanelProvider>
                <TableProvider geojson={geojson}>
                    {' '}
                    <PolylineProvider>
                        <Navbar geojson={geojson} />
                        <Index geojson={geojson} />
                    </PolylineProvider>
                </TableProvider>
            </PanelProvider>
        </div>
    );
}
