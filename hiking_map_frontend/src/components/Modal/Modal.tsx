import styles from './Modal.module.scss';
import Modal_Upload from './Modal_Upload';
import Modal_Delete from './Modal_Delete';
import { useModal } from '../../context/ModalContext';

export default function Modal() {
    const { modalIsOpen, setModalIsOpen, modalType } = useModal();

    return (
        <div className={`${styles.Modal_Backdrop} ${modalIsOpen ? styles.open : ''}`} onClick={() => setModalIsOpen(false)}>
            <div className={styles.Modal_Content} onClick={(e) => e.stopPropagation()}>
                {modalType === 'upload' && <Modal_Upload />}
                {modalType === 'delete' && <Modal_Delete />}
            </div>
        </div>
    );
}
