import styles from './BottomBar.module.scss';
import Hamburger from '../../assets/images/Navbar_Hamburger.svg';
import Index from '../../assets/images/Menu_Index.svg';
import DataUser from '../../assets/images/Menu_Data_User.svg';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DataUserChart from '../../assets/images/Menu_Data_User_Chart.svg';

type Props = {
    setMenuIsOpen: (isOpen: boolean) => void;
    type: string | null;
};
export default function BottomBar({ setMenuIsOpen, type }: Props) {
    const { user } = useAuth();
    if (type === 'data') {
        return (
            <div className={styles.BottomBar}>
                <Link to="/" onClick={() => setMenuIsOpen(false)}>
                    <img src={Index} alt="Icon" />
                    <span>首頁</span>
                </Link>

                <div onClick={() => {}}>
                    <img src={Index} alt="Icon" />
                    <span>詳細資料</span>
                </div>

                <Link to={user ? `/user/${user?.username}/chart` : '/login'} onClick={() => setMenuIsOpen(false)}>
                    <img src={DataUserChart} alt="Icon" />
                    <span>我的統計</span>
                </Link>

                <div onClick={() => setMenuIsOpen(true)}>
                    <img src={Hamburger} alt="收合" />
                    <span>更多</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.BottomBar}>
            <Link to="/" onClick={() => setMenuIsOpen(false)}>
                <img src={Index} alt="Icon" />
                <span>首頁</span>
            </Link>

            <Link to={user ? `/user/${user?.username}` : '/login'} onClick={() => setMenuIsOpen(false)}>
                <img src={DataUser} alt="Icon" />
                <span>我的軌跡</span>
            </Link>

            <div onClick={() => setMenuIsOpen(true)}>
                <img src={Hamburger} alt="收合" />
                <span>更多</span>
            </div>
        </div>
    );
}
