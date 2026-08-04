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
          className="text-background-contrary/60 hover:text-background-contrary flex items-center gap-1 text-xs"
        >
          {view === 'card' ? <Table className="h-3 w-3" /> : <LayoutGrid className="h-3 w-3" />}
        </button>

        {isOwner && (
          <button
            type="button"
            onClick={onToggleEditMode}
            title={isEditMode ? t('exitEdit') : t('goToEdit')}
            className="bg-panel hover:bg-panel-active rounded-panel flex items-center gap-1 px-2 py-1 text-xs transition-colors"
          >
            {isEditMode ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
            {isEditMode ? t('exitEdit') : t('goToEdit')}
          </button>
        )}

        {isEditMode && (
          <>
            <button type="button" className="bg-panel hover:bg-panel-active rounded-panel flex items-center gap-1 px-2 py-1 text-xs transition-colors">
              <Plus className="h-3 w-3" />
              {t('addTrail')}
            </button>
            <label className="bg-panel hover:bg-panel-active rounded-panel flex cursor-pointer items-center gap-1 px-2 py-1 text-xs transition-colors">
              <Download className="h-3 w-3" />
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
