import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrailDetailDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '塔塔加登山口至排雲山莊' })
  name: string;

  @ApiProperty({ example: 'tataka-trailhead-to-paiyun-lodge' })
  slug: string;

  @ApiPropertyOptional({ example: '玉山主線經典路線', nullable: true })
  description: string | null;

  @ApiPropertyOptional({ example: 8.5, nullable: true })
  distance_km: number | null;

  @ApiPropertyOptional({
    example: { type: 'LineString', coordinates: [[120.9, 23.47]] },
    nullable: true,
    description: '路線座標，GeoJSON LineString',
  })
  geojson: object | null;
}
