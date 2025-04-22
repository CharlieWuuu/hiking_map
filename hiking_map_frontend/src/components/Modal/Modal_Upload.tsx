import styles from './Modal_Upload.module.scss';
import { useGeojson } from '../../context/GeojsonContext';
import { useState, useRef } from 'react';
import { useModal } from '../../context/ModalContext';
export default function Modal_Upload() {
    const { refreshGeojson } = useGeojson();
    const [file, setFile] = useState<File | null>(null);
    const { setModalIsOpen } = useModal();
    const [uploadComplete, setUploadComplete] = useState(false);
    const handleUpload = async () => {
        if (file === null) {
            alert('請選擇檔案');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('http://localhost:3001/trails', {
                method: 'POST',
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
    return (
        <div className={styles.Modal_Upload}>
            <h2>{uploadComplete ? '上傳完成' : '上傳檔案'}</h2>
            {!uploadComplete && <input ref={fileInputRef} type="file" id="fileInput" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files?.[0] || null)} />}
            {!uploadComplete && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" onClick={triggerFileInput} style={{ whiteSpace: 'nowrap' }}>
                        選擇檔案
                    </button>
                    <p style={{ whiteSpace: 'nowrap' }}>{file?.name || '請選擇檔案（.gpx / .geojson）'}</p>
                </div>
            )}
            {!uploadComplete && <button onClick={handleUpload}>上傳</button>}
        </div>
    );
}
