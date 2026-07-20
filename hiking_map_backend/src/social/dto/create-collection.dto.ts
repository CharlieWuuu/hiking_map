import { ApiProperty } from '@nestjs/swagger';

export class CreateCollectionDto {
  @ApiProperty({ example: 'trail', enum: ['trail', 'hike'] })
  item_type: 'trail' | 'hike';

  @ApiProperty({ example: 1 })
  item_id: number;
}
