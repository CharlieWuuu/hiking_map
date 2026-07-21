import { FeatureCollection } from 'geojson';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHikeDto {
  @ApiProperty({ example: '合歡山主峰步道' })
  name: string;

  @ApiPropertyOptional({ example: '南投縣' })
  county?: string;

  @ApiPropertyOptional({ example: '仁愛鄉' })
  town?: string;

  @ApiProperty({ example: '2026-07-20' })
  date: string;

  @ApiProperty({ example: 5.2 })
  distance_km: number;

  @ApiPropertyOptional({ example: true })
  is_public?: boolean;

  @ApiPropertyOptional({ example: '天氣很好，view 很棒' })
  note?: string;

  @ApiPropertyOptional({ example: ['https://example.com/track.gpx'], type: [String] })
  urls?: string[];

  @ApiPropertyOptional({ example: 1 })
  trail_id?: number;

  @ApiPropertyOptional({ example: [1, 2] })
  category_ids?: number[];

  @ApiProperty({
    example: {
      type: 'FeatureCollection',
      features: [],
    },
  })
  geojson: FeatureCollection;
}
