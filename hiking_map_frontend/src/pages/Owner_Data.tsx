// styles
import styles from '../styles/pages/Owner_Data.module.scss';

// components
import Map from '../components/Map/Map';
import Data from '../components/Data/Data';

// context
import { TableProvider } from '../context/TableContext';
import { useAuth } from '../context/AuthContext';

// react
import { useParams, Navigate } from 'react-router-dom';

export default function Owner_Data() {
    const { name } = useParams<{ name: string; type: string }>();
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const { user } = useAuth();
    const location = window.location.pathname + window.location.search;

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
