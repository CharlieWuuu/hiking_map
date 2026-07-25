'use client';

import { Map } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { apiClient } from '../../../../lib/apiClient';

export type RecordCompleteFormValues = {
  name: string;
  county: string;
  town: string;
  isPublic: boolean;
  note: string;
  coverImageUrl?: string;
};

type Props = {
  distanceKm: number;
  isSubmitting: boolean;
  onSubmit: (values: RecordCompleteFormValues) => void;
  onCancel: () => void;
};

const inputClassName = 'bg-background text-background-contrary w-full rounded px-1.5 py-0.5 text-sm outline-none';

export default function RecordCompleteForm({ distanceKm, isSubmitting, onSubmit, onCancel }: Props) {
  const t = useTranslations('RecordCompleteForm');
  const [name, setName] = useState('');
  const [county, setCounty] = useState('');
  const [town, setTown] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [note, setNote] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(undefined);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(false);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    setUploadError(false);
    try {
      const url = await apiClient.uploads.uploadImage(file);
      setCoverImageUrl(url);
    } catch {
      setUploadError(true);
    } finally {
      setIsUploadingImage(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), county, town, isPublic, note, coverImageUrl });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-panel text-background-contrary flex w-full flex-col gap-4 rounded-lg p-4">
      <h2 className="text-lg font-bold">{t('title')}</h2>

      <p className="text-background-contrary/60 text-sm">{t('distanceValue', { distance: distanceKm.toFixed(2) })}</p>

      <div className="flex gap-4">
        <label className="flex shrink-0 cursor-pointer flex-col items-start gap-1">
          <span className="text-sm">{t('coverImage')}</span>
          <span className="bg-panel-active hover:bg-panel-active-lighten relative flex h-20 w-20 items-center justify-center overflow-hidden rounded transition-colors">
            {coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverImageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Map className="text-background-contrary/60 h-8 w-8" />
            )}
            {isUploadingImage && <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white">{t('uploading')}</span>}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
          </span>
          {uploadError && <span className="text-xs text-red-500">{t('uploadFailed')}</span>}
        </label>

        <div className="flex flex-1 flex-col gap-4">
          <label className="flex flex-col items-start gap-1">
            <span className="text-sm">{t('name')}</span>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClassName} />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex min-w-24 flex-1 flex-col items-start gap-1">
          <span className="text-sm">{t('county')}</span>
          <input type="text" value={county} onChange={(e) => setCounty(e.target.value)} className={inputClassName} />
        </label>
        <label className="flex min-w-24 flex-1 flex-col items-start gap-1">
          <span className="text-sm">{t('town')}</span>
          <input type="text" value={town} onChange={(e) => setTown(e.target.value)} className={inputClassName} />
        </label>
      </div>

      <label className="flex w-fit flex-col items-start gap-1">
        <span className="text-sm">{t('public')}</span>
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="accent-accent h-6 w-6 cursor-pointer" />
      </label>

      <label className="flex flex-col items-start gap-1">
        <span className="text-sm">{t('note')}</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className={inputClassName} />
      </label>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="bg-panel-active hover:bg-panel-active-lighten rounded-panel px-4 py-2 transition-colors">
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-accent text-background hover:bg-accent-darken rounded-panel px-4 py-2 transition-colors disabled:opacity-50"
        >
          {t('save')}
        </button>
      </div>
    </form>
  );
}
