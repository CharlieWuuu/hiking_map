import styles from './Modal.module.scss';
import Modal_Upload from './Modal_Upload';
import { useModal } from '../../context/ModalContext';

export default function Modal() {
    const { setUiModal } = useModal();

    return (
        <div className={styles.Modal_Backdrop} onClick={() => setUiModal((prev) => ({ ...prev, upload: false }))}>
            <div className={styles.Modal_Content} onClick={(e) => e.stopPropagation()}>
                <button className={styles.Modal_CloseBtn} onClick={() => setUiModal((prev) => ({ ...prev, upload: false }))}>
                    ✕
                </button>
                <Modal_Upload />
            </div>
        </div>
    );
}
