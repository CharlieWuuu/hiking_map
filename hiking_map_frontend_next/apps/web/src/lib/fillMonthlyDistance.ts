type MonthlyDistance = { month: string; distanceKm: number };

// 後端只回傳有紀錄的月份，缺月份會直接缺席而非 0，這裡補齊最近 N 個月的區間
export function fillMonthlyDistance(data: MonthlyDistance[], monthsCount: number): MonthlyDistance[] {
  const byMonth = new Map(data.map((d) => [d.month, d.distanceKm]));
  const now = new Date();
  const months: MonthlyDistance[] = [];

  for (let i = monthsCount - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.push({ month, distanceKm: byMonth.get(month) ?? 0 });
  }

  return months;
}
