'use client';

import { Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { apiClient } from '../../../../../lib/apiClient';

type Props = {
  avatar: string;
  description: string;
};

const inputClassName = 'bg-background text-background-contrary w-full rounded px-1.5 py-0.5 text-sm outline-none';

export default function EditProfileButton({ avatar, description }: Props) {
  const t = useTranslations('EditProfileForm');
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarValue, setAvatarValue] = useState(avatar);
  const [descriptionValue, setDescriptionValue] = useState(description);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.profile.updateMe({ avatar: avatarValue, description: descriptionValue });
      setIsOpen(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title={t('edit')}
        className="bg-panel-active hover:bg-panel-active-lighten text-background-contrary flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors"
      >
        <Pencil className="h-4 w-4" />
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-panel text-background-contrary flex w-full flex-col gap-4 rounded-lg p-4">
      <h2 className="text-lg font-bold">{t('title')}</h2>

      <label className="flex flex-col items-start gap-1">
        <span className="text-sm">{t('avatar')}</span>
        <input type="text" value={avatarValue} onChange={(e) => setAvatarValue(e.target.value)} className={inputClassName} />
      </label>

      <label className="flex flex-col items-start gap-1">
        <span className="text-sm">{t('description')}</span>
        <textarea value={descriptionValue} onChange={(e) => setDescriptionValue(e.target.value)} rows={2} className={inputClassName} />
      </label>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="bg-panel-active hover:bg-panel-active-lighten rounded-panel px-4 py-2 transition-colors"
        >
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
