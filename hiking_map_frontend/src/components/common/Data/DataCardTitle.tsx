// style
import styles from './DataCardTitle.module.scss';

// type
import { PatchTrailData, TrailEditorProps } from '../../../types/trails';

// React
import * as React from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';

// image
import Menu_Map from '../../../assets/images/Menu_Map.svg';
import Navbar_Edit from '../../../assets/images/Navbar_Edit.svg';
import Delete from '../../../assets/images/Data_Delete.svg';
import Upload from '../../../assets/images/Data_Upload.svg';
import Save from '../../../assets/images/Data_Save.svg';

// context
import { useModal } from '../../../context/ModalContext';
import { usePatchData } from '../../../context/PatchDataContext';

// Zustand
import { useTrailUIStore } from '../../../store/useTrailUIStore';

// 上傳修改資料的參數型別
interface PatchPropertiesParams {
  trails: { uuid: string }; // 路線物件，包含 UUID
  patchData: PatchTrailData; // 要修改的資料
  callbackSuccess: (result: { success: boolean }) => void; // 成功回呼函式
}

// 上傳修改資料到後端 API
const patchProperties = async ({ trails, patchData, callbackSuccess }: PatchPropertiesParams) => {
  try {
    const baseURL = import.meta.env.VITE_API_URL;
    const res = await fetch(`${baseURL}/trails/${trails.uuid}/properties`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchData),
    });

    const result = await res.json();
    callbackSuccess(result);
  } catch (err) {
    // TODO: 改用統一的錯誤處理，移除 alert
    console.error(err);
    alert('錯誤：無法上傳');
  }
};

// 資料卡片標題組件
export function DataCardTitle({ trails }: TrailEditorProps) {
  // == 本地狀態 ==
  // 是否編輯模式
  const [isEditing, setIsEditing] = React.useState(false);

  // == Zustand、Context 狀態 ==
  // 上傳成功的回呼函式
  const { setModalIsOpen, setModalType } = useModal(); // Modal 相關狀態管理（來自 Context）
  const setActiveFeatureUuid = useTrailUIStore((state) => state.setActiveFeatureUuid); // 路線 UI 狀態管理（來自 Zustand）
  const { patchData, setPatchData } = usePatchData(); // 修改資料的狀態管理（來自 Context）

  // == 路由相關 ==
  // 從查詢參數取得當前模式（edit/map）
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  // 切換到地圖模式
  const { name, type } = useParams<{ name: string; type: string }>(); // 從 URL 路徑取得路線類型和名稱
  const navigate = useNavigate();
  const switchToMapMode = () => {
    navigate(`/owner/${type}/${name}/data?mode=map`, { replace: true });
  };

  // == 上傳成功的 callback function ==
  const callbackSuccess = (result: { success: boolean }) => {
    if (result.success) {
      setModalType('complete');
      setModalIsOpen(true);
      setActiveFeatureUuid(null);
      setPatchData(null);
    } else {
      alert('上傳失敗');
    }
  };

  return (
    <div className={styles.Card_title}>
      {/* 路線名稱區域 */}
      <div className={styles.Card_name}>
        {!isEditing ? (
          <p>{trails.name}</p>
        ) : (
          <input type='text' defaultValue={trails.name} onChange={(e) => setPatchData({ ...(patchData as PatchTrailData), name: e.target.value })} />
        )}
        <span>#{trails.id}</span>
      </div>

      {/* 操作按鈕區域 */}
      <div className={styles.Card_btn}>
        {mode === 'edit' && !isEditing ? (
          <button onClick={() => setIsEditing(true)}>
            <img src={Navbar_Edit} alt='編輯' />
          </button>
        ) : (
          /* 儲存、更新軌跡、刪除鈕 */
          <>
            <button
              style={patchData ? {} : { opacity: '0.2', pointerEvents: 'none' }}
              onClick={() => {
                if (!patchData) return;
                patchProperties({ trails, patchData, callbackSuccess });
              }}>
              <img src={Save} alt='儲存' />
            </button>

            <button
              onClick={() => {
                setModalIsOpen(true);
                setModalType('file_update');
              }}>
              <img src={Upload} alt='更新軌跡' />
            </button>

            <button
              onClick={() => {
                setActiveFeatureUuid(trails?.uuid);
                setModalIsOpen(true);
                setModalType('delete');
              }}>
              <img src={Delete} alt='刪除' />
            </button>
          </>
        )}
        <button className={styles.Card_btn_map} onClick={() => switchToMapMode()}>
          <img src={Menu_Map} alt='地圖' />
        </button>
      </div>
    </div>
  );
}
