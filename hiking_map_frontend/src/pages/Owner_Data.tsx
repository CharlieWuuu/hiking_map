import Map from '../components/Map/Map';
import styles from './Owner_Data.module.scss';
import Data from '../components/Data/Data';
import { useParams } from 'react-router-dom';
import { useOwnerDetail } from '../hooks/useOwnerDetail';
import { TableProvider } from '../context/TableContext';
import { usePolyline } from '../context/PolylineContext';
import { useEffect } from 'react';

export default function Owner_Data() {
    const { name, type } = useParams<{ name: string; type: string; mode: string }>();
    const { owner } = useOwnerDetail({ name: name!, type: type! });
    const { setOwnerUuid, setType } = usePolyline();
    useEffect(() => {
        setOwnerUuid(owner?.uuid ?? '');
        setType(type || '');
    }, [owner, type]);

    return (
        <TableProvider>
            <div className={`${styles.Owner_Data}`}>
                <Data />
                <Map />
            </div>
        </TableProvider>
    );
}
