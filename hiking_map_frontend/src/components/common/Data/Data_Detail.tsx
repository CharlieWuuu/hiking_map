// style
import styles from './Data_Detail.module.scss';

// type
import { PatchTrailData, TrailEditorProps } from '../../../types/trails';

// react
import { useEffect, useState } from 'react';

// context
import { useModal } from '../../../context/ModalContext';
import { usePatchData } from '../../../context/PatchDataContext';

// image
import Navbar_Edit from '../../../assets/images/Navbar_Edit.svg';
import Close from '../../../assets/images/Panel_ClosePanel.svg';
import Checked from '../../../assets/images/Data_Checked.svg';

// store

import { DataCardTitle } from './DataCardTitle';

export default function Data_Detail({ trails }: TrailEditorProps) {
  const [isEditing] = useState(false);
  const date = new Date(trails.time);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const time = `${year}年${month}月${day}日`;
  const { patchData, setPatchData } = usePatchData();
  const { setModalIsOpen, setModalType } = useModal();

  const [isUrlEdited, setIsUrlEdited] = useState(false);

  const [urlArray, setUrlArray] = useState<string[]>([]);

  useEffect(() => {
    let url = trails.url;
    if (isUrlEdited) {
      url = patchData?.url ?? [];
    }
    setUrlArray(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, patchData?.url, isUrlEdited]);

  const updateField = <K extends keyof PatchTrailData>(field: K, value: PatchTrailData[K]) => {
    setPatchData({ ...(patchData as PatchTrailData), [field]: value });
  };

  return (
    <div className={`${styles.Data_Detail}`}>
      <div className={`${styles.Detail_Card}`}>
        <DataCardTitle trails={trails} />

        <div className={styles.Card_properties}>
          <div className={styles.Card_district}>
            <span>縣市</span>
            {!isEditing && <p>{trails.county ?? '-'}</p>}
            {isEditing && (
              <input
                type='text'
                defaultValue={trails.county}
                onChange={(e) => {
                  updateField('county', e.target.value);
                }}
              />
            )}
          </div>

          <div className={styles.Card_district}>
            <span>鄉鎮</span>
            {!isEditing && <p>{trails.town ?? '-'}</p>}
            {isEditing && (
              <input
                type='text'
                defaultValue={trails.town}
                onChange={(e) => {
                  updateField('town', e.target.value);
                }}
              />
            )}
          </div>
          <div className={styles.Card_time}>
            <span>日期</span>
            {!isEditing && <p>{time}</p>}
            {isEditing && (
              <input
                type='date'
                defaultValue={new Date(trails.time).toISOString().split('T')[0]}
                onChange={(e) => {
                  updateField('time', e.target.value);
                }}
              />
            )}
          </div>

          <div className={styles.Card_length}>
            <span>距離</span>
            <p>{trails.length} 公里</p>
          </div>

          <div className={styles.Card_check}>
            <span>公開</span>
            {!isEditing && <img src={trails.public ? Checked : Close} alt='' />}
            {isEditing && (
              <input
                type='checkbox'
                defaultChecked={trails.public}
                className={styles.disabled}
                onChange={(e) => {
                  updateField('public', e.target.checked);
                }}
              />
            )}
          </div>

          <div className={styles.Card_check}>
            <span>百岳</span>
            {!isEditing && <img src={trails.hundred_id ? Checked : Close} alt='' />}
            {isEditing && (
              <input
                type='checkbox'
                defaultChecked={trails.hundred_id !== null}
                className={styles.disabled}
                onChange={(e) => {
                  updateField('hundred_id', e.target.checked ? 'true' : null);
                }}
              />
            )}
          </div>

          <div className={styles.Card_check}>
            <span>小百岳</span>
            {!isEditing && <img src={trails.small_hundred_id ? Checked : Close} alt='' />}
            {isEditing && (
              <input
                type='checkbox'
                defaultChecked={trails.small_hundred_id !== null}
                className={styles.disabled}
                onChange={(e) => {
                  updateField('small_hundred_id', e.target.checked ? 'true' : null);
                }}
              />
            )}
          </div>

          <div className={styles.Card_check}>
            <span>百大必訪步道</span>
            {!isEditing && <img src={trails.hundred_trail_id ? Checked : Close} alt='' />}
            {isEditing && (
              <input
                type='checkbox'
                defaultChecked={trails.hundred_trail_id !== null}
                className={styles.disabled}
                onChange={(e) => {
                  updateField('hundred_trail_id', e.target.checked ? 'true' : null);
                }}
              />
            )}
          </div>

          <div className={styles.Card_url}>
            <span>路線連結</span>
            <div>
              {Array.isArray(urlArray) && urlArray.length > 0 ? (
                urlArray.map((element: string, index: number) => (
                  <a
                    key={index} // 用網址作為 key，若為空備援用 index
                    href={element}
                    target='_blank'
                    rel='noopener noreferrer'>
                    連結-{index + 1}
                  </a>
                ))
              ) : (
                <p>-</p>
              )}
              {isEditing && (
                <button
                  onClick={() => {
                    setModalType('editUrl');
                    setModalIsOpen(true);
                    setIsUrlEdited(true);
                    if (patchData === null || patchData?.url === null) {
                      setPatchData({ ...(patchData as PatchTrailData), url: trails?.url });
                    } else {
                      setPatchData({ ...(patchData as PatchTrailData), url: patchData?.url ?? [] });
                    }
                  }}>
                  <img src={Navbar_Edit} alt='編輯' />
                </button>
              )}
            </div>
          </div>

          <div className={styles.Card_note}>
            <span>說明</span>
            {!isEditing && <p>{trails.note ?? '-'}</p>}
            {isEditing && (
              <textarea
                defaultValue={trails?.note}
                onChange={(e) => {
                  updateField('note', e.target.value);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
