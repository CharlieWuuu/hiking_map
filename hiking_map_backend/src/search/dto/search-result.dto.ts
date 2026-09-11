import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchResultDto {
  // hike 是搜尋者自己的紀錄，slug 用 hike id 字串化，前端組 /hikes/:id 連結用；
  // trail 才有正式的字串 slug
  @ApiProperty({ example: 'trail', enum: ['trail', 'hike'] })
  type: 'trail' | 'hike';

  @ApiProperty({ example: 'tataka-trailhead-to-paiyun-lodge' })
  slug: string;

  @ApiProperty({ example: '塔塔加登山口至排雲山莊' })
  display_name: string;

  @ApiPropertyOptional({ example: '南投縣', nullable: true })
  county?: string | null;

  @ApiPropertyOptional({ example: '信義鄉', nullable: true })
  town?: string | null;

  @ApiPropertyOptional({ example: 'https://pub-xxxx.r2.dev/trails/1/cover.jpg', nullable: true })
  cover_image_url?: string | null;

  @ApiProperty({ example: 'name', enum: ['name', 'field'] })
  match_reason: 'name' | 'field';

  @ApiPropertyOptional({ example: 12.3, description: '距離查詢座標的距離（公里），只有 nearby 查詢會帶這個欄位' })
  distance_km?: number;

  @ApiPropertyOptional({ example: '百岳', description: '分類名稱（百岳/小百岳/百大必訪步道），只有 nearby 查詢會帶這個欄位' })
  category_name?: string;
}
