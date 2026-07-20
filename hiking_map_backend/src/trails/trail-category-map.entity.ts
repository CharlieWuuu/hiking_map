import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Trail } from './trail.entity';
import { Category } from '../hikes/hike-category.entity';

// trail 與分類的多對多關聯，共用 hikes 的 categories 清單
@Entity('trail_category_map')
export class TrailCategoryMap {
  @PrimaryColumn()
  trail_id: number;

  @PrimaryColumn()
  category_id: number;

  @ManyToOne(() => Trail)
  @JoinColumn({ name: 'trail_id' })
  trail: Trail;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
