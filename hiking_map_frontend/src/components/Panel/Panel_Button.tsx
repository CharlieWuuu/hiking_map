import './Panel_Button.scss'; // 因為 Panel、Map 的 hover 行為影響到 Panel_Button 的樣式，所以不用 modules
import ZoomInUrl from '../../assets/Panel_ZoomIn.svg';
import ZoomOutUrl from '../../assets/Panel_ZoomOut.svg';
import ClosePanel from '../../assets/Panel_ClosePanel.svg';

type Props = {
    IsZoomIn?: boolean;
    setIsZoomIn: React.Dispatch<React.SetStateAction<boolean>>;
    hasCloseButton?: boolean;
    onClose?: () => void;
};
export default function Panel_Button({ IsZoomIn, setIsZoomIn, hasCloseButton = true, onClose }: Props) {
    return (
        <div className="Panel_Button">
            <button>
                <img src={IsZoomIn ? ZoomOutUrl : ZoomInUrl} alt="放大" onClick={() => setIsZoomIn(!IsZoomIn)} />
            </button>
            {hasCloseButton && onClose && (
                <button onClick={() => onClose()}>
                    <img src={ClosePanel} alt="關閉" />
                </button>
            )}
        </div>
    );
}
