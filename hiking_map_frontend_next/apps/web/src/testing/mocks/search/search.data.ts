import type { SearchResult } from '../../../components/SearchBar/SearchBar.types';

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
  { type: 'trail', slug: 'meilun-mountain', label: '美崙山步道', region: '花蓮縣' },
  { type: 'trail', slug: 'jinmian-mountain', label: '金面山步道', region: '台北市', description: '鄰近美濃里，視野遼闊' },
  {
    type: 'trail',
    slug: 'xianji-yan',
    label: '仙跡岩步道',
    region: '台北市',
    description: '位於景美地區，適合親子健行',
  },
];

// 熱門搜尋關鍵字，用來做「文字建議」（之後可換成後端統計最多人搜過的字串）
export const MOCK_POPULAR_QUERIES: string[] = ['象山親山步道', '象山夜景', '陽明山健行', '新手路線推薦', '貓空纜車步道'];

// 誰爬過哪些步道，用來做「相關聯」的結果擴展（例如搜使用者會帶出他爬過的步道，反之亦然）
export const MOCK_HIKE_RECORDS: { username: string; trailSlug: string }[] = [
  { username: 'a-ming', trailSlug: 'xiangshan' },
  { username: 'a-ming', trailSlug: 'qixingshan' },
  { username: 'xiao-ming', trailSlug: 'yangmingshan-lengshuikeng' },
  { username: 'xiao-mei', trailSlug: 'xiangshan' },
  { username: 'xiao-mei', trailSlug: 'meilun-mountain' },
  { username: 'a-hua', trailSlug: 'maokong' },
];
