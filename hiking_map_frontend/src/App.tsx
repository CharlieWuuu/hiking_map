import Navbar from './components/Layout/Navbar';
import Index from './pages/Index';
import styles from './App.module.scss';

export default function App() {
    return (
        <div className={styles.App}>
            {/* <Navbar /> */}
            <Index />
        </div>
    );
}
