import styles from './Navbar.module.scss';
import LogoUrl from '../../assets/Navbar_Logo.svg';
import SearchUrl from '../../assets/Navbar_Search.svg';
import EditUrl from '../../assets/Navbar_Edit.svg';
import InfoUrl from '../../assets/Navbar_Info.svg';
import FullScreen from '../../assets/FullScreen.svg';
import FullScreen_back from '../../assets/FullScreen_back.svg';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePanel } from '../../context/PanelContext';
import { useTableContext } from '../../context/TableContext';
import { usePolyline } from '../../context/PolylineContext';
import { useGeojson } from '../../context/GeojsonContext';

export default function Navbar() {
    const { geojson } = useGeojson();
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

    const nameList = geojson?.features.map((f) => f.properties?.name).filter((name): name is string => typeof name === 'string') ?? [];
    const { UuidToPage } = useTableContext();
    const [inputValue, setInputValue] = useState('');
    const { setActiveFeatureUuid } = usePolyline();

    return (
        <div className={styles.Navbar}>
            <div className={styles.Logo}>
                <img src={LogoUrl} alt="LOGO" />
            </div>
            <div className={styles.SearchBar}>
                <input
                    type="text"
                    list="search-list"
                    placeholder="請輸入地點或步道名稱"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && geojson) {
                            const match = geojson.features.find((f) => f.properties?.name === inputValue);
                            if (match?.properties?.uuid !== undefined) {
                                UuidToPage(match.properties.uuid);
                                setActiveFeatureUuid(match.properties.uuid);
                                setUIPanels({ ...uiPanels, detail: true });
                            }
                        }
                    }}
                />
                <datalist id="search-list">
                    {nameList.map((name, i) => (
                        <option value={name} key={i} />
                    ))}
                </datalist>

                <img
                    src={SearchUrl}
                    alt="搜尋"
                    onClick={() => {
                        if (geojson) {
                            const match = geojson.features.find((f) => f.properties?.name === inputValue);
                            if (match?.properties?.uuid !== undefined) {
                                UuidToPage(match.properties.uuid);
                                setActiveFeatureUuid(match.properties.uuid);
                                setUIPanels({ ...uiPanels, detail: true });
                            }
                        }
                    }}
                />
            </div>
            <div className={styles.RightButton}>
                <button onClick={toggleFullscreen}>{isFullscreen ? <img src={FullScreen_back} alt="全螢幕" /> : <img src={FullScreen} alt="關閉全螢幕" />}</button>
                {uiPanels && setUIPanels && (
                    <button
                        className={`${uiPanels.edit ? 'active' : ''}`}
                        onClick={() =>
                            setUIPanels({
                                ...uiPanels,
                                data: uiPanels.edit,
                                detail: false,
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
                {uiPanels && setUIPanels && (
                    <button className={`${styles.authBtn} ${uiPanels.auth ? 'active' : ''}`} onClick={() => setUIPanels({ ...uiPanels, auth: !uiPanels.auth })}>
                        {isLoggedIn ? '帳號' : '登入'}
                    </button>
                )}
            </div>
        </div>
    );
}
