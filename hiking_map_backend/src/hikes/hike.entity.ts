import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../auth/auth.entity';
import { Trail } from '../trails/trail.entity';

@Entity('hikes')
export class Hike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 對應官方步道目錄的 trail，可為 null（例如自由行走、沒有對應官方步道）
  @Column({ type: 'int', nullable: true })
  trail_id: number | null;

  @ManyToOne(() => Trail, { nullable: true })
  @JoinColumn({ name: 'trail_id' })
  trail: Trail | null;

  @Column()
  name: string;

  @Column({ type: 'date' })
  date: string;

  @Column('double precision')
  distance_km: number;

  @Column({ default: true })
  is_public: boolean;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn()
  created_at: Date;
}
