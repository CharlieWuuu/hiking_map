import SearchUrl from '../../assets/images/Navbar_Search.svg';
import { Autocomplete } from '@mui/material';
import { Popper } from '@mui/material';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Search.module.scss';
import styleUser from './SearchUser.module.scss';

type Owner = {
    name: string;
    name_zh?: string;
    id: string;
    uuid: string;
    avatar: string;
    level: string;
    description: string;
    type: string;
    type_zh?: string;
};

type Props = {
    ownerList: Owner[];
};

export default function SearchUser({ ownerList }: Props) {
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [selectedOption, setSelectedOption] = useState<Owner | null>(null);
    const [inputValue, setInputValue] = useState('');
    const searchBarRef = useRef<HTMLDivElement | null>(null);
    const ownerListWithType = ownerList.map((o) => ({
        ...o,
        type_zh: o.type === 'user' ? '用戶' : '圖層',
        name_zh: o.name_zh || o.name,
    }));
    const navigate = useNavigate();

    const nameList: Owner[] = ownerListWithType.map((o) => ({
        name: o.name,
        name_zh: o.name_zh,
        type: o.type,
        type_zh: o.type_zh,
        uuid: o.uuid,
        avatar: o.avatar,
        level: o.level,
        description: o.description,
        id: o.id,
    }));

    const handleSearchClick = () => {
        const normalizedInput = inputValue.trim().toLowerCase();
        const matched = nameList.find((option) => option.name.toLowerCase().includes(normalizedInput));
        if (matched) handleSelectOption(matched);
        else console.warn('查無資料');
    };

    const handleSelectOption = (option: Owner) => {
        if (!option) return;
        setSelectedOption(option); // 選中它
        navigate(`/owner/${option.type}/${option.name}`, { state: option });
    };

    const autoCompleteWidth = searchBarRef.current ? searchBarRef.current.getBoundingClientRect().width : 'auto';

    return (
        <div className={`${styles.SearchBar} ${showAutocomplete ? styles.active : ''} ${styleUser.SearchBar}`} ref={searchBarRef}>
            <Autocomplete
                options={nameList}
                value={selectedOption}
                inputValue={inputValue}
                popupIcon={null}
                autoComplete={true}
                // open={true}
                // disableCloseOnSelect={true} // 不關閉選單
                sx={{ width: '100%' }}
                getOptionLabel={(option) => option.name_zh || option.name} // 只顯示 label，不串奇怪的值
                isOptionEqualToValue={(option, value) => option.uuid === value.uuid} // 用 uuid 判斷是否相等
                onOpen={() => setShowAutocomplete(true)} // 不需要做任何事
                onClose={() => setShowAutocomplete(false)} // 防止關閉
                onChange={(_, selected) => setSelectedOption(selected)}
                onInputChange={(_, newInputValue, reason) => {
                    if (reason === 'input') setInputValue(newInputValue);
                }}
                renderInput={(params) => (
                    <div ref={params.InputProps.ref} style={{ width: '100%' }}>
                        <input
                            {...params.inputProps}
                            placeholder="搜尋用戶或圖層"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const input = e.currentTarget.value.trim().toLowerCase();
                                    const matched = nameList.find((option) => {
                                        return option.name.toLowerCase().includes(input) || option.name_zh?.includes(input);
                                    });
                                    if (matched) handleSelectOption(matched);
                                }
                                params.inputProps.onKeyDown?.(e);
                            }}
                        />
                    </div>
                )}
                renderOption={(props, option) => {
                    const { key, ...rest } = props;
                    return (
                        <li key={option.uuid} {...rest} onClick={() => handleSelectOption(option)}>
                            <p>{option.name_zh}</p>
                            <span>{option.type_zh}</span>
                        </li>
                    );
                }}
                noOptionsText={<div>查無資料</div>}
                slots={{
                    // -17 = 1rem + 1px = 左邊的 padding + border
                    popper: (props) => <Popper {...props} placement="bottom-start" modifiers={[{ name: 'offset', options: { offset: [-16, -2] } }]} />,
                    paper: (props) => <div {...props} style={{ width: autoCompleteWidth }} />,
                }}
            />
            <img src={SearchUrl} alt="搜尋" onClick={() => handleSearchClick()} />
        </div>
    );
}
