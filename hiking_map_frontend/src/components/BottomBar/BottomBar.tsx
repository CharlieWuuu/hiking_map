import styles from './BottomBar.module.scss';
import Hamburger from '../../assets/images/Navbar_Hamburger.svg';
import Index from '../../assets/images/Menu_Index.svg';
import DataUser from '../../assets/images/Menu_Data_User.svg';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DataUserChart from '../../assets/images/Menu_Data_User_Chart.svg';
import Data from '../../assets/images/Menu_Data.svg';
import Map from '../../assets/images/Menu_Map.svg';
import { useLocation } from 'react-router-dom';
import { usePanel } from '../../context/PanelContext';
import { useFullScreenContext } from '../../context/FullScreenContext';

type Props = {
    setMenuIsOpen: (isOpen: boolean) => void;
    type: string | null;
};
export default function BottomBar({ setMenuIsOpen, type }: Props) {
    const { isFullScreen } = useFullScreenContext();
    const { user } = useAuth();
    const location = useLocation();
    const hasChart = location.pathname.includes('chart');
    const { ZoomIn, setZoomIn } = usePanel();
    if (type === 'data') {
        return (
            <div className={`${styles.BottomBar} ${isFullScreen ? styles.fullscreen : ''}`}>
                <Link to="/" onClick={() => setMenuIsOpen(false)}>
                    <img src={Index} alt="Icon" />
                    <span>首頁</span>
                </Link>

                {hasChart ? (
                    <Link to={user ? `/user/${user?.username}` : '/login'} onClick={() => setMenuIsOpen(false)}>
                        <img src={Map} alt="Icon" />
                        <span>地圖</span>
                    </Link>
                ) : (
                    <div onClick={() => setZoomIn(!ZoomIn)}>
                        <img src={ZoomIn ? Map : Data} alt="Icon" />
                        <span>{ZoomIn ? '地圖' : '資料'}</span>
                    </div>
                )}

                {/* <Link to={user ? `/user/${user?.username}/chart` : '/login'} onClick={() => setMenuIsOpen(false)}>
                    <img src={DataUserChart} alt="Icon" />
                    <span>我的統計</span>
                </Link> */}

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

            {/* <Link to={user ? `/user/${user?.username}/chart` : '/login'} onClick={() => setMenuIsOpen(false)}>
                <img src={DataUserChart} alt="Icon" />
                <span>我的統計</span>
            </Link> */}

            <div onClick={() => setMenuIsOpen(true)}>
                <img src={Hamburger} alt="收合" />
                <span>更多</span>
            </div>
        </div>
    );
}
