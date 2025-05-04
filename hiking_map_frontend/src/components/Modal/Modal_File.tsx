import styles from './Modal_File.module.scss';
import { useState, useRef, useEffect } from 'react';
import { useModal } from '../../context/ModalContext';

import { useAuth } from '../../context/AuthContext';
import { Feature } from 'geojson';
import { useParams } from 'react-router-dom';
import { useOwnerDetail } from '../../hooks/useOwnerDetail';
import { useTrails } from '../../hooks/useTrails';

type Props = {
    properties: Feature['properties'] | null;
};

export default function Modal_File({ properties }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const { setModalIsOpen } = useModal();
    const [uploadComplete, setUploadComplete] = useState(false);
    const editFeature = properties;
    const { name, type } = useParams<{ name: string; type: string; mode: string }>();
    const { owner } = useOwnerDetail({ name: name!, type: type! });
    const { fetchTrails } = useTrails({ uuid: owner?.uuid ?? '', type: type! });
    const { user } = useAuth();

    const handleUpload = async () => {
        if (file === null) {
            alert('請選擇檔案');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('owner_uuid', user?.uuid || '');
        formData.append('uuid', editFeature?.uuid || '');

        const baseURL = import.meta.env.VITE_API_URL;
        const url = `${baseURL}/trails`;

        try {
            const res = await fetch(url, {
                method: type === 'file_upload' ? 'POST' : 'PUT',
                body: formData,
            });

            const result = await res.json();
            if (result.success) {
                setUploadComplete(true);
                fetchTrails();
                setTimeout(() => {
                    setModalIsOpen(false);
                    setTimeout(() => {
                        setUploadComplete(false);
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
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // 清空 input.value 讓相同檔案也會觸發
            fileInputRef.current.click();
        }
    };
    const [fileName, setFileName] = useState('請選擇檔案（.gpx / .geojson）');
    useEffect(() => {
        if (type === 'file_update') {
            setFileName(editFeature?.filename);
        }
    }, [type, editFeature]);
    return (
        <div className={styles.Modal_File}>
            <h2>
                {type === 'file_upload' && '上傳'}
                {type === 'file_update' && '更新'}
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
