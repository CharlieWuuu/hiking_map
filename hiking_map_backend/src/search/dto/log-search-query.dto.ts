import { ApiProperty } from '@nestjs/swagger';

export class LogSearchQueryDto {
  @ApiProperty({ example: '象山親山步道' })
  query: string;
}
