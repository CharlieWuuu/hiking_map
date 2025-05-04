import './Map_ZoomIn.scss'; // 因為 Panel、Map 的 hover 行為影響到 Panel_Button 的樣式，所以不用 modules
import ZoomInUrl from '../../assets/images/Panel_ZoomIn.svg';
import ZoomOutUrl from '../../assets/images/Panel_ZoomOut.svg';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

type Props = {
    IsZoomIn?: boolean;
    setIsZoomIn: React.Dispatch<React.SetStateAction<boolean>>;
};
export default function Map_ZoomIn({ IsZoomIn, setIsZoomIn }: Props) {
    const { name, type } = useParams();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    const navigate = useNavigate();
    const handleMode = () => {
        if (mode === 'map') {
            navigate(`/owner/${type}/${name}/data?mode=${mode}`, { replace: true });
        } else {
            navigate(`/owner/${type}/${name}/data?mode=map`, { replace: true });
        }
    };
    return (
        <div className="Map_ZoomIn">
            <button>
                <img
                    src={IsZoomIn ? ZoomOutUrl : ZoomInUrl}
                    alt="放大"
                    onClick={() => {
                        setIsZoomIn(!IsZoomIn);
                        handleMode();
                    }}
                />
            </button>
        </div>
    );
}
