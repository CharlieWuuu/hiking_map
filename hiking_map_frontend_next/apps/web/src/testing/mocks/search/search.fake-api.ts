import type { MatchReason, QuerySuggestion, SearchResult, SearchResultWithRelevance } from '../../../components/SearchBar/SearchBar.types';
import { MOCK_HIKE_RECORDS, MOCK_POPULAR_QUERIES, MOCK_RESULTS } from './search.data';

export const RESULTS_PER_PAGE = 5;

const resultKey = (item: SearchResult) => `${item.type}-${item.type === 'user' ? item.username : item.slug}`;

function fieldsToSearch(item: SearchResult): string[] {
  if (item.type === 'user') return [item.label, item.bio ?? ''];
  return [item.label, item.region ?? '', item.description ?? ''];
}

function matchesName(item: SearchResult, q: string): boolean {
  return item.label.toLowerCase().includes(q);
}

function matchesOtherFields(item: SearchResult, q: string): boolean {
  return fieldsToSearch(item)
    .slice(1)
    .some((field) => field.toLowerCase().includes(q));
}

// 打字中即時提示：只給少量最相關的直接符合結果
// 之後要換成 autocomplete API：追求快、不追求準，回一小批輕量結果
export function getSuggestions(query: string, limit = 5): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return MOCK_RESULTS.filter((item) => matchesName(item, q)).slice(0, limit);
}

// 文字建議：從熱門關鍵字裡找開頭符合的字串，點下去等於直接送出這串文字去搜尋
// 之後可換成後端統計「最多人搜過的字串」，依熱門度排序回傳
export function getQuerySuggestions(query: string, limit = 3): QuerySuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return MOCK_POPULAR_QUERIES.filter((text) => text.toLowerCase().includes(q))
    .slice(0, limit)
    .map((text) => ({ type: 'query', text }));
}

// 送出後的完整搜尋結果：名稱符合 > 其他欄位符合 > 關聯擴展，依此排序
// 之後要換成 search API：後端做全文檢索 + 關聯查詢（JOIN），前端只管顯示回傳結果
export function getFullSearchResults(query: string): SearchResultWithRelevance[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const byName = MOCK_RESULTS.filter((item) => matchesName(item, q));
  const byField = MOCK_RESULTS.filter((item) => !matchesName(item, q) && matchesOtherFields(item, q));
  const direct = [...byName, ...byField];
  const directKeys = new Set(direct.map(resultKey));

  const related: SearchResult[] = [];
  for (const item of direct) {
    if (item.type === 'user') {
      const trailSlugs = MOCK_HIKE_RECORDS.filter((r) => r.username === item.username).map((r) => r.trailSlug);
      for (const slug of trailSlugs) {
        const trail = MOCK_RESULTS.find((r) => r.type === 'trail' && r.slug === slug);
        if (trail && !directKeys.has(resultKey(trail))) related.push(trail);
      }
    } else {
      const usernames = MOCK_HIKE_RECORDS.filter((r) => r.trailSlug === item.slug).map((r) => r.username);
      for (const username of usernames) {
        const user = MOCK_RESULTS.find((r) => r.type === 'user' && r.username === username);
        if (user && !directKeys.has(resultKey(user))) related.push(user);
      }
    }
  }
  const dedupedRelated = Array.from(new Map(related.map((item) => [resultKey(item), item])).values());

  const withReason = (items: SearchResult[], matchReason: MatchReason): SearchResultWithRelevance[] => items.map((item) => ({ ...item, matchReason }));

  return [...withReason(byName, 'name'), ...withReason(byField, 'field'), ...withReason(dedupedRelated, 'related')];
}

export function paginate<T>(items: T[], page: number, perPage = RESULTS_PER_PAGE): T[] {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}
