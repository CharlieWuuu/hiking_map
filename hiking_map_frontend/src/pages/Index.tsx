import { useState } from 'react';
import SideBar from '../components/SideBar';
import SidePanel from '../components/SidePanel';
import Map from '../components/Map';
import styles from './Index.module.scss';
import '../styles/main.scss';

export default function Index() {
    const [panelType, setPanelType] = useState<'layer' | 'data' | 'login'>('layer');
    const changePanelType = (newPanelType: 'layer' | 'data' | 'login') => {
        if (panelType !== newPanelType) {
            setPanelType(newPanelType);
        }
    };
    const [isActive, setIsActive] = useState(false);

    return (
        <div className={styles.Index}>
            <SideBar changePanelType={changePanelType} isActive={isActive} togglePanel={setIsActive} />
            <SidePanel panelType={panelType} isActive={isActive} />
            <Map />
        </div>
    );
}
