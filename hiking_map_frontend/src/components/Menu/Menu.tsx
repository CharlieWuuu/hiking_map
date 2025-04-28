import styles from './Menu.module.scss';

type Props = {
    menuIsOpen: boolean;
    setMenuIsOpen: (isOpen: boolean) => void;
};

export default function Menu({ menuIsOpen, setMenuIsOpen }: Props) {
    return (
        <div className={`${styles.Menu} ${menuIsOpen ? styles.active : ''}`}>
            <button onClick={() => setMenuIsOpen(false)}>X</button>
            <h2>帳號</h2>
            <h2>網站介紹</h2>
        </div>
    );
}
