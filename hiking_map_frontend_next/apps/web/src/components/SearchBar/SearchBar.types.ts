export type SearchResult =
  { type: 'user'; username: string; label: string; bio?: string } | { type: 'trail'; slug: string; label: string; region?: string; description?: string };

export type MatchReason =
  | 'name' // 名稱本身符合關鍵字
  | 'field' // 透過其他欄位（地區、簡介、內文）符合關鍵字
  | 'related'; // 透過關聯（誰爬過哪條步道）擴展出來的結果

export type SearchResultWithRelevance = SearchResult & {
  matchReason: MatchReason;
};

// 文字建議：不是真實存在的資料，只是幫忙把搜尋字串打得更完整，點下去等於直接送出這串文字去搜尋
export type QuerySuggestion = {
  type: 'query';
  text: string;
};
