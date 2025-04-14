import styles from './Panel_Info.module.scss';

export default function Panel_Info() {
    return (
        <div className={styles.Panel_Info}>
            <h2>網站介紹</h2>
            <p>本網站是為了呈現個人的登山紀錄而開發。過去我習慣使用 GIS 軟體來記錄路線，但這些工具在資料整理與分享上並不直覺，因此希望透過這個平台，建立一個更清晰、視覺化、可互動的展示方式。</p>

            <p>網站目前收錄我歷年來的登山路線，包含時間、地點、距離、地圖軌跡與相關補充說明，未來也可能擴充更多圖表或資料應用。雖然是個人使用為主，但也希望能作為一個紀錄生活與探索的介面。</p>

            <p>開發技術上採用 React 作為前端框架，NestJS 搭配 PostgreSQL（Neon）作為後端與資料庫，界面設計則以 Figma 原型規劃為基礎，逐步優化介面與互動流程。</p>
        </div>
    );
}
