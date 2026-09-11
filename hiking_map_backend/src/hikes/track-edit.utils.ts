import { LineString, MultiLineString, Position } from 'geojson';

// 軌跡編輯的純函式。全部不碰資料庫也不碰網路，好測也好推理。
//
// 對外一律用「攤平後的點索引」定位：MultiLineString 可能有多個 segment，
// 但使用者在前端看到的是一條連續的線，要他去分辨「第 2 段的第 37 點」並不合理。
// 攤平索引 = 把所有 segment 的點依序接起來後的序號，從 0 開始。

export type TrackGeometry = LineString | MultiLineString;

// 一律轉成 segment 陣列，後面的處理就不必再分兩種型別
export function toSegments(geometry: TrackGeometry): Position[][] {
  return geometry.type === 'LineString' ? [geometry.coordinates] : geometry.coordinates;
}

// 攤平後的總點數，也就是合法索引的上界
export function countPoints(geometry: TrackGeometry): number {
  return toSegments(geometry).reduce((sum, segment) => sum + segment.length, 0);
}

// segment 結構會保留：裁切後仍是 MultiLineString，只是首尾被削掉，
// 中間完全落在保留範圍內的 segment 原封不動。
export function trimTrack(geometry: TrackGeometry, startIndex: number, endIndex: number): MultiLineString {
  const total = countPoints(geometry);

  if (!Number.isInteger(startIndex) || !Number.isInteger(endIndex)) {
    throw new Error('裁切索引必須是整數');
  }
  if (startIndex < 0 || endIndex > total - 1) {
    throw new Error(`裁切索引超出範圍，這條軌跡有 ${total} 個點`);
  }
  if (startIndex >= endIndex) {
    throw new Error('裁切的起點必須在終點之前');
  }

  const kept: Position[][] = [];
  let cursor = 0; // 目前 segment 的第一個點在攤平索引中的位置

  for (const segment of toSegments(geometry)) {
    const segStart = cursor;
    const segEnd = cursor + segment.length - 1;
    cursor += segment.length;

    // 整段落在保留範圍之外
    if (segEnd < startIndex || segStart > endIndex) continue;

    const from = Math.max(startIndex - segStart, 0);
    const to = Math.min(endIndex - segStart, segment.length - 1);
    const slice = segment.slice(from, to + 1);

    // 只剩單點的 segment 構不成線段，PostGIS 也不接受，直接丟掉
    if (slice.length >= 2) kept.push(slice);
  }

  if (kept.length === 0) {
    throw new Error('裁切後沒有剩下任何有效線段');
  }

  return { type: 'MultiLineString', coordinates: kept };
}

// 合併就是把各筆軌跡的 segment 依序接起來，不做接點對齊也不做去重。
// 刻意不把相鄰軌跡連成一條線：兩天的行程之間本來就有斷點，
// 硬連起來會在地圖上多出一條穿越山谷的假路徑。
export function mergeTracks(geometries: TrackGeometry[]): MultiLineString {
  if (geometries.length < 2) {
    throw new Error('合併至少需要兩筆軌跡');
  }

  const coordinates = geometries.flatMap((geometry) => toSegments(geometry)).filter((segment) => segment.length >= 2);

  if (coordinates.length === 0) {
    throw new Error('合併後沒有剩下任何有效線段');
  }

  return { type: 'MultiLineString', coordinates };
}

// 整段刪除，用於 GPS 飄移產生的雜訊段。
// segmentIndex 是 segment 的序號（非攤平後的點索引），對應前端在圖上選取的那一段。
export function dropSegment(geometry: TrackGeometry, segmentIndex: number): MultiLineString {
  const segments = toSegments(geometry);

  if (!Number.isInteger(segmentIndex)) {
    throw new Error('segment 索引必須是整數');
  }
  if (segmentIndex < 0 || segmentIndex > segments.length - 1) {
    throw new Error(`segment 索引超出範圍，這條軌跡有 ${segments.length} 段`);
  }
  if (segments.length === 1) {
    throw new Error('只剩一段時不能刪除，請改用刪除整筆紀錄');
  }

  return {
    type: 'MultiLineString',
    coordinates: segments.filter((_, i) => i !== segmentIndex),
  };
}
