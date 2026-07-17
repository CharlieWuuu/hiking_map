'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { MOCK_RESULTS } from './SearchBar.mock';
import styles from './SearchBar.module.css';
import type { SearchResult } from './SearchBar.types';
import SearchResultItem from './SearchResultItem';

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  function runSearch() {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }
    setResults(MOCK_RESULTS.filter((item) => item.label.toLowerCase().includes(q)));
  }

  function handleSelect(item: SearchResult) {
    if (item.type === 'user') {
      router.push(`/profile/${item.username}`);
    } else {
      router.push(`/trails/${item.slug}`);
    }
  }

  return (
    <div className="lg:mx-auto lg:max-w-[80%]">
      <div className="bg-panel lg:bg-panel-active-lighten flex items-center gap-2 rounded-full px-4 py-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') runSearch();
          }}
          placeholder="搜尋使用者或路線"
          className="text-background-contrary flex-1 bg-transparent outline-none lg:text-lg"
        />
        <button onClick={runSearch} aria-label="搜尋">
          <Search className="text-background-contrary h-5 w-5" />
        </button>
      </div>

      {results.length > 0 && (
        <div className={`bg-panel mt-3 flex flex-col gap-1 shadow-lg ${styles.resultsPanel}`}>
          {results.map((item) => (
            <SearchResultItem key={`${item.type}-${item.type === 'user' ? item.username : item.slug}`} item={item} onSelect={handleSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
