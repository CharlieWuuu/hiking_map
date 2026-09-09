'use client';

import type { MapTrail } from '../../../../../../components/MapView/TrailsLayer';
import type { EditableTrail } from '../../../../../../components/TrailEditCard';
import { useRouter } from '../../../../../../i18n/navigation';
import ProfileTrailExplorer from './ProfileTrailExplorer';

type Trail = EditableTrail & Pick<MapTrail, 'path' | 'trackUrl' | 'bbox'>;

type Props = {
  username: string;
  trails: Trail[];
  fullscreen: 'map' | 'table' | null;
  isEditMode: boolean;
  isOwner: boolean;
};

export default function ProfileTrailExplorerWithNavigation({ username, trails, fullscreen, isEditMode, isOwner }: Props) {
  const router = useRouter();

  function handleFullscreenChange(next: 'map' | 'table' | null) {
    router.replace({ pathname: `/profile/${username}/data`, query: next ? { fullscreen: next } : undefined });
  }

  function handleToggleEditMode() {
    router.replace({ pathname: `/profile/${username}/data`, query: isEditMode ? undefined : { edit: 'true' } });
  }

  return (
    <ProfileTrailExplorer
      trails={trails}
      fullscreen={fullscreen}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onFullscreenChange={handleFullscreenChange}
      onToggleEditMode={handleToggleEditMode}
    />
  );
}
