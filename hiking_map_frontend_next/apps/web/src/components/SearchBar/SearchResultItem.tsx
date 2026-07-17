import { CircleUserRound } from 'lucide-react';

import type { SearchResultWithRelevance } from './SearchBar.types';

type Props = {
  item: SearchResultWithRelevance;
  onSelect: (item: SearchResultWithRelevance) => void;
};

const MATCH_REASON_LABEL: Record<SearchResultWithRelevance['matchReason'], string> = {
  name: '',
  field: '・符合內容',
};

export default function SearchResultItem({ item, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(item)}
      className="hover:bg-panel-active-lighten/50 text-background-contrary rounded-panel flex w-full cursor-pointer items-center gap-3 px-3.5 py-2 text-left transition-colors duration-150"
    >
      {item.type === 'user' &&
        (item.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="bg-panel-active flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
            <CircleUserRound className="text-background-contrary/60 h-5 w-5" />
          </span>
        ))}
      <span className="flex flex-col items-start">
        <span className="font-bold">{item.displayName}</span>
        <span className="text-background-contrary/60 text-xs">
          {item.type === 'user' ? '使用者' : '路線'}
          {MATCH_REASON_LABEL[item.matchReason]}
        </span>
      </span>
    </button>
  );
}
