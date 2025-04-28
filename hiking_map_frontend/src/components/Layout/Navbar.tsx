import styles from './Navbar.module.scss';
import LogoUrl from '../../assets/Navbar_Logo.svg';
import SearchUrl from '../../assets/Navbar_Search.svg';
import EditUrl from '../../assets/Navbar_Edit.svg';
import InfoUrl from '../../assets/Navbar_Info.svg';
import FullScreen from '../../assets/FullScreen.svg';
import FullScreen_back from '../../assets/FullScreen_back.svg';
import Hamburger from '../../assets/Navbar_Hamburger.svg';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePanel } from '../../context/PanelContext';
import { usePolyline } from '../../context/PolylineContext';
import { useGeojson } from '../../context/GeojsonContext';
import { Autocomplete } from '@mui/material';
import './Navbar.scss';
import { Popper } from '@mui/material';

type Props = {
    setMenuIsOpen: (isOpen: boolean) => void;
};

type TrailOption = {
    label: string;
    county: string;
    town: string;
    time: string;
    realtime: string;
    uuid: string;
};

export default function Navbar({ setMenuIsOpen }: Props) {
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

    const nameList =
        geojson?.features
            .map((f) => ({
                label: f.properties?.name || '',
                county: f.properties?.county || '',
                town: f.properties?.town || '',
                time: (() => {
                    const date = new Date(f.properties?.time);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    return `${year}年${month}月`;
                })(),
                realtime: f.properties?.time,
                uuid: f.properties?.uuid,
            }))
            .sort((a, b) => a.label.localeCompare(b.label, 'zh-Hant')) || [];
    const [inputValue, setInputValue] = useState('');
    const { setActiveFeatureUuid } = usePolyline();

    const searchBarRef = useRef<HTMLDivElement | null>(null);
    const [showAutocomplete, setShowAutocomplete] = useState(false);

    const handleSelectOption = (option: TrailOption) => {
        if (!option) return;
        setSelectedOption(option); // 選中它
        setActiveFeatureUuid(option.uuid); // 更新線段
    };

    const handleSearchClick = () => {
        const normalizedInput = inputValue.trim().toLowerCase();
        const matched = nameList.find((option) => option.label.toLowerCase().includes(normalizedInput));

        if (matched) {
            handleSelectOption(matched);
        } else {
            console.warn('查無資料');
        }
    };
    const [selectedOption, setSelectedOption] = useState<TrailOption | null>(null);
    return (
        <div className={styles.Navbar}>
            <div className={styles.Logo}>
                <img src={LogoUrl} alt="LOGO" />
            </div>
            <div className={`${styles.SearchBar} ${showAutocomplete ? styles.active : ''}`} ref={searchBarRef}>
                <Autocomplete
                    options={nameList}
                    getOptionLabel={(option) => option.label} // 只顯示 label，不串奇怪的值
                    isOptionEqualToValue={(option, value) => option.uuid === value.uuid} // 用 uuid 判斷是否相等
                    popupIcon={null}
                    autoComplete={true}
                    // open={true}
                    // disableCloseOnSelect={true} // 不關閉選單
                    onOpen={() => setShowAutocomplete(true)} // 不需要做任何事
                    onClose={() => setShowAutocomplete(false)} // 防止關閉
                    sx={{ width: '100%' }}
                    value={selectedOption}
                    onChange={(_, selected) => {
                        if (selected) {
                            setSelectedOption(selected);
                            handleSelectOption(selected);
                        }
                    }}
                    inputValue={inputValue}
                    onInputChange={(_, newInputValue, reason) => {
                        if (reason !== 'reset') {
                            setInputValue(newInputValue); // 這就是「及時取得輸入內容」
                        }
                    }}
                    renderInput={(params) => (
                        <div ref={params.InputProps.ref} style={{ width: '100%' }}>
                            <input
                                {...params.inputProps}
                                placeholder="請輸入步道或地名"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const normalizedInput = inputValue.trim().toLowerCase();
                                        const matched = nameList.find((option) => option.label.toLowerCase().includes(normalizedInput));
                                        if (matched) {
                                            handleSelectOption(matched);
                                        }
                                    }

                                    params.inputProps.onKeyDown?.(e);
                                }}
                            />
                        </div>
                    )}
                    renderOption={(props, option) => {
                        const { key, ...rest } = props;
                        return (
                            <li key={option.uuid} {...rest}>
                                <p>{option.label}</p>
                                <span>
                                    {option.county} {option.town} {option.time}
                                </span>
                            </li>
                        );
                    }}
                    noOptionsText={<div>查無資料</div>}
                    slots={{
                        popper: (props) => (
                            <Popper
                                {...props}
                                placement="bottom-start"
                                modifiers={[
                                    {
                                        name: 'offset',
                                        options: { offset: [-16, 0] }, // -16 = 1rem = 左邊的 padding
                                    },
                                ]}
                            />
                        ),
                        paper: (props) => <div {...props} style={{ width: searchBarRef.current?.clientWidth ?? 300 }} />,
                    }}
                />
                <img src={SearchUrl} alt="搜尋" onClick={() => handleSearchClick()} />
            </div>
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
                {uiPanels && setUIPanels && (
                    <button className={`${styles.authBtn} ${uiPanels.auth ? 'active' : ''}`} onClick={() => setUIPanels({ ...uiPanels, auth: !uiPanels.auth })}>
                        {isLoggedIn ? '帳號' : '登入'}
                    </button>
                )}
            </div>
            <div className={styles.Hamburger} style={{ width: '36px', cursor: 'pointer' }} onClick={() => setMenuIsOpen(true)}>
                <img src={Hamburger} alt="更多" />
            </div>
        </div>
    );
}
