import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../auth/auth.entity';

@Entity('follows')
export class Follow {
  @PrimaryColumn()
  follower_user_id: number;

  @PrimaryColumn()
  following_user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'follower_user_id' })
  follower: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'following_user_id' })
  following: User;

  @CreateDateColumn()
  created_at: Date;
}
