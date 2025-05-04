import SearchUrl from '../../assets/images/Navbar_Search.svg';
import { Autocomplete } from '@mui/material';
import { Popper } from '@mui/material';
import { useState, useRef } from 'react';
import { usePolyline } from '../../context/PolylineContext';
import styles from './Search.module.scss';
import './Search.scss';
import { FeatureCollection } from 'geojson';

type TrailOption = {
    label: string;
    county: string;
    town: string;
    time: string;
    realtime: string;
    uuid: string;
};

type Props = {
    trails: FeatureCollection | null;
};

export default function SearchData({ trails }: Props) {
    const geojson = trails;
    const { setActiveFeatureUuid } = usePolyline();

    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [selectedOption, setSelectedOption] = useState<TrailOption | null>(null);
    const [inputValue, setInputValue] = useState('');

    const searchBarRef = useRef<HTMLDivElement | null>(null);

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

    const handleSelectOption = (option: TrailOption) => {
        if (!option) return;
        setSelectedOption(option); // 選中它
        setActiveFeatureUuid(option.uuid); // 更新線段
    };

    const handleSearchClick = () => {
        const normalizedInput = inputValue.trim().toLowerCase();
        const matched = nameList.find((option) => option.label.toLowerCase().includes(normalizedInput));
        if (matched) handleSelectOption(matched);
        else console.warn('查無資料');
    };

    return (
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
                            placeholder="搜尋步道"
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
                                    options: { offset: [-17, 0] }, // -17 = 1rem + 1px = 左邊的 padding + border
                                },
                            ]}
                        />
                    ),
                    paper: (props) => (
                        <div
                            {...props}
                            style={{
                                width: searchBarRef.current ? searchBarRef.current.getBoundingClientRect().width - 2 : 'auto',
                            }}
                        />
                    ),
                }}
            />
            <img src={SearchUrl} alt="搜尋" onClick={() => handleSearchClick()} />
        </div>
    );
}
