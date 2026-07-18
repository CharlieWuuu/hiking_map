export type TrailDetail = {
  slug: string;
  name: string;
  county: string;
  town: string;
  date: string;
  distanceKm: number;
  urls: string[];
  note?: string;
  description?: string;
  // 路線座標序列，[經度, 緯度]，之後接上真的後端 API 後會換成後端回傳的 GeoJSON LineString
  path: [number, number][];
};

// 之後接上真的後端 API 後，這份假資料會換成打 API 查詢的結果
export const MOCK_TRAIL_DETAILS: TrailDetail[] = [
  {
    slug: 'trail-1',
    name: '象山親山步道',
    county: '台北市',
    town: '信義區',
    date: '2025-03-14',
    distanceKm: 2.8,
    urls: ['https://example.com/trail-1-a', 'https://example.com/trail-1-b'],
    note: '鄰近信義區，適合新手健行',
    description: '象山親山步道是台北市熱門的夜景登山路線，步道規劃完善，沿途設有多個觀景平台，可俯瞰台北 101 與市區夜景，適合親子與新手健行。',
    path: [
      [121.5705, 25.0275],
      [121.572, 25.0268],
      [121.5738, 25.0261],
      [121.5751, 25.0248],
      [121.5762, 25.0233],
      [121.577, 25.0219],
    ],
  },
  {
    slug: 'trail-2',
    name: '七星山親山步道',
    county: '新北市',
    town: '新店區',
    date: '2025-05-02',
    distanceKm: 6.4,
    urls: ['https://example.com/trail-2-a'],
    note: '新北市熱門路線，假日人潮較多',
    description: '七星山為大屯火山群最高峰，步道沿途可見硫氣孔地質景觀，視野遼闊，是台北近郊熱門的登山路線之一。',
    path: [
      [121.5445, 25.1668],
      [121.5461, 25.1652],
      [121.5478, 25.1639],
      [121.5492, 25.1621],
      [121.5507, 25.1605],
      [121.5523, 25.159],
    ],
  },
];
