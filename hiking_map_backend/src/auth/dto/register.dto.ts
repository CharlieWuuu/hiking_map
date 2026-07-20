import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'hiker01' })
  username: string;

  @ApiProperty({ example: 'password123' })
  password: string;
}
