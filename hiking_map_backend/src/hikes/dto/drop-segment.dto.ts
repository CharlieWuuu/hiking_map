import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class DropSegmentDto {
  // segment 的序號，非攤平後的點索引。對應前端在圖上選取的那一段。
  @ApiProperty({ example: 1, description: '要刪除的 segment 序號，從 0 開始' })
  @IsInt({ message: 'segment_index 必須是整數' })
  @Min(0)
  segment_index: number;

  // 與裁切同理：確認前端看到的軌跡與資料庫現況一致
  @ApiPropertyOptional({ example: 3, description: '前端所依據的 segment 數量' })
  @IsOptional()
  @IsInt()
  @Min(1)
  expected_segment_count?: number;
}
