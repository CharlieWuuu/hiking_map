import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, ArrayUnique, IsArray, IsBoolean, IsInt, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class MergeHikesDto {
  // 合併後的軌跡依照這個陣列的順序接起來，不會自動照日期排
  @ApiProperty({ example: [12, 15, 17], description: '要合併的紀錄 id，軌跡依此順序串接' })
  @IsArray()
  @ArrayMinSize(2, { message: '合併至少需要兩筆紀錄' })
  @ArrayUnique({ message: 'hike_ids 不可重複' })
  @IsInt({ each: true, message: 'hike_ids 必須是整數陣列' })
  hike_ids: number[];

  @ApiProperty({ example: '南二段縱走' })
  @IsString()
  @MinLength(1, { message: 'name 不可為空' })
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: '2026-07-20', description: '省略時採用來源紀錄中最早的日期' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date 格式應為 YYYY-MM-DD' })
  date?: string;

  @ApiPropertyOptional({ example: false, description: '合併後是否刪除來源紀錄，預設保留' })
  @IsOptional()
  @IsBoolean()
  delete_sources?: boolean;
}
