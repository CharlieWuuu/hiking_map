import Hero_Background from '../assets/images/Index_Hero_Background.png';
import Hero_Text from '../assets/images/Index_Hero_Text.svg';
import styles from './Index.module.scss';
import { Link } from 'react-router-dom';

type Owner = {
    name: string;
    name_zh: string;
    id: string;
    uuid: string;
    avatar: string;
    level: string;
    description: string;
    type: string;
};

type Props = {
    ownerList: Owner[];
};

export default function Index({ ownerList }: Props) {
    return (
        <div className={styles.Index}>
            <div className={styles.Index_Content}>
                <div className={styles.HeroBanner}>
                    <img className={styles.HeroBackground} src={Hero_Background} alt="" />
                    <img className={styles.HeroText} src={Hero_Text} alt="" />
                </div>
                <section>
                    <h3>登山路線</h3>
                    <div className={styles.CardContainer}>
                        {ownerList.map((owner, index) => {
                            if (owner.type !== 'layer') return null;
                            return (
                                <Link key={index} to={`/owner/${owner.type}/${owner.name}`} className={`${styles.Card}`}>
                                    <img src={owner.avatar} alt="頭像" />
                                    <div>
                                        <h4>{owner.name_zh}</h4>
                                        <p>{owner.description}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
                <section>
                    <h3>用戶紀錄</h3>
                    <div className={styles.CardContainer}>
                        {ownerList.map((owner, index) => {
                            if (owner.type !== 'user') return null;
                            return (
                                <Link key={index} to={`/owner/${owner.type}/${owner.name}`} className={`${styles.Card} ${styles.Card_small}`}>
                                    <img src={owner.avatar} alt="頭像" />
                                    <div>
                                        <h4>{owner.name}</h4>
                                        <p>{owner.level}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}
