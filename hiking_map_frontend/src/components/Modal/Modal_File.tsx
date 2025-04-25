import styles from './Modal_File.module.scss';
import { useGeojson } from '../../context/GeojsonContext';
import { useState, useRef, useEffect } from 'react';
import { useModal } from '../../context/ModalContext';
import { usePolyline } from '../../context/PolylineContext';

type Props = {
    type: string;
};

export default function Modal_File({ type }: Props) {
    const { geojson, refreshGeojson } = useGeojson();
    const [file, setFile] = useState<File | null>(null);
    const { setModalIsOpen } = useModal();
    const [uploadComplete, setUploadComplete] = useState(false);
    const { editFeatureUuid } = usePolyline();
    const editFeature = geojson?.features.find((f) => f.properties?.uuid === editFeatureUuid)?.properties;

    const handleUpload = async () => {
        if (file === null) {
            alert('請選擇檔案');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);

        const baseURL = import.meta.env.VITE_API_URL;
        const url = type === 'file_upload' ? `${baseURL}/trails` : `${baseURL}/trails/${editFeature?.uuid}`;

        try {
            const res = await fetch(url, {
                method: type === 'file_upload' ? 'POST' : 'PUT',
                body: formData,
            });

            const result = await res.json();
            if (result.success) {
                setUploadComplete(true);
                refreshGeojson();
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
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        setFile(e.target.files?.[0] || null);
                        setFileName(e.target.files?.[0]?.name || '請選擇檔案（.gpx / .geojson）');
                    }}
                />
            )}
            {!uploadComplete && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" onClick={triggerFileInput} style={{ whiteSpace: 'nowrap' }}>
                        選擇檔案
                    </button>
                    <p style={{ whiteSpace: 'nowrap' }}>{fileName}</p>
                </div>
            )}
            {!uploadComplete && <button onClick={handleUpload}>上傳</button>}
        </div>
    );
}
