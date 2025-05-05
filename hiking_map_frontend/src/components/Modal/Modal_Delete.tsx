import { usePolyline } from '../../context/PolylineContext';
import { useModal } from '../../context/ModalContext';
import { useState } from 'react';
import styles from './Modal_Delete.module.scss';

export default function Modal_Delete() {
    const { version, setVersion, setActiveFeatureUuid } = usePolyline();
    const { deleteFeatureUuid } = usePolyline();
    const { setModalIsOpen } = useModal();
    const [deleteComplete, setDeleteComplete] = useState(false);

    const deleteByUuid = async () => {
        try {
            const token = localStorage.getItem('token');

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const baseURL = import.meta.env.VITE_API_URL;

            const res = await fetch(`${baseURL}/trails/${deleteFeatureUuid}`, {
                method: 'DELETE',
                headers,
            });

            const result = await res.json();
            if (result.success) {
                setDeleteComplete(true);
                setVersion(version + 1);
                setActiveFeatureUuid(null);
                setTimeout(() => {
                    setModalIsOpen(false);
                    setTimeout(() => {
                        setDeleteComplete(false);
                    }, 2000);
                }, 2000);
            } else {
                alert('上傳失敗');
            }
        } catch (err) {
            console.error(err);
            alert('錯誤：無法上傳');
        }
    };

    return (
        <div className={styles.Modal_Delete}>
            <h2>{deleteComplete ? '刪除成功' : '確定刪除資料？'}</h2>
            {!deleteComplete && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', width: '100%' }}>
                    <button onClick={() => deleteByUuid()}>確定</button>
                    <button onClick={() => setModalIsOpen(false)}>取消</button>
                </div>
            )}
        </div>
    );
}
