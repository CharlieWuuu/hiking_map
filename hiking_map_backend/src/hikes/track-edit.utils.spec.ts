import { LineString, MultiLineString } from 'geojson';
import { countPoints, dropSegment, mergeTracks, toSegments, trimTrack } from './track-edit.utils';

// 產生一條每點遞增的線，方便用座標值反推它原本是第幾個點
const line = (from: number, count: number): LineString => ({
  type: 'LineString',
  coordinates: Array.from({ length: count }, (_, i) => [121 + (from + i) / 1000, 24 + (from + i) / 1000]),
});

const multi = (...segments: LineString[]): MultiLineString => ({
  type: 'MultiLineString',
  coordinates: segments.map((s) => s.coordinates),
});

// 把座標還原成當初的序號，斷言時比一串浮點數好讀
const serials = (geometry: MultiLineString): number[][] =>
  geometry.coordinates.map((segment) => segment.map(([lng]) => Math.round((lng - 121) * 1000)));

describe('toSegments / countPoints', () => {
  it('LineString 會被包成單一 segment', () => {
    expect(toSegments(line(0, 3))).toHaveLength(1);
    expect(countPoints(line(0, 3))).toBe(3);
  });

  it('MultiLineString 的點數是各段加總', () => {
    expect(countPoints(multi(line(0, 3), line(10, 4)))).toBe(7);
  });
});

describe('trimTrack', () => {
  it('砍掉單段軌跡的頭尾', () => {
    expect(serials(trimTrack(line(0, 10), 2, 6))).toEqual([[2, 3, 4, 5, 6]]);
  });

  it('endIndex 是包含在內的', () => {
    expect(countPoints(trimTrack(line(0, 10), 0, 9))).toBe(10);
  });

  it('跨 segment 裁切時保留分段結構，不會把兩段黏成一條', () => {
    // 攤平後：段一 = 索引 0-4，段二 = 索引 5-9
    const result = trimTrack(multi(line(0, 5), line(100, 5)), 3, 7);
    expect(serials(result)).toEqual([
      [3, 4],
      [100, 101, 102],
    ]);
  });

  it('完全落在範圍外的 segment 會被丟掉', () => {
    const result = trimTrack(multi(line(0, 5), line(100, 5), line(200, 5)), 5, 9);
    expect(serials(result)).toEqual([[100, 101, 102, 103, 104]]);
  });

  it('裁切後只剩單點的 segment 會被丟掉，因為構不成線段', () => {
    // 索引 4 是段一的最後一點，單獨留下來沒有意義
    const result = trimTrack(multi(line(0, 5), line(100, 5)), 4, 7);
    expect(serials(result)).toEqual([[100, 101, 102]]);
  });

  it('原始 geometry 不會被就地修改', () => {
    const source = multi(line(0, 5), line(100, 5));
    const before = JSON.stringify(source);
    trimTrack(source, 1, 8);
    expect(JSON.stringify(source)).toBe(before);
  });

  describe('不合法的輸入', () => {
    it('起點不在終點之前', () => {
      expect(() => trimTrack(line(0, 10), 5, 5)).toThrow('起點必須在終點之前');
      expect(() => trimTrack(line(0, 10), 6, 2)).toThrow('起點必須在終點之前');
    });

    it('索引超出範圍', () => {
      expect(() => trimTrack(line(0, 10), 0, 10)).toThrow('超出範圍');
      expect(() => trimTrack(line(0, 10), -1, 5)).toThrow('超出範圍');
    });

    it('非整數索引', () => {
      expect(() => trimTrack(line(0, 10), 0, 5.5)).toThrow('必須是整數');
    });

    it('保留範圍內每段都不足兩點', () => {
      // 索引 4 與 5 分屬兩段，各自只剩一個點
      expect(() => trimTrack(multi(line(0, 5), line(100, 5)), 4, 5)).toThrow('沒有剩下任何有效線段');
    });
  });
});

describe('mergeTracks', () => {
  it('依序把各筆軌跡的 segment 接起來', () => {
    const result = mergeTracks([line(0, 3), line(100, 3)]);
    expect(serials(result)).toEqual([
      [0, 1, 2],
      [100, 101, 102],
    ]);
  });

  it('刻意不把相鄰軌跡連成一條線，段數等於來源段數總和', () => {
    const result = mergeTracks([multi(line(0, 3), line(50, 3)), line(100, 3)]);
    expect(result.coordinates).toHaveLength(3);
  });

  it('保留原本的順序，呼叫端決定要用哪個順序合併', () => {
    const result = mergeTracks([line(100, 3), line(0, 3)]);
    expect(serials(result)[0][0]).toBe(100);
  });

  it('少於兩筆就拒絕', () => {
    expect(() => mergeTracks([line(0, 3)])).toThrow('至少需要兩筆');
  });
});

describe('dropSegment', () => {
  it('刪掉指定的那一段，其餘保留原順序', () => {
    const result = dropSegment(multi(line(0, 3), line(100, 3), line(200, 3)), 1);
    expect(serials(result)).toEqual([
      [0, 1, 2],
      [200, 201, 202],
    ]);
  });

  it('可以刪第一段', () => {
    const result = dropSegment(multi(line(0, 3), line(100, 3)), 0);
    expect(serials(result)).toEqual([[100, 101, 102]]);
  });

  it('原始 geometry 不會被就地修改', () => {
    const source = multi(line(0, 3), line(100, 3));
    const before = JSON.stringify(source);
    dropSegment(source, 0);
    expect(JSON.stringify(source)).toBe(before);
  });

  it('只剩一段時拒絕刪除', () => {
    expect(() => dropSegment(line(0, 5), 0)).toThrow('只剩一段時不能刪除');
  });

  it('索引超出範圍', () => {
    expect(() => dropSegment(multi(line(0, 3), line(100, 3)), 2)).toThrow('超出範圍');
    expect(() => dropSegment(multi(line(0, 3), line(100, 3)), -1)).toThrow('超出範圍');
  });

  it('非整數索引', () => {
    expect(() => dropSegment(multi(line(0, 3), line(100, 3)), 0.5)).toThrow('必須是整數');
  });
});
