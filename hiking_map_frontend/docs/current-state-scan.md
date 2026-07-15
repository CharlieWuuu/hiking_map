# HikingMap 前端現況掃描（盤點，非設計建議）

掃描範圍：`hiking_map_frontend/src`。目的是列出「現在是什麼」，不做架構建議。

---

## 1. 頁面清單 + 主要職責

路由定義於 [`App.tsx`](../src/App.tsx)：

| Route | 頁面元件 | 主要職責 |
|---|---|---|
| `/` | `pages/Index.tsx` | 首頁。用 props 收到的 `ownerList` 分成「用戶」「圖層」兩區塊卡片列表，純展示 + 連結。 |
| `/search` | `pages/Search_Owner.tsx` | 搜尋頁。整頁只包一個 `SearchUser` 元件。 |
| `/owner/:type/:name` | `pages/Owner_View/Owner_View.tsx` | 使用者/圖層總覽頁。顯示頭像、成就環狀圖（百岳/小百岳/百大必訪步道）、每月里程與縣市統計圖表、歷次軌跡卡片列表（無限滾動載入），並提供「地圖」「表格」入口連結到 `Owner_Data`。 |
| `/owner/:type/:name/trail/:uuid` | `pages/Owner_Trail.tsx` | 單一路線詳情頁。顯示路線屬性卡 + 一個獨立、唯讀的 Leaflet 地圖（僅顯示該條路線，不與 Data 表格互動）。 |
| `/owner/:type/:name/data` | `pages/Owner_Data.tsx` | 資料／地圖／編輯整合頁，用 `?mode=map\|data\|edit` 切換顯示狀態，實際渲染 `Data` + `Map` 兩大元件（兩者一起掛載，靠 CSS/mode 決定誰放大）。若 `mode=edit` 但非本人登入會導向 `/login`。用 `TableProvider` 局部包裹。 |
| `/intro` | `pages/Intro.tsx` | 純靜態網站介紹頁，無資料互動、無 context/store 依賴。 |
| `/login` | `pages/Login.tsx` | 登入／登出頁。呼叫 `/auth/login`，登入寫入 `AuthContext`；登入或登出都會清空 `useTrailDataStore` 的 `trails`。 |

**App Shell（每個路由都會掛載，不屬於特定頁面）**：`Navbar`、`Menu`、`Footer`（`isFullScreen` 時隱藏）、`BottomBar`、`Modal`（含 4 個子彈窗）、`ScrollToTop`、`LandingAnimation`。

---

## 2. Context / State 清單

### 2.1 React Context（`src/context/`，於 `main.tsx` 全域包裹）

Provider 巢狀順序：`AuthProvider > PanelProvider > ModalProvider > MapProvider > PatchDataProvider > BrowserRouter > FullScreenProvider > App`

| Context | 管理的資料 | 主要使用者 |
|---|---|---|
| `AuthContext` | 目前登入使用者 `{id, username, uuid}`、`isLoggedIn`；由 localStorage 的 JWT 解析/寫入 | `Navbar`、`Menu`、`Login`、`Owner_Data`、`Data_All` |
| `PanelContext` | `uiPanels{data,auth,info,edit}`、`ZoomIn` | **無任何元件呼叫 `usePanel()`**（已確認 grep 全庫無使用），疑似遺留／未串接的狀態 |
| `ModalContext` | `modalIsOpen`、`modalType`（字串，決定顯示哪個子 Modal） | `Modal`、`Data_All`、`Data_Detail`、`DataCardTitle`、`Modal_File`、`Modal_Delete`、`Modal_EditUrl` |
| `MapContext` | `nowBaseMap`（目前底圖 key）、`baseMapSetting`（5 種底圖各自的透明度/飽和度/圖片/URL） | `Map.tsx`、`Map_Layer.tsx`（僅 `Owner_Data` 頁的地圖區） |
| `PatchDataContext` | `patchData`：編輯中、尚未送出的單筆路線屬性草稿（name/county/town/time/url/note/public/hundred_id...） | `Data_All`、`Data_Detail`、`DataCardTitle`、`Modal_EditUrl`（僅 `Owner_Data` 編輯模式） |
| `FullScreenContext` | `isFullScreen`：依目前路徑（含 `/data`）自動判斷 | `Navbar`、`BottomBar`（切換樣式）、`App.tsx`（決定是否顯示 `Footer`） |
| `TableContext` | `currentPage`、`currentPageData`、`totalPages` 等表格分頁狀態；資料源自 `useTrailDataStore`，並會依 `activeFeatureUuid` 自動跳頁 | 僅在 `Owner_Data.tsx` 局部包裹（非全域），被 `Data_All`、`Map` 使用 |
| ~~`PolylineContext`~~ | — | **整檔被註解掉**（含 `main.tsx` 的 Provider），是死碼，可直接刪除 |

