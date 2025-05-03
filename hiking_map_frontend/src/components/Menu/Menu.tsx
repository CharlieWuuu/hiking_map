import styles from './Menu.module.scss';
import Hamburger from '../../assets/images/Navbar_Hamburger.svg';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

import Index from '../../assets/images/Menu_Index.svg';
import DataUser from '../../assets/images/Menu_Data_User.svg';
import DataUserChart from '../../assets/images/Menu_Data_User_Chart.svg';
import DataUserEdit from '../../assets/images/Menu_Data_User_Edit.svg';
import Intro from '../../assets/images/Menu_Intro.svg';
import Login from '../../assets/images/Menu_Login.svg';

type Props = {
    menuIsOpen: boolean;
    setMenuIsOpen: (isOpen: boolean) => void;
};

export default function Menu({ menuIsOpen, setMenuIsOpen }: Props) {
    const { user, isLoggedIn } = useAuth();

    return (
        <div className={`${styles.Menu_Backdrop} ${menuIsOpen ? styles.open : ''}`} onClick={() => setMenuIsOpen(false)}>
            <div className={`${styles.Menu} ${menuIsOpen ? styles.active : ''}`}>
                <div className={styles.Hamburger} onClick={() => setMenuIsOpen(false)}>
                    <img src={Hamburger} alt="收合" />
                </div>
                <ul>
                    <Link to="/" onClick={() => setMenuIsOpen(false)}>
                        <img src={Index} alt="Icon" />
                        <span>首頁</span>
                    </Link>

                    <Link to={user ? `/user/${user?.username}` : '/login'} onClick={() => setMenuIsOpen(false)}>
                        <img src={DataUser} alt="Icon" />
                        <span>我的軌跡</span>
                    </Link>

                    <Link to={user ? `/user/${user?.username}/chart` : '/login'} onClick={() => setMenuIsOpen(false)}>
                        <img src={DataUserChart} alt="Icon" />
                        <span>我的統計</span>
                    </Link>

                    {isLoggedIn && (
                        <Link to={`/user/${user?.username}/edit`} onClick={() => setMenuIsOpen(false)}>
                            <img src={DataUserEdit} alt="Icon" />
                            <span>編輯資料</span>
                        </Link>
                    )}

                    <Link to="/intro" onClick={() => setMenuIsOpen(false)}>
                        <img src={Intro} alt="Icon" />
                        <span>網站介紹</span>
                    </Link>

                    <Link to="/login" onClick={() => setMenuIsOpen(false)}>
                        <img src={Login} alt="Icon" />
                        <span>{isLoggedIn ? '帳號' : '登入'}</span>
                    </Link>
                </ul>
            </div>
        </div>
    );
}
