import SearchUrl from '../../assets/images/Navbar_Search.svg';
import { Autocomplete } from '@mui/material';
import { Popper } from '@mui/material';
import { useState, useRef } from 'react';
import { usePolyline } from '../../context/PolylineContext';
import styles from './SearchUser.module.scss';

type fakeData = {
    name: string;
    name_zh: string;
    type: string;
    type_zh: string;
    uuid: string;
};

export default function SearchUser() {
    const fakeData = [
        { name: 'Charlie', name_zh: 'Charlie', type: 'user', type_zh: '用戶', uuid: 'uuid-charlie' },
        { name: 'Dora', name_zh: 'Dora', type: 'user', type_zh: '用戶', uuid: 'uuid-dora' },
        { name: 'Lawrence', name_zh: 'Lawrence', type: 'user', type_zh: '用戶', uuid: 'uuid-lawrence' },
        { name: 'Hundred', name_zh: '百岳', type: 'layer', type_zh: '圖層', uuid: 'uuid-hundred' },
        { name: 'SmallHundred', name_zh: '小百岳', type: 'Layer', type_zh: '圖層', uuid: 'uuid-smallHundred' },
    ];
    const { setActiveFeatureUuid } = usePolyline();

    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [selectedOption, setSelectedOption] = useState<fakeData | null>(null);
    const [inputValue, setInputValue] = useState('');

    const searchBarRef = useRef<HTMLDivElement | null>(null);

    const nameList =
        fakeData
            .map((f) => ({
                name: f.name || '',
                name_zh: f.name_zh || '',
                type: f.type || '',
                type_zh: f.type_zh || '',
                uuid: f.name || '',
            }))
            .sort((a, b) => a.name.localeCompare(b.name)) || [];

    const handleSelectOption = (option: fakeData) => {
        if (!option) return;
        setSelectedOption(option); // 選中它
        setActiveFeatureUuid(option.uuid); // 更新線段
    };

    const handleSearchClick = () => {
        const normalizedInput = inputValue.trim().toLowerCase();
        const matched = nameList.find((option) => option.name.toLowerCase().includes(normalizedInput));
        if (matched) handleSelectOption(matched);
        else console.warn('查無資料');
    };

    return (
        <div className={`${styles.SearchBar} ${showAutocomplete ? styles.active : ''}`} ref={searchBarRef}>
            <Autocomplete
                options={nameList}
                getOptionLabel={(option) => option.name} // 只顯示 label，不串奇怪的值
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
                            placeholder="搜尋用戶或圖層（開發中）"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const normalizedInput = inputValue.trim().toLowerCase();
                                    const matched = nameList.find((option) => option.name.toLowerCase().includes(normalizedInput));
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
                            <p>{option.name_zh}</p>
                            <span>{option.type_zh}</span>
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
