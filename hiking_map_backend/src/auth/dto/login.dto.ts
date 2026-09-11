import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'hiker01' })
  @IsString()
  @MinLength(1, { message: '請輸入帳號' })
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(1, { message: '請輸入密碼' })
  password: string;
}
