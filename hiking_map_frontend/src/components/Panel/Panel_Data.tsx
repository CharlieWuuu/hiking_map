import Panel_Tab from './Panel_Tab';
import Panel_Data_All from './Panel_Data_All';
import styles from './Panel_Data.module.scss';
import type { FeatureCollection } from 'geojson';
import { useState } from 'react';
type Props = {
    geojson?: FeatureCollection | null;
};

export default function Panel_Data({ geojson }: Props) {
    const [panelDataType, setPanelDataType] = useState<'All' | 'Chart' | 'Layer'>('All');
    return (
        <div className={styles.Panel_Data}>
            <Panel_Tab panelDataType={panelDataType} setPanelDataType={setPanelDataType} />
            {panelDataType === 'All' && <Panel_Data_All geojson={geojson} />}
            {panelDataType === 'Chart' && <div>我是圖表～</div>}
            {panelDataType === 'Layer' && <div>我是圖層～</div>}
        </div>
    );
}
