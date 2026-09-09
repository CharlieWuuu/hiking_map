import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, Min } from 'class-validator';

export class CreateCollectionDto {
  @ApiProperty({ example: 'trail', enum: ['trail', 'hike', 'user'] })
  @IsIn(['trail', 'hike', 'user'], { message: 'item_type 只能是 trail、hike 或 user' })
  item_type: 'trail' | 'hike' | 'user';

  @ApiProperty({ example: 1 })
  @IsInt({ message: 'item_id 必須是整數' })
  @Min(1)
  item_id: number;
}
