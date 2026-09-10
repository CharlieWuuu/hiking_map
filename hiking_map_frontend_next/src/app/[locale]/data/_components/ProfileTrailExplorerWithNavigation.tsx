'use client';

import type { MapTrail } from '../../../../components/MapView/TrailsLayer';
import type { EditableTrail } from '../../../../components/TrailEditCard';
import { useRouter } from '../../../../i18n/navigation';
import ProfileTrailExplorer from './ProfileTrailExplorer';

type Trail = EditableTrail & Pick<MapTrail, 'path' | 'trackUrl' | 'bbox'>;

type Props = {
  trails: Trail[];
  totalCount: number;
  initialNextCursor: string | null;
  userId: string;
  fullscreen: 'map' | 'table' | null;
  isEditMode: boolean;
  isOwner: boolean;
};

export default function ProfileTrailExplorerWithNavigation({ trails, totalCount, initialNextCursor, userId, fullscreen, isEditMode, isOwner }: Props) {
  const router = useRouter();

  function handleFullscreenChange(next: 'map' | 'table' | null) {
    router.replace({ pathname: `/data`, query: next ? { fullscreen: next } : undefined });
  }

  function handleToggleEditMode() {
    router.replace({ pathname: `/data`, query: isEditMode ? undefined : { edit: 'true' } });
  }

  return (
    <ProfileTrailExplorer
      trails={trails}
      totalCount={totalCount}
      initialNextCursor={initialNextCursor}
      userId={userId}
      fullscreen={fullscreen}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onFullscreenChange={handleFullscreenChange}
      onToggleEditMode={handleToggleEditMode}
    />
  );
}
