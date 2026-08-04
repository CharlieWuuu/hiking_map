import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchResultDto {
  @ApiProperty({ example: 'trail', enum: ['trail', 'user'] })
  type: 'trail' | 'user';

  // trail 用 slug、user 用 username，前端組連結用
  @ApiProperty({ example: 'tataka-trailhead-to-paiyun-lodge' })
  slug: string;

  @ApiProperty({ example: '塔塔加登山口至排雲山莊' })
  display_name: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', nullable: true })
  avatar?: string | null;

  @ApiPropertyOptional({ example: '南投縣', nullable: true })
  county?: string | null;

  @ApiPropertyOptional({ example: '信義鄉', nullable: true })
  town?: string | null;

  @ApiPropertyOptional({ example: '中級', nullable: true })
  level?: string | null;

  @ApiPropertyOptional({ example: 'https://pub-xxxx.r2.dev/trails/1/cover.jpg', nullable: true })
  cover_image_url?: string | null;

  @ApiProperty({ example: 'name', enum: ['name', 'field'] })
  match_reason: 'name' | 'field';
}
