import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Trail } from './trail.entity';
import { Mountain } from '../mountains/mountain.entity';

// trail 與 mountain 的多對多關聯：一條步道可能連走多座山（例如奇萊連峰縱走）
@Entity('trail_mountains')
export class TrailMountainMap {
  @PrimaryColumn()
  trail_id: number;

  @PrimaryColumn()
  mountain_id: number;

  @ManyToOne(() => Trail)
  @JoinColumn({ name: 'trail_id' })
  trail: Trail;

  @ManyToOne(() => Mountain)
  @JoinColumn({ name: 'mountain_id' })
  mountain: Mountain;
}
