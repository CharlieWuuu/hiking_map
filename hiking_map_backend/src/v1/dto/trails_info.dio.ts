// src/trails/dto/update-properties.dto.ts
import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TrailsInfoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  county?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  town?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  time?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  note?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  public?: boolean;
}
