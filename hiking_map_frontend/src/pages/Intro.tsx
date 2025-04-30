import styles from './Intro.module.scss';
import GIS from '../assets/images/Intro_GIS.png';
import Figma from '../assets/images/Intro_Figma.png';
export default function Intro() {
    return (
        <div className={styles.Intro}>
            <h2>網站介紹</h2>

            <h3>網站目的</h3>
            <p>《原子習慣》提到，具體、量化的紀錄方式，可助於建立習慣。</p>
            <p>如果爬山也可以視覺化地把路線記錄下來，那會多有成就感？本網站便是以此想法發想而成。</p>
            <br />

            <h3>背景</h3>
            <p>開發技術上採用 React 作為前端框架，NestJS 搭配 PostgreSQL（Neon）作為後端與資料庫，界面設計則以 Figma 規劃。Icon、Logo、HeroBanner 皆是自行繪製</p>
            <img src={Figma} alt="Figma" />
            <p>Logo 發想自登山者常說的「再一個彎就到山頂了」的激勵話語，雖然我們常知道還不止一個彎，但以此激勵自己已經離目標不遠。配色與使用流程發想自 Spotify、Youtube、Hevy 等網站。</p>
            <br />

            <h3>如何解決過去問題？</h3>
            <p>本人有記錄登山路線的習慣，然而路徑資料的產製、彙整到展示並不太方便。</p>
            <p>
                我常用的路徑繪方式有以下幾種：(1) 使用 <a href="https://classic-maps.openrouteservice.org/">Openrouteservice Maps</a> 此網站的繪圖功能輸出 gpx、(2) 登山時沿途開啟 GPS，結束後輸出 gpx、(3) 自行在 GIS 軟體手繪路線。
            </p>
            <img src={GIS} alt="GIS 操作示意圖" />
            <p>如果要展示，直接截圖的效果通常不太理想。雖然可以用 Google Maps 展示，但有圖層數量的限制，如果要把大量的路線都展示出來，得將多筆路線整合成一個檔案，避免圖層數不夠。但如果要更新圖層，就不能只上傳一筆資料，要把原本的資料更新後重新上傳，並不太方便。</p>
            <p>此外，如果想要展示資料、圖表分析，在 Google Maps 上也無法做到。因此把此概念發想成一個網站，並模擬成不同用戶都可以上傳自己資料的平台，將來也保留各種擴充可能。</p>
        </div>
    );
}
