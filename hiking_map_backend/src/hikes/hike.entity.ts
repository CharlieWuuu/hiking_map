import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../auth/auth.entity';
import { Trail } from '../trails/trail.entity';

@Entity('hikes')
export class Hike {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1 })
  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 對應官方步道目錄的 trail，可為 null（例如自由行走、沒有對應官方步道）
  @ApiPropertyOptional({ example: 1, nullable: true })
  @Column({ type: 'int', nullable: true })
  trail_id: number | null;

  @ManyToOne(() => Trail, { nullable: true })
  @JoinColumn({ name: 'trail_id' })
  trail: Trail | null;

  @ApiProperty({ example: '合歡山主峰步道' })
  @Column()
  name: string;

  @ApiPropertyOptional({ example: '南投縣', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  county: string | null;

  @ApiPropertyOptional({ example: '仁愛鄉', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  town: string | null;

  @ApiProperty({ example: '2026-07-20' })
  @Column({ type: 'date' })
  date: string;

  @ApiProperty({ example: 5.2 })
  @Column('double precision')
  distance_km: number;

  @ApiProperty({ example: true })
  @Column({ default: true })
  is_public: boolean;

  @ApiPropertyOptional({ example: '天氣很好，view 很棒', nullable: true })
  @Column({ type: 'text', nullable: true })
  note: string | null;

  @ApiPropertyOptional({ example: ['https://example.com/track.gpx'], type: [String] })
  @Column({ type: 'varchar', array: true, default: () => "'{}'" })
  urls: string[];

  @ApiProperty({ example: '2026-07-20T10:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;
}
