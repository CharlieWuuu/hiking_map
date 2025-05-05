import styles from './Modal_EditUrl.module.scss';
import { usePatchData } from '../../context/PatchDataContext';
import { useModal } from '../../context/ModalContext';

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

export default function Modal_EditUrl() {
    const { patchData, setPatchData } = usePatchData();
    const { setModalIsOpen } = useModal();
    const urls = patchData?.url || [''];

    return (
        <div className={styles.Modal_EditUrl}>
            <h2>編輯網址</h2>
            <div>
                {urls.map((element: string, index: number) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <p>連結({index + 1})</p>
                        <input
                            type="text"
                            value={element}
                            placeholder="請輸入網址"
                            onChange={(e) => {
                                const newUrls = [...urls];
                                newUrls[index] = e.target.value;
                                setPatchData({ ...(patchData as patchData), url: newUrls });
                            }}
                            onBlur={(e) => {
                                if (e.target.value === '' && index === urls.length - 1) {
                                    const newUrls = [...urls];
                                    newUrls.splice(index, 1);
                                    setPatchData({ ...(patchData as patchData), url: newUrls });
                                }
                            }}
                        />
                    </div>
                ))}

                {/* 若沒有任何網址欄位，給一個初始欄位 */}
                {/* {urls.length === 0 && (
                    <div>
                        <p>連結(1)</p>
                        <input
                            type="text"
                            placeholder="請輸入網址"
                            onChange={(e) => {
                                setPatchData({ ...(patchData as patchData), url: [e.target.value] });
                            }}
                        />
                    </div>
                )} */}

                <button
                    onClick={() => {
                        // 不要新增空欄位重複
                        if (urls.includes('')) return;
                        setPatchData({ ...(patchData as patchData), url: [...urls, ''] });
                    }}>
                    新增網址
                </button>
            </div>

            <button onClick={() => setModalIsOpen(false)}>確定</button>
        </div>
    );
}
