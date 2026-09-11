import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, Min } from 'class-validator';

export class CreateCollectionDto {
  @ApiProperty({ example: 'trail', enum: ['trail', 'hike'] })
  @IsIn(['trail', 'hike'], { message: 'item_type 只能是 trail 或 hike' })
  item_type: 'trail' | 'hike';

  @ApiProperty({ example: 1 })
  @IsInt({ message: 'item_id 必須是整數' })
  @Min(1)
  item_id: number;
}
