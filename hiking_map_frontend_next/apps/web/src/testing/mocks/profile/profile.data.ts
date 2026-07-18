export type ProfileDetail = {
  username: string;
  displayName: string;
  avatar?: string;
  level: string;
  totalDistanceKm: number;
  hikeCount: number;
  achievements: {
    hundred: number; // 百岳
    smallHundred: number; // 小百岳
    hundredTrail: number; // 百大必訪步道
  };
  monthlyDistance: { month: string; distanceKm: number }[];
  countyStats: { county: string; count: number }[];
  trails: {
    slug: string;
    name: string;
    county: string;
    town: string;
    date: string;
    distanceKm: number;
  }[];
};

// 之後接上真的後端 API 後，這份假資料會換成打 API 查詢的結果
export const MOCK_PROFILE_DETAILS: ProfileDetail[] = [
  {
    username: 'demo',
    displayName: '示範使用者',
    level: '進階山友',
    totalDistanceKm: 128.6,
    hikeCount: 24,
    achievements: { hundred: 12, smallHundred: 28, hundredTrail: 45 },
    monthlyDistance: [
      { month: '2025-01', distanceKm: 8.2 },
      { month: '2025-02', distanceKm: 12.5 },
      { month: '2025-03', distanceKm: 6.4 },
      { month: '2025-04', distanceKm: 15.8 },
      { month: '2025-05', distanceKm: 20.1 },
      { month: '2025-06', distanceKm: 9.6 },
    ],
    countyStats: [
      { county: '台北市', count: 8 },
      { county: '新北市', count: 6 },
      { county: '桃園市', count: 4 },
      { county: '台中市', count: 3 },
      { county: '南投縣', count: 2 },
      { county: '花蓮縣', count: 1 },
    ],
    trails: [
      { slug: 'trail-1', name: '象山親山步道', county: '台北市', town: '信義區', date: '2025-06-14', distanceKm: 2.8 },
      { slug: 'trail-2', name: '七星山親山步道', county: '新北市', town: '新店區', date: '2025-05-02', distanceKm: 6.4 },
      { slug: 'trail-3', name: '大屯山親山步道', county: '桃園市', town: '復興區', date: '2025-04-18', distanceKm: 5.1 },
      { slug: 'trail-4', name: '五分山親山步道', county: '台中市', town: '和平區', date: '2025-03-09', distanceKm: 4.3 },
      { slug: 'trail-5', name: '劍潭山親山步道', county: '台南市', town: '南化區', date: '2025-02-21', distanceKm: 3.6 },
    ],
  },
];
