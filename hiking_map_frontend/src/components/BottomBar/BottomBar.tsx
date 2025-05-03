import styles from './BottomBar.module.scss';
import Hamburger from '../../assets/images/Navbar_Hamburger.svg';
import Index from '../../assets/images/Menu_Index.svg';
import { Link } from 'react-router-dom';
import search from '../../assets/images/Navbar_Search.svg';
import { useLocation } from 'react-router-dom';
import { useFullScreenContext } from '../../context/FullScreenContext';

type Props = {
    setMenuIsOpen: (isOpen: boolean) => void;
};
export default function BottomBar({ setMenuIsOpen }: Props) {
    const { isFullScreen } = useFullScreenContext();
    const location = useLocation();
    const dataPage = ['user', 'layer'];
    const isDataPage = dataPage.some((path) => location.pathname.includes(path));

    if (isDataPage) {
        return (
            <div className={`${styles.BottomBar} ${isFullScreen ? styles.fullscreen : ''}`}>
                <Link to="/" onClick={() => setMenuIsOpen(false)}>
                    <img src={Index} alt="Icon" />
                    <span>首頁</span>
                </Link>

                <Link to="/search" onClick={() => setMenuIsOpen(false)}>
                    <img src={search} alt="Icon" />
                    <span>搜尋</span>
                </Link>
                {/*
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
                )} */}

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

            <Link to="/search" onClick={() => setMenuIsOpen(false)}>
                <img src={search} alt="Icon" />
                <span>搜尋</span>
            </Link>

            <div onClick={() => setMenuIsOpen(true)}>
                <img src={Hamburger} alt="收合" />
                <span>更多</span>
            </div>
        </div>
    );
}
