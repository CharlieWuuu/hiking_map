import type { SearchResultWithRelevance } from './SearchBar.types';

type Props = {
  item: SearchResultWithRelevance;
  onSelect: (item: SearchResultWithRelevance) => void;
};

const MATCH_REASON_LABEL: Record<SearchResultWithRelevance['matchReason'], string> = {
  name: '',
  field: '・符合內容',
  related: '・相關',
};

export default function SearchResultItem({ item, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(item)}
      className="hover:bg-panel-active-lighten/50 text-background-contrary rounded-panel flex w-full cursor-pointer flex-col items-start px-3.5 py-2 text-left transition-colors duration-150"
    >
      <span className="font-bold">{item.label}</span>
      <span className="text-background-contrary/60 text-xs">
        {item.type === 'user' ? '使用者' : '路線'}
        {MATCH_REASON_LABEL[item.matchReason]}
      </span>
    </button>
  );
}
