import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CollectionItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'trail', enum: ['trail', 'hike'] })
  item_type: 'trail' | 'hike';

  @ApiProperty({ example: 1 })
  item_id: number;

  @ApiProperty({ example: '2026-07-20T10:00:00.000Z' })
  created_at: Date;

  // item_type 為 trail 時才有值
  @ApiPropertyOptional({ example: '塔塔加登山口至排雲山莊', nullable: true })
  trail_name?: string | null;

  @ApiPropertyOptional({ example: 'tataka-trailhead-to-paiyun-lodge', nullable: true })
  trail_slug?: string | null;
}
