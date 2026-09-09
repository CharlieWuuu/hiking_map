import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'hiker01@example.com' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: '5f1c…（信裡連結帶的 token）' })
  token: string;

  @ApiProperty({ example: 'newPassword123' })
  password: string;
}

export class SetEmailDto {
  @ApiProperty({ example: 'hiker01@example.com' })
  email: string;
}

export class AuthMethodsDto {
  @ApiPropertyOptional({ example: 'hiker01@example.com', nullable: true })
  email: string | null;

  @ApiProperty({ example: true, description: '是否設定過密碼' })
  has_password: boolean;

  @ApiProperty({ example: false, description: '是否綁定 Google' })
  has_google: boolean;
}
