import { FeatureCollection } from 'geojson';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

// 只檢查 create() 真正會用到的部分：features 必須存在且至少一筆。
// 座標與幾何型別留給 PostGIS 驗，那才是真正的權威。
class GeojsonShapeDto {
  @IsArray({ message: 'geojson.features 必須是陣列' })
  @ArrayMinSize(1, { message: 'geojson 中沒有可用的軌跡' })
  features: unknown[];
}

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
  @IsDateString({ strict: true }, { message: 'date 必須是有效的日期，格式 YYYY-MM-DD' })
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

  @ApiPropertyOptional({ example: [1, 2], description: '這趟紀錄完成的山頭 id 清單' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  mountain_ids?: number[];

  // 幾何結構本身交給 PostGIS 的 ST_GeomFromGeoJSON 把關——在這裡逐層宣告巢狀型別
  // 既冗長又容易跟規格脫節。但至少要確認 features 陣列存在且非空：
  // create() 會直接取 features[0]，空陣列會在服務層炸成 500 而不是回 400。
  @ApiProperty({
    example: {
      type: 'FeatureCollection',
      features: [],
    },
  })
  @IsObject({ message: 'geojson 必須是物件' })
  @ValidateNested()
  @Type(() => GeojsonShapeDto)
  geojson: FeatureCollection;
}
