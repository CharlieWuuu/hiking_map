import Data_All from './Data_All';
import styles from './Data.module.scss';
import GoBack from '../GoBack/GoBack';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SearchData from '../Search/SearchData';

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
        <div className={styles.Panel_Data}>
            <div className={styles.Panel_Header}>
                <GoBack url={`/owner/${type}/${name}`} />
                <SearchData />
                <div>
                    {mode !== 'edit' && <button onClick={() => handleMode()}>編輯</button>}
                    {mode === 'edit' && <button onClick={() => handleMode()}>資料</button>}
                </div>
            </div>
            <Data_All />
        </div>
    );
}
