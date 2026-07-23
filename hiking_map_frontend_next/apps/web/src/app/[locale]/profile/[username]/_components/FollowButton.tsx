'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { apiClient } from '../../../../../lib/apiClient';

type Props = {
  targetUserId: number;
  initialIsFollowing: boolean;
};

export default function FollowButton({ targetUserId, initialIsFollowing }: Props) {
  const t = useTranslations('ProfilePage');
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleToggle() {
    setIsSubmitting(true);
    try {
      if (isFollowing) {
        await apiClient.follows.unfollow(targetUserId);
      } else {
        await apiClient.follows.follow(targetUserId);
      }
      setIsFollowing((prev) => !prev);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isSubmitting}
      className={`rounded-panel px-4 py-1.5 text-sm font-bold transition-colors disabled:opacity-50 ${
        isFollowing ? 'bg-panel-active hover:bg-panel-active-lighten' : 'bg-accent text-background hover:bg-accent-darken'
      }`}
    >
      {isFollowing ? t('unfollow') : t('follow')}
    </button>
  );
}
