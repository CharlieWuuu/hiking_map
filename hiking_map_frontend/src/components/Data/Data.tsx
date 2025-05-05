import Data_All from './Data_All';
import styles from './Data.module.scss';
import GoBack from '../GoBack/GoBack';
import { useParams } from 'react-router-dom';
import SearchData from '../Search/SearchData';

export default function Data() {
    const { name, type } = useParams<{ name: string; type: string; mode: string }>();

    return (
        <div className={styles.Data}>
            <div className={styles.Panel_Header}>
                <GoBack url={`/owner/${type}/${name}`} />
                <SearchData />
            </div>
            <Data_All />
        </div>
    );
}
