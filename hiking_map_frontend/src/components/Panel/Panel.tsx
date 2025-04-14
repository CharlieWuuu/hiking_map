import styles from './Panel.module.scss';
import ZoomInUrl from '../../assets/Panel_ZoomIn.svg';
import ZoomOutUrl from '../../assets/Panel_ZoomOut.svg';
import ClosePanel from '../../assets/Panel_ClosePanel.svg';
import { useState } from 'react';
import type { PanelType } from '../../types/uiPanels';

type Props = {
    type: PanelType;
    tabs?: React.ReactNode;
    hasCloseButton?: boolean;
    onClose?: () => void;
};

export default function Panel({ type, tabs, hasCloseButton = true, onClose }: Props) {
    const [IsZoomIn, setIsZoomIn] = useState(false);

    const PANEL_TITLES: Record<PanelType, string> = {
        data: '資料總覽',
        detail: '詳細資料',
        auth: '帳號',
        info: '網站介紹',
    };

    const title = PANEL_TITLES[type];

    return (
        <div className={`${styles.Panel} ${IsZoomIn ? styles.ZoomIn : ''}`}>
            <div className={styles.panelButton}>
                <button>
                    <img src={IsZoomIn ? ZoomOutUrl : ZoomInUrl} alt="放大" onClick={() => setIsZoomIn(!IsZoomIn)} />
                </button>
                {hasCloseButton && onClose && (
                    <button onClick={() => onClose()}>
                        <img src={ClosePanel} alt="關閉" />
                    </button>
                )}
            </div>
            {tabs}
            <div className={styles.title}>
                <p>{title}</p>
            </div>
            <div className={styles.content}>內文</div>
        </div>
    );
}
