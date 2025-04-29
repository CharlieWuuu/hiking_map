import Hero_Background from '../assets/images/Index_Hero_Background.png';
import Hero_Text from '../assets/images/Index_Hero_Text.svg';
import styles from './Index.module.scss';

export default function Index() {
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
                        <div className={styles.Card}>
                            <h4>登山路線</h4>
                            <p>這裡會顯示所有的登山路線</p>
                        </div>
                        <div className={styles.Card}>
                            <h4>登山路線</h4>
                            <p>這裡會顯示所有的登山路線</p>
                        </div>
                    </div>
                </section>
                <section>
                    <h3>用戶紀錄</h3>
                    <div className={styles.CardContainer}>
                        <div className={styles.Card}>
                            <h4>Charlie</h4>
                            <p>這裡會顯示所有的登山路線</p>
                        </div>
                        <div className={styles.Card}>
                            <h4>Dora</h4>
                            <p>這裡會顯示所有的登山路線</p>
                        </div>
                        <div className={styles.Card}>
                            <h4>Lawrence</h4>
                            <p>這裡會顯示所有的登山路線</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
