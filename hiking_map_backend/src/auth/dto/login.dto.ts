// src/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'hiker01' })
  username: string;

  @ApiProperty({ example: 'password123' })
  password: string;
}
