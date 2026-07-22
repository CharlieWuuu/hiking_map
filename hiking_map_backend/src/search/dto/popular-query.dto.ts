import { ApiProperty } from '@nestjs/swagger';

export class PopularQueryDto {
  @ApiProperty({ example: '象山親山步道' })
  text: string;
}
