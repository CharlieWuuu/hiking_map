'use client';

import { Plus, Save, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import MountainMultiSelect from './MountainMultiSelect';

export type EditableTrail = {
  slug: string;
  name: string;
  county: string;
  town: string;
  date: string;
  distanceKm: number;
  isPublic: boolean;
  isHundred: boolean;
  isSmallHundred: boolean;
  isHundredTrail: boolean;
  urls: string[];
  note?: string;
  mountainIds: number[];
};

type Props = {
  trail: EditableTrail;
  onClose: () => void;
  onSave: (patch: Partial<EditableTrail>) => void | Promise<void>;
  onDelete: () => void;
};

const inputClassName = 'bg-background text-background-contrary w-full rounded px-1.5 py-0.5 text-sm outline-none';
const iconButtonClassName =
  'bg-panel-active text-background-contrary hover:bg-panel-active-lighten flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-150 cursor-pointer';
const saveButtonClassName =
  'bg-accent text-background hover:bg-accent-darken flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-150 cursor-pointer';
const deleteButtonClassName =
  'bg-panel-active text-red-500 hover:bg-red-500 hover:text-background flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50';

// 分類（百岳／小百岳／百大必訪）是互不排斥的多選標籤，用可切換的 tag 呈現比 checkbox 更符合語意
function TagToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`rounded-full px-3 py-1 text-sm transition-colors duration-150 ${
        checked ? 'bg-accent text-background' : 'bg-panel-active text-background-contrary hover:bg-panel-active-lighten'
      }`}
    >
      {label}
    </button>
  );
}

export default function TrailEditCard({ trail, onClose, onSave, onDelete }: Props) {
  const t = useTranslations('TrailEditCard');
  const [patch, setPatch] = useState<Partial<EditableTrail>>({});
  const [urls, setUrls] = useState(trail.urls);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  function updateField<K extends keyof EditableTrail>(field: K, value: EditableTrail[K]) {
    setPatch((prev) => ({ ...prev, [field]: value }));
  }

  function updateUrl(index: number, value: string) {
    const next = urls.map((url, i) => (i === index ? value : url));
    setUrls(next);
    updateField('urls', next);
  }

  function addUrl() {
    setUrls((prev) => [...prev, '']);
  }

  function removeUrl(index: number) {
    const next = urls.filter((_, i) => i !== index);
    setUrls(next);
    updateField('urls', next);
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveError(false);
    try {
      await onSave(patch);
      setPatch({});
    } catch {
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(t('confirmDelete'))) return;
    setIsDeleting(true);
    try {
      onDelete();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="bg-panel text-background-contrary flex w-full shrink-0 flex-col gap-6 rounded-lg p-4">
      <div className="border-accent flex items-end justify-between gap-4 border-b pb-3">
        <div className="flex flex-1 items-end gap-2">
          <input
            type="text"
            defaultValue={trail.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="min-w-0 flex-1 border-b border-current bg-transparent text-2xl leading-8 font-bold outline-none"
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={handleDelete} disabled={isDeleting} title={t('delete')} className={deleteButtonClassName}>
            <Trash2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={handleSave} disabled={isSaving} title={t('save')} className={saveButtonClassName}>
            <Save className="h-4 w-4" />
          </button>
          <button type="button" onClick={onClose} title={t('close')} className={iconButtonClassName}>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {saveError && <p className="text-sm text-red-500">{t('saveFailed')}</p>}

      <div className="flex flex-wrap justify-between gap-4">
        <label className="flex min-w-24 flex-1 flex-col items-start gap-1">
          <span className="text-sm">{t('county')}</span>
          <input type="text" defaultValue={trail.county} onChange={(e) => updateField('county', e.target.value)} className={inputClassName} />
        </label>

        <label className="flex min-w-24 flex-1 flex-col items-start gap-1">
          <span className="text-sm">{t('town')}</span>
          <input type="text" defaultValue={trail.town} onChange={(e) => updateField('town', e.target.value)} className={inputClassName} />
        </label>

        <label className="flex min-w-24 flex-1 flex-col items-start gap-1">
          <span className="text-sm">{t('date')}</span>
          <input type="date" defaultValue={trail.date} onChange={(e) => updateField('date', e.target.value)} className={inputClassName} />
        </label>

        <div className="flex min-w-24 flex-1 flex-col items-start gap-1">
          <span className="text-sm">{t('distance')}</span>
          <p className="min-h-4.5 py-0.5 text-lg font-bold">{t('distanceValue', { distance: trail.distanceKm })}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <label className="flex w-fit flex-col items-start gap-1">
          <span className="text-sm">{t('public')}</span>
          <input
            type="checkbox"
            defaultChecked={trail.isPublic}
            onChange={(e) => updateField('isPublic', e.target.checked)}
            className="accent-accent h-6 w-6 cursor-pointer"
          />
        </label>

        <div className="flex flex-col items-start gap-1">
          <span className="text-sm">{t('categories')}</span>
          <div className="flex flex-wrap gap-2">
            <TagToggle label={t('hundred')} checked={patch.isHundred ?? trail.isHundred} onChange={(checked) => updateField('isHundred', checked)} />
            <TagToggle
              label={t('smallHundred')}
              checked={patch.isSmallHundred ?? trail.isSmallHundred}
              onChange={(checked) => updateField('isSmallHundred', checked)}
            />
            <TagToggle
              label={t('hundredTrail')}
              checked={patch.isHundredTrail ?? trail.isHundredTrail}
              onChange={(checked) => updateField('isHundredTrail', checked)}
            />
          </div>
        </div>
      </div>

      <MountainMultiSelect
        label={t('mountains')}
        searchPlaceholder={t('mountainsSearchPlaceholder')}
        selectedIds={patch.mountainIds ?? trail.mountainIds}
        onChange={(ids) => updateField('mountainIds', ids)}
      />

      <div className="flex w-full flex-col items-start gap-2">
        <span className="text-sm">{t('links')}</span>
        {urls.map((url, index) => (
          <div key={index} className="flex w-full items-center gap-2">
            <input
              type="text"
              value={url}
              placeholder={t('linksPlaceholder')}
              onChange={(e) => updateUrl(index, e.target.value)}
              className={`${inputClassName} min-w-0 flex-1`}
            />
            <button type="button" onClick={() => removeUrl(index)} title={t('removeLink')} className={iconButtonClassName}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button type="button" onClick={addUrl} className="border-accent flex items-center gap-1 border-b border-dashed text-sm">
          <Plus className="h-3 w-3" />
          {t('addLink')}
        </button>
      </div>

      <label className="flex w-full flex-col items-start gap-1">
        <span className="text-sm">{t('note')}</span>
        <textarea defaultValue={trail.note} onChange={(e) => updateField('note', e.target.value)} rows={2} className={inputClassName} />
      </label>
    </div>
  );
}
