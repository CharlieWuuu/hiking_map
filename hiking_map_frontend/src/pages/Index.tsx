import Hero_Background from '../assets/images/Index_Hero_Background.png';
import Hero_Text from '../assets/images/Index_Hero_Text.svg';
import styles from './Index.module.scss';
import Layer_Hundred from '../assets/images/Index_Layer_Hundred.png';
import Layer_SmallHundred from '../assets/images/Index_Layer_SmallHundred.png';
import Layer_HundredTrails from '../assets/images/Index_Layer_HundredTrails.png';
import Avatar_Charlie from '../assets/images/Index_Avatar_Charlie.png';
import Avatar_Dora from '../assets/images/Index_Avatar_Dora.png';
import Avatar_Lawrence from '../assets/images/Index_Avatar_Lawrence.png';
import { Link } from 'react-router-dom';

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
                            <img src={Layer_Hundred} alt="" />
                            <div>
                                <h4>百岳</h4>
                                <p>征服台灣最壯麗的高峰，感受海拔三千公尺以上的震撼美景。（製作中）</p>
                            </div>
                        </div>
                        <div className={styles.Card}>
                            <img src={Layer_SmallHundred} alt="" />
                            <div>
                                <h4>小百岳</h4>
                                <p>親近自然的絕佳選擇，適合入門者與全家大小共同踏青。（製作中）</p>
                            </div>
                        </div>
                        <div className={styles.Card}>
                            <img src={Layer_HundredTrails} alt="" />
                            <div>
                                <h4>百大必訪步道</h4>
                                <p>由民眾的各縣市經典路線，結合臺灣各地絕景，走過就不會忘。（製作中）</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section>
                    <h3>用戶紀錄</h3>
                    <div className={styles.CardContainer}>
                        <Link to="/user/charlie" className={`${styles.Card} ${styles.Card_small}`}>
                            <img src={Avatar_Charlie} alt="" />
                            <div>
                                <h4>Charlie</h4>
                                <p>資深用戶</p>
                            </div>
                        </Link>
                        <div className={`${styles.Card} ${styles.Card_small}`}>
                            <img src={Avatar_Dora} alt="" />
                            <div>
                                <h4>Dora</h4>
                                <p>登山新手（製作中）</p>
                            </div>
                        </div>
                        <div className={`${styles.Card} ${styles.Card_small}`}>
                            <img src={Avatar_Lawrence} alt="" />
                            <div>
                                <h4>Lawrence</h4>
                                <p>業餘玩家（製作中）</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
