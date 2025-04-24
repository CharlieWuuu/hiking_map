// src/logs/users-log.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users_log')
export class UsersLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  login_time: Date;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ nullable: true })
  user_agent: string;
}
