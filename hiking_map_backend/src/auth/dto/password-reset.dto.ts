import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { MaxBytes } from '../../common/validators/max-bytes.validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'hiker01@example.com' })
  @IsEmail({}, { message: 'email 格式不正確' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: '5f1c…（信裡連結帶的 token）' })
  @IsString()
  @MinLength(1, { message: '缺少重設連結的 token' })
  token: string;

  @ApiProperty({ example: 'newPassword123' })
  @IsString()
  @MinLength(8, { message: '密碼至少需要 8 個字元' })
  @MaxBytes(72, { message: '密碼過長（bcrypt 上限為 72 個位元組，中文字每字約 3 個）' })
  password: string;
}

export class SetEmailDto {
  @ApiProperty({ example: 'hiker01@example.com' })
  @IsEmail({}, { message: 'email 格式不正確' })
  email: string;
}

// 這個是回應用的，不經過 ValidationPipe，不需要驗證裝飾器
export class AuthMethodsDto {
  @ApiPropertyOptional({ example: 'hiker01@example.com', nullable: true })
  email: string | null;

  @ApiProperty({ example: true, description: '是否設定過密碼' })
  has_password: boolean;

  @ApiProperty({ example: false, description: '是否綁定 Google' })
  has_google: boolean;
}
