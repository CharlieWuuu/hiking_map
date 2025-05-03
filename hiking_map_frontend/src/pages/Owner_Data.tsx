import Map from '../components/Map/Map';
import styles from './Owner_Data.module.scss';
import Data from '../components/Data/Data';

export default function Owner_Data() {
    return (
        <div className={`${styles.Owner_Data}`}>
            <Data />
            <Map />
        </div>
    );
}
