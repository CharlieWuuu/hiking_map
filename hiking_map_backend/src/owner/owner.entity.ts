// src/users/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Owner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  name_zh: string;

  @Column()
  avatar: string;

  @Column()
  level: string;

  @Column()
  uuid: string;

  @Column()
  description: string;
}
