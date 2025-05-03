import styles from './Navbar.module.scss';
import LogoUrl from '../../assets/images/Navbar_Logo.svg';
import FullScreen from '../../assets/images/FullScreen.svg';
import FullScreen_back from '../../assets/images/FullScreen_back.svg';
import Hamburger from '../../assets/images/Navbar_Hamburger.svg';
import { useState, useEffect } from 'react';
import './Navbar.scss';
import SearchUser from '../Search/SearchUser';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFullScreenContext } from '../../context/FullScreenContext';

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

type Props = {
    setMenuIsOpen: (isOpen: boolean) => void;
    ownerList: Owner[];
};

export default function Navbar({ setMenuIsOpen, ownerList }: Props) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { isLoggedIn } = useAuth();
    const { isFullScreen } = useFullScreenContext();

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleChange);
        return () => document.removeEventListener('fullscreenchange', handleChange);
    }, []);

    return (
        <div className={`${styles.Navbar} ${isFullScreen ? styles.fullscreen : ''}`}>
            <div className={styles.Hamburger} onClick={() => setMenuIsOpen(true)}>
                <img src={Hamburger} alt="更多" />
            </div>
            <a className={styles.Logo} href="/">
                <img src={LogoUrl} alt="LOGO" />
            </a>
            <div className={styles.SearchBar}>
                <SearchUser ownerList={ownerList} />
            </div>
            <div className={styles.RightButton}>
                <button className={`${styles.fullscreenBtn}`} onClick={toggleFullscreen}>
                    {isFullscreen ? <img src={FullScreen_back} alt="全螢幕" /> : <img src={FullScreen} alt="關閉全螢幕" />}
                </button>
                <button className={`${styles.authBtn}`}>
                    <Link to="/login">{isLoggedIn ? '帳號' : '登入'}</Link>
                </button>
            </div>
        </div>
    );
}
