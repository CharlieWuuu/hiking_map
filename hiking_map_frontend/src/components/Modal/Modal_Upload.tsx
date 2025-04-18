import styles from './Modal_Upload.module.scss';
export default function Modal_Upload() {
    const handleUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        console.log('file', file);
        // try {
        //     const res = await fetch('/api/upload', {
        //         method: 'POST',
        //         body: formData,
        //     });

        //     const result = await res.json();
        //     if (result.success) {
        //         alert(`成功上傳 ${result.savedCount} 筆資料`);
        //         // 重新 fetch geojson
        //     } else {
        //         alert('上傳失敗');
        //     }
        // } catch (err) {
        //     console.error(err);
        //     alert('錯誤：無法上傳');
        // }
    };

    return (
        <div className={styles.Modal_Upload}>
            <input type="file" onChange={(e) => handleUpload(e.target.files![0])} />
        </div>
    );
}
