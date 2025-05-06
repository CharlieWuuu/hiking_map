import Map from '../components/Map/Map';
import styles from './Owner_Data.module.scss';
import Data from '../components/Data/Data';
import { useParams } from 'react-router-dom';
import { useOwnerDetail } from '../hooks/useOwnerDetail';
import { TableProvider } from '../context/TableContext';
import { usePolyline } from '../context/PolylineContext';
import { useEffect } from 'react';

export default function Owner_Data() {
    const { name, type } = useParams<{ name: string; type: string }>();
    const params = new URLSearchParams(window.location.search);
    const share = params.get('share');
    const { owner } = useOwnerDetail({ name: name!, type: type! });
    const { setOwnerUuid, setType, setShare } = usePolyline();
    useEffect(() => {
        setOwnerUuid(owner?.uuid ?? '');
        setType(type || '');
        if (share) setShare(share);
    }, [owner, type, share]);

    return (
        <TableProvider>
            <div className={`${styles.Owner_Data}`}>
                <Data />
                <Map />
            </div>
        </TableProvider>
    );
}
