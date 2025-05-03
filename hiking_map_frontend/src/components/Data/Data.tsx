import Data_All from './Data_All';
import styles from './Data.module.scss';
import { use, useState } from 'react';
import GoBack from '../GoBack/GoBack';
import { useParams } from 'react-router-dom';

type Owner = {
    name: string;
    name_zh: string;
    id: string;
    uuid: string;
    avatar: string;
    level: string;
    description: string;
    type: string;
};

export default function Panel_Data() {
    const { name, type } = useParams();
    const [panelDataType, setPanelDataType] = useState<'All' | 'Chart' | 'Layer'>('All');
    return (
        <div className={styles.Panel_Data}>
            <div className={styles.Panel_Header}>
                <GoBack url={`/owner/${type}/${name}`} />
            </div>
            {panelDataType === 'All' && <Data_All />}
        </div>
    );
}
