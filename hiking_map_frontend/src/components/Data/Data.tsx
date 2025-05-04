import Data_All from './Data_All';
import styles from './Data.module.scss';
import GoBack from '../GoBack/GoBack';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SearchData from '../Search/SearchData';
import { FeatureCollection } from 'geojson';

type Props = {
    trails: FeatureCollection | null;
};

export default function Data({ trails }: Props) {
    const { name, type } = useParams<{ name: string; type: string; mode: string }>();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    const navigate = useNavigate();
    const handleMode = () => {
        if (mode === 'edit') {
            navigate(`/owner/${type}/${name}/data?mode=data`, { replace: true });
        } else {
            navigate(`/owner/${type}/${name}/data?mode=edit`, { replace: true });
        }
    };

    return (
        <div className={styles.Data}>
            <div className={styles.Panel_Header}>
                <GoBack url={`/owner/${type}/${name}`} />
                <SearchData trails={trails} />
                <div>
                    {mode !== 'edit' && <button onClick={() => handleMode()}>編輯</button>}
                    {mode === 'edit' && <button onClick={() => handleMode()}>資料</button>}
                </div>
            </div>

            <Data_All trails={trails} />
        </div>
    );
}
