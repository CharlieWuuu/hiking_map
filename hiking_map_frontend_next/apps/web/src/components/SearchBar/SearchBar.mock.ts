import type { SearchResult } from './SearchBar.types';

// 之後接上真的後端 API 後，這份假資料會換成打 API 查詢的結果
export const MOCK_RESULTS: SearchResult[] = [
  { type: 'user', username: 'demo', label: '示範使用者' },
  { type: 'user', username: 'a-ming', label: '陳阿明' },
  { type: 'user', username: 'xiao-ming', label: '王小明' },
  { type: 'user', username: 'a-hua', label: '林阿華' },
  { type: 'user', username: 'xiao-mei', label: '王小美' },
  { type: 'trail', slug: 'xiangshan', label: '象山親山步道' },
  { type: 'trail', slug: 'qixingshan', label: '七星山步道' },
  { type: 'trail', slug: 'yangmingshan-lengshuikeng', label: '陽明山冷水坑步道' },
  { type: 'trail', slug: 'maokong', label: '貓空樟山寺步道' },
];
