import './Panel.scss'; // 因為 hover 行為影響到 Panel_Button 的樣式，所以不用 modules
import Panel_Button from './Panel_Button';
import { useState, useEffect } from 'react';
import type { PanelType } from '../../types/uiPanels';
import Panel_Data from './Panel_Data';
import Panel_Info from './Panel_Info';
import Panel_Auth from './Panel_Auth';
import Panel_Edit from './Panel_Edit';

type Props = {
    type: PanelType;
    hasCloseButton?: boolean;
    onClose?: () => void;
};

export default function Panel({ type, hasCloseButton = true, onClose }: Props) {
    const [IsZoomIn, setIsZoomIn] = useState(false);
    // useEffect(() => {
    //     if (type === 'edit') {
    //         setIsZoomIn(true);
    //     } else {
    //         setIsZoomIn(false);
    //     }
    // }, [type]);

    return (
        <div className={`Panel ${IsZoomIn ? 'ZoomIn' : ''} Panel_${type}`}>
            {/* <Panel_Button IsZoomIn={IsZoomIn} setIsZoomIn={setIsZoomIn} hasCloseButton={hasCloseButton} onClose={onClose} /> */}
            {type === 'data' && <Panel_Data />}
            {type === 'info' && <Panel_Info />}
            {type === 'auth' && <Panel_Auth />}
            {type === 'edit' && <Panel_Edit />}
        </div>
    );
}
