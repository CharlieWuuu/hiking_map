import styles from './Data_Detail.module.scss';
import { TrailProperties } from '../../types/trails';
import { useEffect, useState } from 'react';
import { useModal } from '../../context/ModalContext';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { usePatchData } from '../../context/PatchDataContext';
import { usePolyline } from '../../context/PolylineContext';
import Menu_Map from '../../assets/images/Menu_Map.svg';
import Navbar_Edit from '../../assets/images/Navbar_Edit.svg';
import Close from '../../assets/images/Panel_ClosePanel.svg';
import Delete from '../../assets/images/Data_Delete.svg';
import Checked from '../../assets/images/Data_Checked.svg';
import Upload from '../../assets/images/Data_Upload.svg';
import Save from '../../assets/images/Data_Save.svg';

type patchData = {
    name: string;
    county: string;
    town: string;
    time: string;
    url: string[];
    note: string;
    public: boolean;
    hundred_id: string | null;
    small_hundred_id: string | null;
    hundred_trail_id: string | null;
};

type Props = {
    trails: TrailProperties;
};

export default function Data_Detail({ trails }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const date = new Date(trails.time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = `${year}年${month}月${day}日`;
    const { patchData, setPatchData } = usePatchData();
    const { setModalIsOpen, setModalType } = useModal();
    const { setActiveFeatureUuid, setDeleteFeatureUuid } = usePolyline();
    const { version, setVersion } = usePolyline();
    const [isUrlEdited, setIsUrlEdited] = useState(false);

    useEffect(() => {
        console.log(patchData);
    }, [patchData]);

    const patchProperties = async () => {
        try {
            const baseURL = import.meta.env.VITE_API_URL;
            const res = await fetch(`${baseURL}/trails/${trails.uuid}/properties`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(patchData),
            });

            const result = await res.json();
            if (result.success) {
                setModalType('complete');
                setModalIsOpen(true);
                setActiveFeatureUuid(null);
                setVersion(version + 1);
                setPatchData(null);
            } else {
                alert('上傳失敗');
            }
        } catch (err) {
            console.error(err);
            alert('錯誤：無法上傳');
        }
    };

    const { name, type } = useParams<{ name: string; type: string; mode: string }>();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode');
    const handleMode = () => {
        navigate(`/owner/${type}/${name}/data?mode=map`, { replace: true });
    };

    const [urlArray, setUrlArray] = useState<string[]>([]);

    useEffect(() => {
        let url = trails.url;
        if (isUrlEdited) {
            url = patchData?.url ?? [];
        }
        setUrlArray(url);
    }, [isEditing, patchData?.url, isUrlEdited]);

    return (
        <div className={`${styles.Data_Detail}`}>
            <div className={`${styles.Detail_Card}`}>
                <div className={styles.Card_title}>
                    <div className={styles.Card_name}>
                        {!isEditing && <p>{trails.name}</p>}
                        {isEditing && (
                            <input
                                type="text"
                                defaultValue={trails.name}
                                onChange={(e) => {
                                    setPatchData({ ...(patchData as patchData), name: e.target.value as string });
                                }}
                            />
                        )}
                        <span>#{trails.id}</span>
                    </div>
                    {mode === 'edit' && (
                        <div className={styles.Card_edit}>
                            {!isEditing && (
                                <button onClick={() => setIsEditing(true)}>
                                    <img src={Navbar_Edit} alt="編輯" />
                                </button>
                            )}
                            {isEditing && (
                                <button
                                    style={patchData ? {} : { opacity: '0.2', pointerEvents: 'none' }}
                                    onClick={() => {
                                        if (!patchData) return;
                                        patchProperties();
                                    }}>
                                    <img src={Save} alt="儲存" />
                                </button>
                            )}
                            {isEditing && (
                                <button
                                    onClick={() => {
                                        setModalIsOpen(true);
                                        setModalType('file_update');
                                    }}>
                                    <img src={Upload} alt="更新軌跡" />
                                </button>
                            )}

                            {isEditing && (
                                <button
                                    onClick={() => {
                                        setDeleteFeatureUuid(trails?.uuid);
                                        setModalIsOpen(true);
                                        setModalType('delete');
                                    }}>
                                    <img src={Delete} alt="刪除" />
                                </button>
                            )}
                        </div>
                    )}

                    {mode === 'data' && (
                        <div className={styles.Card_edit}>
                            {!isEditing && (
                                <button onClick={() => handleMode()}>
                                    <img src={Menu_Map} alt="地圖" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className={styles.Card_properties}>
                    <div className={styles.Card_district}>
                        <span>縣市</span>
                        {!isEditing && <p>{trails.county ?? '-'}</p>}
                        {isEditing && (
                            <input
                                type="text"
                                defaultValue={trails.county}
                                onChange={(e) => {
                                    setPatchData({ ...(patchData as patchData), county: e.target.value as string });
                                }}
                            />
                        )}
                    </div>

                    <div className={styles.Card_district}>
                        <span>鄉鎮</span>
                        {!isEditing && <p>{trails.town ?? '-'}</p>}
                        {isEditing && (
                            <input
                                type="text"
                                defaultValue={trails.town}
                                onChange={(e) => {
                                    setPatchData({ ...(patchData as patchData), town: e.target.value as string });
                                }}
                            />
                        )}
                    </div>
                    <div className={styles.Card_time}>
                        <span>日期</span>
                        {!isEditing && <p>{time}</p>}
                        {isEditing && (
                            <input
                                type="date"
                                defaultValue={new Date(trails.time).toISOString().split('T')[0]}
                                onChange={(e) => {
                                    setPatchData({ ...(patchData as patchData), time: e.target.value as string });
                                }}
                            />
                        )}
                    </div>

                    <div className={styles.Card_length}>
                        <span>距離</span>
                        <p>{trails.length} 公里</p>
                    </div>

                    <div className={styles.Card_check}>
                        <span>公開</span>
                        {!isEditing && <img src={trails.public ? Checked : Close} alt="" />}
                        {isEditing && (
                            <input
                                type="checkbox"
                                defaultChecked={trails.public}
                                className={styles.disabled}
                                onChange={(e) => {
                                    setPatchData({ ...(patchData as patchData), public: e.target.checked as boolean });
                                }}
                            />
                        )}
                    </div>

                    <div className={styles.Card_check}>
                        <span>百岳</span>
                        {!isEditing && <img src={trails.hundred_id ? Checked : Close} alt="" />}
                        {isEditing && (
                            <input
                                type="checkbox"
                                defaultChecked={trails.hundred_id !== null}
                                className={styles.disabled}
                                onChange={(e) => {
                                    setPatchData({ ...(patchData as patchData), hundred_id: e.target.checked ? 'true' : null });
                                }}
                            />
                        )}
                    </div>

                    <div className={styles.Card_check}>
                        <span>小百岳</span>
                        {!isEditing && <img src={trails.small_hundred_id ? Checked : Close} alt="" />}
                        {isEditing && (
                            <input
                                type="checkbox"
                                defaultChecked={trails.small_hundred_id !== null}
                                className={styles.disabled}
                                onChange={(e) => {
                                    setPatchData({ ...(patchData as patchData), small_hundred_id: e.target.checked ? 'true' : null });
                                }}
                            />
                        )}
                    </div>

                    <div className={styles.Card_check}>
                        <span>百大必訪步道</span>
                        {!isEditing && <img src={trails.hundred_trail_id ? Checked : Close} alt="" />}
                        {isEditing && (
                            <input
                                type="checkbox"
                                defaultChecked={trails.hundred_trail_id !== null}
                                className={styles.disabled}
                                onChange={(e) => {
                                    setPatchData({ ...(patchData as patchData), hundred_trail_id: e.target.checked ? 'true' : null });
                                }}
                            />
                        )}
                    </div>

                    <div className={styles.Card_url}>
                        <span>路線連結</span>
                        <div>
                            {Array.isArray(urlArray) && urlArray.length > 0 ? (
                                urlArray.map((element: string, index: number) => (
                                    <a
                                        key={index} // 用網址作為 key，若為空備援用 index
                                        href={element}
                                        target="_blank"
                                        rel="noopener noreferrer">
                                        連結-{index + 1}
                                    </a>
                                ))
                            ) : (
                                <p>-</p>
                            )}
                            {isEditing && (
                                <button
                                    onClick={() => {
                                        setModalType('editUrl');
                                        setModalIsOpen(true);
                                        setIsUrlEdited(true);
                                        if (patchData === null || patchData?.url === null) {
                                            setPatchData({ ...(patchData as patchData), url: trails?.url });
                                        } else {
                                            setPatchData({ ...(patchData as patchData), url: patchData?.url ?? [] });
                                        }
                                    }}>
                                    <img src={Navbar_Edit} alt="編輯" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.Card_note}>
                        <span>說明</span>
                        {!isEditing && <p>{trails.note ?? '-'}</p>}
                        {isEditing && (
                            <textarea
                                defaultValue={trails?.note}
                                onChange={(e) => {
                                    setPatchData({ ...(patchData as patchData), note: e.target.value as string });
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
