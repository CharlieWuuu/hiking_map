import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'hiker01' })
  username: string;

  @ApiProperty({ example: 'password123' })
  password: string;

  // 選填。沒有 email 就沒辦法用忘記密碼，只能靠綁定的 Google 進來
  @ApiPropertyOptional({ example: 'hiker01@example.com' })
  email?: string;
}
