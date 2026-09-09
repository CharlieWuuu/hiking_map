import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './auth.entity';

// 只存雜湊，明碼的 token 只在寄出的信裡出現過一次。
// 跟密碼同樣的道理：資料庫被看到也不能直接拿去重設別人的密碼。
@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  token_hash: string;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  // 用過就記下時間，同一條連結不能重複使用
  @Column({ type: 'timestamptz', nullable: true })
  used_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
