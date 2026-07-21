'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Popover } from 'radix-ui';
import { useState } from 'react';

import { getQuerySuggestions, getSuggestions } from '../../testing/mocks/search/search.fake-api';
import QuerySuggestionItem from './QuerySuggestionItem';
import styles from './SearchBar.module.css';
import type { QuerySuggestion, SearchResult } from './SearchBar.types';
import SearchResultItem from './SearchResultItem';

type Props = {
  onSubmitQuery: (query: string) => void;
  onSelectEntity: (item: SearchResult) => void;
};

export default function SearchBar({ onSubmitQuery, onSelectEntity }: Props) {
  const t = useTranslations('SearchBar');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const entitySuggestions = getSuggestions(query);
  const querySuggestions = getQuerySuggestions(query);
  const showSuggestions = open && (entitySuggestions.length > 0 || querySuggestions.length > 0);

  function submitQuery(q: string) {
    setOpen(false);
    if (q.trim()) onSubmitQuery(q.trim());
  }

  function handleSelectEntity(item: SearchResult) {
    setOpen(false);
    onSelectEntity(item);
  }

  function handleSelectQuery(item: QuerySuggestion) {
    setQuery(item.text);
    submitQuery(item.text);
  }

  return (
    <Popover.Root open={showSuggestions}>
      <Popover.Anchor asChild>
        <div className="bg-panel flex items-center gap-2 rounded-full px-4 py-2">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitQuery(query);
            }}
            placeholder={t('placeholder')}
            className="text-background-contrary flex-1 bg-transparent outline-none lg:text-lg"
          />
          <button onClick={() => submitQuery(query)} aria-label={t('searchLabel')} className="cursor-pointer">
            <Search className="text-background-contrary h-5 w-5" />
          </button>
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          sideOffset={8}
          className={`bg-panel w-(--radix-popover-trigger-width) ${styles.resultsPanel}`}
        >
          {querySuggestions.map((item) => (
            <QuerySuggestionItem key={`query-${item.text}`} item={item} onSelect={handleSelectQuery} />
          ))}
          {entitySuggestions.map((item) => (
            <SearchResultItem
              key={`${item.type}-${item.type === 'user' ? item.username : item.slug}`}
              item={{ ...item, matchReason: 'name' }}
              onSelect={handleSelectEntity}
            />
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
