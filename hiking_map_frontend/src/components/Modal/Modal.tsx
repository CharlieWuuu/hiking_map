import styles from './Modal.module.scss';
import Modal_File from './Modal_File';
import Modal_Delete from './Modal_Delete';
import { useModal } from '../../context/ModalContext';
import Modal_Complete from './Modal_Complete';
import Modal_EditUrl from './Modal_EditUrl';

export default function Modal() {
    const { modalIsOpen, setModalIsOpen, modalType } = useModal();

    return (
        <div className={`${styles.Modal_Backdrop} ${modalIsOpen ? styles.open : ''}`} onClick={() => setModalIsOpen(false)}>
            <div className={styles.Modal_Content} onClick={(e) => e.stopPropagation()}>
                {modalType === 'file_upload' && <Modal_File type={modalType} />}
                {modalType === 'file_update' && <Modal_File type={modalType} />}
                {modalType === 'delete' && <Modal_Delete />}
                {modalType === 'complete' && <Modal_Complete />}
                {modalType === 'editUrl' && <Modal_EditUrl />}
            </div>
        </div>
    );
}
