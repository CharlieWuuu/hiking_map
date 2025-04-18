import Panel_Tab from './Panel_Tab';
import Panel_Data_All from './Panel_Data_All';
import Panel_Chart from './Panel_Chart';
import Panel_Layer from './Panel_Layer';
import styles from './Panel_Data.module.scss';
import { useState } from 'react';

export default function Panel_Data() {
    const [panelDataType, setPanelDataType] = useState<'All' | 'Chart' | 'Layer'>('All');
    return (
        <div className={styles.Panel_Data}>
            <Panel_Tab panelDataType={panelDataType} setPanelDataType={setPanelDataType} />
            {panelDataType === 'All' && <Panel_Data_All />}
            {panelDataType === 'Chart' && <Panel_Chart />}
            {panelDataType === 'Layer' && <Panel_Layer />}
        </div>
    );
}
