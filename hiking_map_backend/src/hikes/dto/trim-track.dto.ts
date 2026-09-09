import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrimTrackDto {
  // 攤平後的點索引，從 0 開始，兩端都包含在保留範圍內
  @ApiProperty({ example: 12, description: '保留範圍的起始點索引（含）' })
  start_index: number;

  @ApiProperty({ example: 5820, description: '保留範圍的結束點索引（含）' })
  end_index: number;

  // 前端讀到的那份軌跡有幾個點。列表 API 給的是簡化線，若拿簡化線的索引來裁切，
  // 索引會落在合法範圍內卻裁到完全不同的位置，而且靜靜回 200。
  // 帶上這個欄位，對不上就擋下來。
  @ApiPropertyOptional({ example: 6421, description: '前端所依據的軌跡點數，用來確認索引基準一致' })
  expected_point_count?: number;
}
