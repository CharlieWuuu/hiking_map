import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class LogSearchQueryDto {
  @ApiProperty({ example: '象山親山步道' })
  @IsString()
  @MinLength(1, { message: '搜尋詞不可為空' })
  @MaxLength(200, { message: '搜尋詞過長' })
  query: string;
}
