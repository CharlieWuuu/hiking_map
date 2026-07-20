import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../auth/auth.entity';

@Entity('follows')
export class Follow {
  @ApiProperty({ example: 1 })
  @PrimaryColumn()
  follower_user_id: number;

  @ApiProperty({ example: 2 })
  @PrimaryColumn()
  following_user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'follower_user_id' })
  follower: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'following_user_id' })
  following: User;

  @ApiProperty({ example: '2026-07-20T10:00:00.000Z' })
  @CreateDateColumn()
  created_at: Date;
}
