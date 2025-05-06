import './Map_ZoomIn.scss'; // 因為 Panel、Map 的 hover 行為影響到 Panel_Button 的樣式，所以不用 modules
import ZoomInUrl from '../../assets/images/Panel_ZoomIn.svg';
import ZoomOutUrl from '../../assets/images/Panel_ZoomOut.svg';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

type Props = {
    IsZoomIn?: boolean;
    setIsZoomIn: React.Dispatch<React.SetStateAction<boolean>>;
};
export default function Map_ZoomIn({ IsZoomIn, setIsZoomIn }: Props) {
    const { name, type } = useParams();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode') || 'map'; // 預設值
    const navigate = useNavigate();

    // 用 useRef 記住「非 map」的上一次 mode（data 或 edit）
    const lastNonMapModeRef = useRef<string>('data'); // 預設值是 data

    useEffect(() => {
        if (mode && mode !== 'map') {
            lastNonMapModeRef.current = mode;
        }
    }, [mode]);

    const handleMode = () => {
        const nextMode = mode === 'map' ? lastNonMapModeRef.current : 'map';
        navigate(`/owner/${type}/${name}/data?mode=${nextMode}`, { replace: true });
    };
    return (
        <div className="Map_ZoomIn">
            <button
                onClick={() => {
                    setIsZoomIn(!IsZoomIn);
                    handleMode();
                }}>
                <img src={mode === 'map' ? ZoomOutUrl : ZoomInUrl} alt={mode === 'map' ? '縮小' : '放大'} />
            </button>
        </div>
    );
}
