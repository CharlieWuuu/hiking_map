import { Download, LayoutGrid, Pencil, Plus, Table, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import ExpandToggleButton from './ExpandToggleButton';

const EXPORT_FORMATS = ['GeoJSON', 'GPX', 'CSV'] as const;

type Props = {
  isTableExpanded: boolean;
  onToggleTableExpanded: () => void;
  view: 'card' | 'table';
  onToggleView: () => void;
  isOwner: boolean;
  isEditMode: boolean;
  onToggleEditMode: () => void;
};

export default function TrailExplorerToolbar({ isTableExpanded, onToggleTableExpanded, view, onToggleView, isOwner, isEditMode, onToggleEditMode }: Props) {
  const t = useTranslations('ProfileDataPage');

  return (
    <div className="flex items-center justify-between">
      <ExpandToggleButton isExpanded={isTableExpanded} onToggle={onToggleTableExpanded} label={isTableExpanded ? t('collapse') : t('expand')} />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleView}
          title={view === 'card' ? t('viewTable') : t('viewCard')}
          className="bg-panel hover:bg-panel-active flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors"
        >
          {view === 'card' ? <Table className="h-3.5 w-3.5" /> : <LayoutGrid className="h-3.5 w-3.5" />}
        </button>

        {isOwner && (
          <button
            type="button"
            onClick={onToggleEditMode}
            title={isEditMode ? t('exitEdit') : t('goToEdit')}
            className="bg-panel hover:bg-panel-active flex h-7 shrink-0 items-center gap-1 rounded-full px-3 text-xs transition-colors"
          >
            {isEditMode ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
            {isEditMode ? t('exitEdit') : t('goToEdit')}
          </button>
        )}

        {isEditMode && (
          <>
            <button type="button" className="bg-panel hover:bg-panel-active flex h-7 shrink-0 items-center gap-1 rounded-full px-3 text-xs transition-colors">
              <Plus className="h-3.5 w-3.5" />
              {t('addTrail')}
            </button>
            <label className="bg-panel hover:bg-panel-active flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 text-xs transition-colors">
              <Download className="h-3.5 w-3.5" />
              <select defaultValue="" className="cursor-pointer bg-transparent outline-none">
                <option value="" disabled>
                  {t('export')}
                </option>
                {EXPORT_FORMATS.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>
    </div>
  );
}
