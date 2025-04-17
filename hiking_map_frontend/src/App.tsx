import Navbar from './components/Layout/Navbar';
import Index from './pages/Index';
import styles from './App.module.scss';
import { useState } from 'react';
import type { UIPanels } from './types/uiPanels';

export default function App() {
    const [uiPanels, setUIPanels] = useState<UIPanels>({
        data: true,
        detail: true,
        auth: false,
        info: false,
    });

    return (
        <div className={styles.App}>
            <Navbar uiPanels={uiPanels} setUIPanels={setUIPanels} />
            <Index uiPanels={uiPanels} setUIPanels={setUIPanels} />
        </div>
    );
}
