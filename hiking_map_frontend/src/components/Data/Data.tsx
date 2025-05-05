import Data_All from './Data_All';
import styles from './Data.module.scss';
import GoBack from '../GoBack/GoBack';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SearchData from '../Search/SearchData';
import DataUserEdit from '../../assets/images/Menu_Data_User_Edit.svg';
import Menu_Data from '../../assets/images/Menu_Data.svg';
import { useAuth } from '../../context/AuthContext';

export default function Data() {
    const { user } = useAuth();
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
                <SearchData />
                {user?.username === name && (
                    <div>
                        <button onClick={() => handleMode()} style={{ width: '32px', height: '32px' }}>
                            <img src={mode === 'edit' ? Menu_Data : DataUserEdit} alt={mode === 'edit' ? '資料' : '編輯'} width={16} />
                        </button>
                    </div>
                )}
            </div>

            <Data_All />
        </div>
    );
}
