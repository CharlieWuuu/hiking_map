// src/users/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ unique: true })
  uuid: string;
}

@Entity('users_log')
export class UsersLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  login_time: Date;

  @Column()
  ip_address: string;

  @Column()
  user_agent: string;

  @Column()
  uuid: string;
}
