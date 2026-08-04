// src/auth/auth.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'hiker01' })
  @Column({ unique: true })
  username: string;

  // OAuth 使用者（google_id 有值）沒有密碼
  @Column({ type: 'varchar', nullable: true })
  password: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  google_id: string | null;
}
