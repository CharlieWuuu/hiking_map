import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('mountains')
export class Mountain {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '玉山主峰' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ example: 3952 })
  @Column('double precision')
  elevation_m: number;

  @ApiProperty({
    example: { type: 'Point', coordinates: [120.9576, 23.4707] },
  })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: object;

  @ApiPropertyOptional({ example: '中央山脈', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  range: string | null;

  @ApiPropertyOptional({ example: '南投縣', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  county: string | null;
}
