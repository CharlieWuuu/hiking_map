import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { IsUrl } from 'class-validator';

export class UpdateProfileDto {
  // 註冊與 Google 登入建立 profile 時 avatar 都是空字串，而編輯表單會把現值一起送回來，
  // 所以空字串必須放行——否則還沒設過頭像的人一存個人資料就會收到 400。
  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', description: '空字串代表不設頭像' })
  @IsOptional()
  @ValidateIf((_, value) => value !== '')
  @IsUrl({}, { message: '頭像必須是有效的網址' })
  avatar?: string;

  @ApiPropertyOptional({ example: '喜歡爬百岳的登山愛好者' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '自我介紹不可超過 500 個字' })
  description?: string;
}
