import styles from './Modal_File.module.scss';
import { useState, useRef, useEffect } from 'react';
import { useModal } from '../../context/ModalContext';

import { useAuth } from '../../context/AuthContext';
import { usePolyline } from '../../context/PolylineContext';

export default function Modal_File() {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const { modalType, setModalIsOpen } = useModal();
    const [uploadComplete, setUploadComplete] = useState(false);
    const { activeFeature } = usePolyline();
    const { version, setVersion } = usePolyline();

    const handleUpload = async () => {
        if (file === null) {
            alert('請選擇檔案');
            return;
        }

        const owner_uuid = user?.uuid || '';
        const uuid = activeFeature?.properties?.uuid || '';
        console.log(owner_uuid, uuid);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('owner_uuid', owner_uuid);
        formData.append('uuid', uuid);

        try {
            console.log(uuid);
            const url = `${import.meta.env.VITE_API_URL}/trails${uuid !== '' ? `/${uuid}` : ''}`;
            const method = modalType === 'file_upload' ? 'POST' : 'PUT';
            const token = localStorage.getItem('token');

            const requestOptions = { method: method, Authorization: `Bearer ${token}`, body: formData };
            const res = await fetch(url, requestOptions);
            const result = await res.json();

            if (result.success) {
                setUploadComplete(true);
                setVersion(version + 1);
                setTimeout(() => {
                    setModalIsOpen(false);
                    setTimeout(() => setUploadComplete(false), 2000);
                }, 2000);
            } else {
                alert('上傳失敗');
            }
        } catch (err) {
            console.error(err);
            alert('錯誤：無法上傳');
        }
    };
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // 清空 input.value 讓相同檔案也會觸發
            fileInputRef.current.click();
        }
    };

    const [fileName, setFileName] = useState('請選擇檔案（.gpx / .geojson）');
    useEffect(() => {
        if (modalType === 'file_update') setFileName(activeFeature?.properties?.filename);
    }, [activeFeature]);

    return (
        <div className={styles.Modal_File}>
            <h2>
                {modalType === 'file_upload' && '上傳'}
                {modalType === 'file_update' && '更新'}
                {uploadComplete ? '完成' : '檔案'}
            </h2>
            {!uploadComplete && (
                <input
                    ref={fileInputRef}
                    type="file"
                    id="fileInput"
                    accept=".geojson,.gpx"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        setFile(e.target.files?.[0] || null);
                        setFileName(e.target.files?.[0]?.name || '請選擇檔案（.gpx / .geojson）');
                    }}
                />
            )}
            {!uploadComplete && (
                <div className={styles.Modal_File_input}>
                    <button type="button" onClick={triggerFileInput}>
                        選擇檔案
                    </button>
                    <p>{fileName}</p>
                </div>
            )}
            {!uploadComplete && <button onClick={handleUpload}>上傳</button>}
        </div>
    );
}