### 2.2 Zustand Store（`src/store/`，全域單例，無需 Provider）

| Store | 管理的資料 | 備註 |
|---|---|---|
| `useTrailMetaStore` | `owner_uuid`、`type`、`trail_uuid`、`share`：目前正在查看哪個 owner/type 的查詢條件 | `version`/`setVersion` 欄位已被註解掉未使用 |
| `useTrailDataStore` | `trails`（GeoJSON `FeatureCollection`）、`loading`、`error`，並內建 `fetchTrails()`（依 `useTrailMetaStore` 條件打 API） | 核心路線資料來源，被 `Owner_View`/`Owner_Data`/`Owner_Trail`/`Map`/`Data_All`/`SearchData`/`Login`/`Modal_File`/`Modal_Delete` 等大量讀取或觸發重抓 |
| `useTrailUIStore` | `hoverFeatureUuid`、`activeFeatureUuid`、`activeFeature`：使用者目前 hover／選取的路線 | 是 `Map` 與 `Data` 表格互相連動高亮的橋樑，被 `Map`、`Data_All`、`DataCardTitle`、`SearchData`、`Modal_File`、`Modal_Delete` 使用 |

> 註：目前資料層是「Context（編輯草稿/UI開關）+ Zustand（路線資料本體/跨頁 UI 狀態）」並存，沒有統一原則。

---

## 3. 元件依賴關係（跨頁共用元件）

### 3.1 全站共用（App Shell，掛在 `App.tsx`，非路由內）
`Navbar`（內含 `SearchUser`）、`Menu`、`Footer`、`BottomBar`、`Modal`（+ `Modal_File`/`Modal_Delete`/`Modal_EditUrl`/`Modal_Complete`）、`ScrollToTop`、`LandingAnimation`

### 3.2 跨頁共用元件

| 元件 | 被使用的位置 |
|---|---|
| `GoBack` | `Data.tsx`（→ `Owner_Data` 頁）、`Map.tsx`（→ `Owner_Data` 頁）、`Owner_Trail.tsx`（直接使用）— 共 3 處 |
| `SearchUser` | `Navbar`（全站列）、`Search_Owner` 頁 — 共 2 處 |
| `useOwnerDetail`（hook） | `Owner_Data`、`Owner_Trail`、`Owner_View`、`Data_All`、`GoBack` — 共 5 處，是取得「目前 owner 資料」的共同入口 |
| `useOwnerList`（hook） | 只在 `App.tsx` 呼叫一次，結果 `ownerList` 透過 props 往下傳給 `Index`、`Search_Owner`、`Navbar`、`SearchUser` |

### 3.3 單頁內部元件樹（不跨頁共用）

- **`Owner_Data` 頁內部**：`Data` → `Data_All` → `Data_Detail` → `DataCardTitle`；`Map` → `Map_Detail` / `Map_Layer` / `Map_ZoomIn`（+ 內部效果元件 `_MapClickHandler`/`_PanToEffect`/`_ResizeEffect`/`_TileEffect`）。這兩棵樹都只在 `Owner_Data.tsx` 被組裝。
- **`Owner_View` 頁內部**：`Card_Detail`、`Hundred`（圖表）、`CountyOrder`（圖表）、`TrailsMonthData`（圖表）— 皆只在此頁使用。

### 3.4 掃描中發現的重複/死碼（僅記錄，不處理）

- `Owner_Trail.tsx` 內自行寫了一份簡化版 `MapContainer`（含本地 `TileEffect`/`ResizeEffect` 函式），並未重用 `components/common/Map/` 底下已存在的 `_TileEffect.ts`/`_ResizeEffect.ts` 等共用效果元件，邏輯有重複。
- `pages/Owner_View/Owner_View_Achievement.tsx` 整檔被註解，內容是 `Owner_View.tsx` 中「成就」區塊的（舊版）抽出版本，目前未被任何檔案 import，屬死碼。
- `context/PolylineContext.tsx` 整檔被註解、`main.tsx` 對應 Provider 也註解，屬死碼。
- `context/PanelContext.tsx` 有 Provider 包裹並定義 `usePanel()`，但專案中無任何元件呼叫，狀態未被消費。
