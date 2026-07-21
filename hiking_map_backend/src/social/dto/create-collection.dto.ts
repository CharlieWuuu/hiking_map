import { ApiProperty } from '@nestjs/swagger';

export class CreateCollectionDto {
  @ApiProperty({ example: 'trail', enum: ['trail', 'hike', 'user'] })
  item_type: 'trail' | 'hike' | 'user';

  @ApiProperty({ example: 1 })
  item_id: number;
}
