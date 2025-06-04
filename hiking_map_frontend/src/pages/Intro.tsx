import styles from './Intro.module.scss';
import GIS from '../assets/images/Intro_GIS.png';
import Figma from '../assets/images/Intro_Figma.png';
export default function Intro() {
    return (
        <div className={styles.Intro}>
            <h2>網站介紹</h2>

            <section>
                <h3>網站目的</h3>
                <p>
                    本網站用於<strong>視覺化呈現登山記錄</strong>，可作為個人成就的紀錄工具，也能作為與他人交流的平台。具體功能如下：
                </p>
                <ul>
                    <li>登山路線的新增、瀏覽、編輯與刪除（需登入）</li>
                    <li>使用者登入系統，保障資料管理權限</li>
                    <li>成就統計頁面，展示個人活動累積與總覽</li>
                    <li>搜尋其他使用者資料</li>
                    <li>支援手機瀏覽與 PWA 安裝使用</li>
                </ul>
                <p>最初設計時參考 Spotify 的風格，希望使用者感覺一切都在同一個頁面中完成。後來為了讓功能與導覽更清楚，改為多頁式結構，並加入模擬多用戶使用的流程設計。</p>{' '}
            </section>

            <section>
                <h3>開發技術</h3>
                <p>本專案使用以下技術實作：</p>
                <ul>
                    <li>
                        <strong>前端框架</strong>：React
                    </li>
                    <li>
                        <strong>後端與資料庫</strong>：NestJS + PostgreSQL（Neon 雲端託管）
                    </li>
                    <li>
                        <strong>介面設計</strong>：Figma
                    </li>
                    <li>
                        <strong>視覺設計</strong>：Icon、Logo 與 Hero Banner 皆為自繪設計
                    </li>
                </ul>

                <img src={Figma} alt="Figma" />
                <p>Logo 發想自登山時常說的激勵語「再一個彎就到山頂了」，象徵離目標不遠、持續前行的精神。整體配色與操作流程靈感來自 Spotify、YouTube 與 Hevy 等應用服務。</p>
            </section>

            <section>
                <h3>解決的問題</h3>
                <p>我本身有記錄登山路線的習慣，但現有工具在「資料產製、彙整、展示」上都有些不便：</p>
                <p>常見的路線記錄方式如下：</p>
                <ol>
                    <li>
                        使用 <a href="https://classic-maps.openrouteservice.org/">Openrouteservice Maps</a> 畫線並匯出 GPX
                    </li>
                    <li>實地登山時以 GPS 紀錄軌跡後匯出 GPX</li>
                    <li>使用 QGIS、ArcGIS 等 GIS 軟體自行繪製路線</li>
                </ol>
                <img src={GIS} alt="GIS 操作示意圖" />
                <p>然而展示這些資料時，我常遇到幾個問題：</p>
                <ul>
                    <li>QGIS 匯出靜態圖片不易互動，無法讓他人自行縮放與查詢</li>
                    <li>Google Maps 雖可用於展示，但圖層數量有限，需合併所有路線為一檔，更新時也需整體覆寫</li>
                    <li>缺乏彈性與擴充性，難以進一步做圖表分析或多使用者共享</li>
                </ul>
                <p>因此，我將此需求延伸發展為一個網站應用，並模擬成開放平台架構，支援多用戶資料上傳、互動查詢、成就視覺化等功能。</p>
            </section>
        </div>
    );
}
