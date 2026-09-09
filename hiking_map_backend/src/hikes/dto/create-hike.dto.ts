import { FeatureCollection } from 'geojson';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateHikeDto {
  @ApiProperty({ example: '合歡山主峰步道' })
  @IsString()
  @IsNotEmpty({ message: '請輸入紀錄名稱' })
  @MaxLength(100)
  name: string;

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

  @ApiProperty({ example: '2026-07-20' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date 格式應為 YYYY-MM-DD' })
  date: string;

  // 目前不採用：距離一律由後端用 PostGIS 從軌跡重算，確保與編輯後的數字同一套定義
  @ApiPropertyOptional({ example: 5.2, description: '已忽略，距離由後端從軌跡計算' })
  @IsOptional()
  distance_km?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @ApiPropertyOptional({ example: '天氣很好，view 很棒' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  note?: string;

  @ApiPropertyOptional({ example: ['https://example.com/track.gpx'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  urls?: string[];

  @ApiPropertyOptional({ example: 'https://pub-xxxx.r2.dev/hikes/1/cover.jpg' })
  @IsOptional()
  @IsString()
  cover_image_url?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  trail_id?: number;

  @ApiPropertyOptional({ example: [1, 2] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  category_ids?: number[];

  // 只驗到「是個物件」為止。GeoJSON 的結構交給 PostGIS 的 ST_GeomFromGeoJSON 把關，
  // 在這裡逐層宣告巢狀型別既冗長又容易跟規格脫節。
  @ApiProperty({
    example: {
      type: 'FeatureCollection',
      features: [],
    },
  })
  @IsObject({ message: 'geojson 必須是物件' })
  geojson: FeatureCollection;
}
