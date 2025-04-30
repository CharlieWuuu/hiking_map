import styles from './Intro.module.scss';
export default function Intro() {
    return (
        <div className={styles.Intro}>
            <h2>網站介紹</h2>
            <p>本網站是用以呈現個人的登山紀錄，並作為網頁技術練習。過去習慣用 QGIS 記錄路線，但在資料整理與分享上並不方便，因此藉由網頁技術建立一個更視覺化、可互動的地圖平台。</p>

            <p>網站目前節錄本人歷年來的登山路線，包含時間、距離、地圖軌跡與相關補充說明。</p>

            <p>開發技術上採用 React 作為前端框架，NestJS 搭配 PostgreSQL（Neon）作為後端與資料庫，界面設計則以 Figma 規劃。Logo 發想自登山者常說的「再一個彎就到山頂了（但其實還有一段路）」的激勵話語；配色與使用流程發想自 Spotify，期許做出直觀簡潔的單頁應用程式。</p>
        </div>
    );
}
