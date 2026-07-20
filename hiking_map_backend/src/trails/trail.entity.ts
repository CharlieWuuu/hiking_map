import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('trails')
export class Trail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column('double precision', { nullable: true })
  distance_km: number | null;
}
