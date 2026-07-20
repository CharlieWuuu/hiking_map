import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Mountain } from './mountain.entity';
import { Category } from '../hikes/hike-category.entity';

// mountain 與分類的多對多關聯：一座山可能同時是百岳又是小百岳（實務上少見，但結構上允許）
@Entity('mountain_category_map')
export class MountainCategoryMap {
  @PrimaryColumn()
  mountain_id: number;

  @PrimaryColumn()
  category_id: number;

  @ManyToOne(() => Mountain)
  @JoinColumn({ name: 'mountain_id' })
  mountain: Mountain;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
