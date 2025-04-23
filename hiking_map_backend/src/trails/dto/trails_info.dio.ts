// src/trails/dto/update-properties.dto.ts
import { IsObject, IsOptional } from 'class-validator';

export class TrailsInfoDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  county?: string;

  @IsOptional()
  town?: string;

  @IsOptional()
  time?: string;

  @IsOptional()
  url?: string;

  @IsOptional()
  note?: string;

  @IsOptional()
  public?: boolean;
}
