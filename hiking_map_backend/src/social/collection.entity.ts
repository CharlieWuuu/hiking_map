import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../auth/auth.entity';

// 收藏對象可以是 trail 或 hike，用 item_type 區分，資料庫層不強制 FK（用途類似多型關聯）
@Entity('collections')
export class Collection {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1 })
  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ example: 'trail', enum: ['trail', 'hike'] })
  @Column({ type: 'varchar' })
  item_type: 'trail' | 'hike';

  @ApiProperty({ example: 1 })
  @Column()
  item_id: number;

  @ApiProperty({ example: '2026-07-20T10:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;
}
