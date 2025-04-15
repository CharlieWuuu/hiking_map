import styles from './Navbar.module.scss';
import LogoUrl from '../../assets/Navbar_Logo.svg';
import SearchUrl from '../../assets/Navbar_Search.svg';
import InfoUrl from '../../assets/Navbar_Info.svg';
import FullScreen from '../../assets/FullScreen.svg';
import FullScreen_back from '../../assets/FullScreen_back.svg';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

import type { UIPanels, PanelType } from '../../types/uiPanels';

type Props = {
    uiPanels?: UIPanels;
    setUIPanels?: React.Dispatch<React.SetStateAction<Record<PanelType, boolean>>>;
};

export default function Navbar({ uiPanels, setUIPanels }: Props) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { isLoggedIn } = useAuth();

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
            <div className={styles.SearchBar}>
                <input type="text" placeholder="請輸入地點或步道名稱" />
                <img src={SearchUrl} alt="搜尋" />
            </div>
            <div className={styles.RightButton}>
                <button onClick={toggleFullscreen}>{isFullscreen ? <img src={FullScreen_back} alt="全螢幕" /> : <img src={FullScreen} alt="關閉全螢幕" />}</button>
                {uiPanels && setUIPanels && (
                    <button className={`${uiPanels.info ? 'active' : ''}`} onClick={() => setUIPanels({ ...uiPanels, info: !uiPanels.info })}>
                        <img src={InfoUrl} alt="網站介紹" />
                    </button>
                )}
                {uiPanels && setUIPanels && (
                    <button className={`${styles.authBtn} ${uiPanels.auth ? 'active' : ''}`} onClick={() => setUIPanels({ ...uiPanels, auth: !uiPanels.auth })}>
                        {isLoggedIn ? '帳號' : '登入'}
                    </button>
                )}
            </div>
        </div>
    );
}
