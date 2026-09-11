import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

// 只涵蓋 TrailEditCard 會送出的一般屬性；軌跡本身的編輯走 track/trim 與 track/drop-segment，不走這裡
export class UpdateHikeDto {
  @ApiPropertyOptional({ example: '合歡山主峰步道' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: '南投縣' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  county?: string;

  @ApiPropertyOptional({ example: '仁愛鄉' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  town?: string;

  @ApiPropertyOptional({ example: '2026-07-20' })
  @IsOptional()
  @IsDateString({ strict: true }, { message: 'date 必須是有效的日期，格式 YYYY-MM-DD' })
  date?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @ApiPropertyOptional({ example: ['https://example.com/track.gpx'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  urls?: string[];

  @ApiPropertyOptional({ example: '天氣很好，view 很棒' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  note?: string;

  @ApiPropertyOptional({ example: [1, 2], description: '這趟紀錄完成的山頭 id 清單，會整批取代原本標記的山頭' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  mountain_ids?: number[];
}
