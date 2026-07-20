import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  avatar?: string;

  @ApiPropertyOptional({ example: '中級' })
  level?: string;

  @ApiPropertyOptional({ example: '喜歡爬百岳的登山愛好者' })
  description?: string;
}
