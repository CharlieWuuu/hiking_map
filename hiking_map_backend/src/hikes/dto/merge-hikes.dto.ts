import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MergeHikesDto {
  // 合併後的軌跡依照這個陣列的順序接起來，不會自動照日期排
  @ApiProperty({ example: [12, 15, 17], description: '要合併的紀錄 id，軌跡依此順序串接' })
  hike_ids: number[];

  @ApiProperty({ example: '南二段縱走' })
  name: string;

  @ApiPropertyOptional({ example: '2026-07-20', description: '省略時採用來源紀錄中最早的日期' })
  date?: string;

  @ApiPropertyOptional({ example: false, description: '合併後是否刪除來源紀錄，預設保留' })
  delete_sources?: boolean;
}
