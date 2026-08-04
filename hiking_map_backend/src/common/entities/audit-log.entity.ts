import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  user_id: number | null;

  @Column()
  action: string;

  @Column({ type: 'varchar', nullable: true })
  target_type: string | null;

  @Column({ type: 'int', nullable: true })
  target_id: number | null;

  @Column({ type: 'varchar', nullable: true })
  ip_address: string | null;

  @Column({ type: 'varchar', nullable: true })
  user_agent: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn()
  created_at: Date;
}
