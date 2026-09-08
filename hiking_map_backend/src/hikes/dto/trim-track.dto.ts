import { ApiProperty } from '@nestjs/swagger';

export class TrimTrackDto {
  // 攤平後的點索引，從 0 開始，兩端都包含在保留範圍內
  @ApiProperty({ example: 12, description: '保留範圍的起始點索引（含）' })
  start_index: number;

  @ApiProperty({ example: 5820, description: '保留範圍的結束點索引（含）' })
  end_index: number;
}
