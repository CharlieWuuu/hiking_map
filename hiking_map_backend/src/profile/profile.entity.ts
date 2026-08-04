import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../auth/auth.entity';

@Entity('profiles')
export class Profile {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1 })
  @Column({ unique: true })
  user_id: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ example: 'https://example.com/avatar.png' })
  @Column()
  avatar: string;

  @ApiProperty({ example: '中級' })
  @Column()
  level: string;

  @ApiProperty({ example: '喜歡爬百岳的登山愛好者' })
  @Column()
  description: string;
}
