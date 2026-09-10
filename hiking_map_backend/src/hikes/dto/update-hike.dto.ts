import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

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

  @ApiPropertyOptional({ example: true, description: '是否屬於百岳分類' })
  @IsOptional()
  @IsBoolean()
  is_hundred?: boolean;

  @ApiPropertyOptional({ example: false, description: '是否屬於小百岳分類' })
  @IsOptional()
  @IsBoolean()
  is_small_hundred?: boolean;

  @ApiPropertyOptional({ example: false, description: '是否屬於百大必訪步道分類' })
  @IsOptional()
  @IsBoolean()
  is_hundred_trail?: boolean;

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
}
