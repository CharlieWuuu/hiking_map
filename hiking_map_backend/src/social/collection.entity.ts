import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../auth/auth.entity';

// 收藏對象可以是 trail 或 hike，用 item_type 區分，資料庫層不強制 FK（用途類似多型關聯）
@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar' })
  item_type: 'trail' | 'hike';

  @Column()
  item_id: number;

  @CreateDateColumn()
  created_at: Date;
}
