import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  // 只收英數與底線：Google 註冊時產生的帳號也是用同一套規則去除其他字元
  @ApiProperty({ example: 'hiker01' })
  @IsString()
  @MinLength(3, { message: '帳號至少需要 3 個字元' })
  @MaxLength(30, { message: '帳號不可超過 30 個字元' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: '帳號只能使用英文、數字與底線' })
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8, { message: '密碼至少需要 8 個字元' })
  @MaxLength(72, { message: '密碼不可超過 72 個字元' }) // bcrypt 只吃前 72 bytes，超過的部分會被無聲截斷
  password: string;

  // 選填。沒有 email 就沒辦法用忘記密碼，只能靠綁定的 Google 進來
  @ApiPropertyOptional({ example: 'hiker01@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'email 格式不正確' })
  email?: string;
}
