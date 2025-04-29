import styles from './Navbar.module.scss';
import LogoUrl from '../../assets/images/Navbar_Logo.svg';
import EditUrl from '../../assets/images/Navbar_Edit.svg';
import InfoUrl from '../../assets/images/Navbar_Info.svg';
import FullScreen from '../../assets/images/FullScreen.svg';
import FullScreen_back from '../../assets/images/FullScreen_back.svg';
import Hamburger from '../../assets/images/Navbar_Hamburger.svg';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePanel } from '../../context/PanelContext';
import './Navbar.scss';
import SearchUser from '../Search/SearchUser';

type Props = {
    setMenuIsOpen: (isOpen: boolean) => void;
};

export default function Navbar({ setMenuIsOpen }: Props) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { isLoggedIn } = useAuth();
    const { uiPanels, setUIPanels } = usePanel();

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
        <div className={styles.Navbar}>
            <div className={styles.Logo}>
                <img src={LogoUrl} alt="LOGO" />
            </div>
            <SearchUser />
            <div className={styles.RightButton}>
                <button onClick={toggleFullscreen}>{isFullscreen ? <img src={FullScreen_back} alt="全螢幕" /> : <img src={FullScreen} alt="關閉全螢幕" />}</button>
                {uiPanels && setUIPanels && isLoggedIn && (
                    <button
                        className={`${uiPanels.edit ? 'active' : ''}`}
                        onClick={() =>
                            setUIPanels({
                                ...uiPanels,
                                data: uiPanels.edit,
                                auth: false,
                                info: false,
                                edit: !uiPanels.edit,
                            })
                        }>
                        <img src={EditUrl} alt="編輯" />
                    </button>
                )}
                {uiPanels && setUIPanels && (
                    <button className={`${uiPanels.info ? 'active' : ''}`} onClick={() => setUIPanels({ ...uiPanels, info: !uiPanels.info })}>
                        <img src={InfoUrl} alt="網站介紹" />
                    </button>
                )}
                {/* {uiPanels && setUIPanels && (
                    <button className={`${styles.authBtn} ${uiPanels.auth ? 'active' : ''}`} onClick={() => setUIPanels({ ...uiPanels, auth: !uiPanels.auth })}>
                        {isLoggedIn ? '帳號' : '登入'}
                    </button>
                )} */}
                <button className={`${styles.authBtn}`}>
                    <a href="/login" style={{ color: 'white' }}>
                        登入
                    </a>
                </button>
            </div>
            <div className={styles.Hamburger} onClick={() => setMenuIsOpen(true)}>
                <img src={Hamburger} alt="更多" />
            </div>
        </div>
    );
}
