import Map from '../components/Map/Map';
import styles from './Owner_Data.module.scss';
import Data from '../components/Data/Data';
import { useParams } from 'react-router-dom';
import { useOwnerDetail } from '../hooks/useOwnerDetail';
import { useTrails } from '../hooks/useTrails';
import { TableProvider } from '../context/TableContext';

export default function Owner_Data() {
    const { name, type } = useParams<{ name: string; type: string; mode: string }>();
    const { owner } = useOwnerDetail({ name: name!, type: type! });
    const { trails } = useTrails({ uuid: owner?.uuid ?? '', type: type! });

    return (
        <TableProvider features={trails?.features}>
            <div className={`${styles.Owner_Data}`}>
                <Data trails={trails} />
                <Map trails={trails} />
            </div>
        </TableProvider>
    );
}
