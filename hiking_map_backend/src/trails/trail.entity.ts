import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('trails')
export class Trail {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '塔塔加登山口至排雲山莊' })
  @Column()
  name: string;

  @ApiProperty({ example: 'tataka-trailhead-to-paiyun-lodge' })
  @Column({ unique: true })
  slug: string;

  @ApiPropertyOptional({ example: '南投縣', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  county: string | null;

  @ApiPropertyOptional({ example: '信義鄉', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  town: string | null;

  @ApiPropertyOptional({ example: '玉山主線經典路線', nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiPropertyOptional({ example: 8.5, nullable: true })
  @Column('double precision', { nullable: true })
  distance_km: number | null;
}
