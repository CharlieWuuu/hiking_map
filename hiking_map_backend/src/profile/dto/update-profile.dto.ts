import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsOptional()
  @IsUrl({}, { message: '頭像必須是有效的網址' })
  avatar?: string;

  @ApiPropertyOptional({ example: '喜歡爬百岳的登山愛好者' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '自我介紹不可超過 500 個字' })
  description?: string;
}
