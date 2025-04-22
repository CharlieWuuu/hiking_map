// src/trails/dto/update-properties.dto.ts
import { IsObject } from 'class-validator';

export class UpdatePropertiesDto {
  @IsObject()
  properties: Record<string, any>;
}
