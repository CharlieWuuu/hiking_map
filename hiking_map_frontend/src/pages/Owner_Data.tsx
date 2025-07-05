// styles
import styles from '../styles/pages/Owner_Data.module.scss';

// components
import Map from '../components/common/Map/Map';
import Data from '../components/common/Data/Data';

// context
import { TableProvider } from '../context/TableContext';
import { useAuth } from '../context/AuthContext';

// react
import { useParams, Navigate } from 'react-router-dom';
import { useEffect } from 'react';

// store
import { useTrailMetaStore } from '../store/useTrailMetaStore';
import { useTrailDataStore } from '../store/useTrailDataStore';

// hooks
import { useOwnerDetail } from '../hooks/useOwnerDetail';

export default function Owner_Data() {
    const { name, type } = useParams<{ name: string; type: string }>();
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const { user } = useAuth();
    const location = window.location.pathname + window.location.search;

    const { owner } = useOwnerDetail({ name: name!, type: type! });
    const setOwnerUuid = useTrailMetaStore((state) => state.setOwnerUuid);
    const setType = useTrailMetaStore((state) => state.setType);

    useEffect(() => {
        const _owner_uuid = owner?.uuid ?? '';
        const _type = type || '';
        if (_owner_uuid && _type) {
            setOwnerUuid(_owner_uuid);
            setType(_type);
            useTrailDataStore.getState().fetchTrails();
        }
    }, [owner, type]);

    // 如果是編輯模式，卻沒登入，就導去 login
    const allowAccess = (mode === 'edit' && name === user?.username) || mode === 'map' || mode === 'data';

    if (!allowAccess) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
        <TableProvider>
            <div className={`${styles.Owner_Data}`}>
                <Data />
                <Map />
            </div>
        </TableProvider>
    );
}
