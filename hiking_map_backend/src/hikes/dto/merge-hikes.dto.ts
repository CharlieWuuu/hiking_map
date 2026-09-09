import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class MergeHikesDto {
  // 合併後的軌跡依照這個陣列的順序接起來，不會自動照日期排
  @ApiProperty({ example: [12, 15, 17], description: '要合併的紀錄 id，軌跡依此順序串接' })
  @IsArray()
  @ArrayMinSize(2, { message: '合併至少需要兩筆紀錄' })
  @ArrayUnique({ message: 'hike_ids 不可重複' })
  @IsInt({ each: true, message: 'hike_ids 必須是整數陣列' })
  hike_ids: number[];

  // 先 trim 再驗長度，否則純空白的名稱會通過 MinLength(1)
  @ApiProperty({ example: '南二段縱走' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1, { message: 'name 不可為空' })
  @MaxLength(100)
  name: string;

  // IsDateString 會連「日期是否真的存在」都檢查，2026-13-45 這種會被擋下來；
  // 只用正則的話格式對但日期無效，會一路送到 Postgres 才炸成 500
  @ApiPropertyOptional({ example: '2026-07-20', description: '省略時採用來源紀錄中最早的日期' })
  @IsOptional()
  @IsDateString({ strict: true }, { message: 'date 必須是有效的日期，格式 YYYY-MM-DD' })
  date?: string;

  @ApiPropertyOptional({ example: false, description: '合併後是否刪除來源紀錄，預設保留' })
  @IsOptional()
  @IsBoolean()
  delete_sources?: boolean;
}
