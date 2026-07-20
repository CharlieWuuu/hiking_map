import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Hike } from './hike.entity';
import { Category } from './hike-category.entity';

// hike 與分類的多對多關聯：一筆 hike 可以同時屬於多個分類（例如同時是小百岳又是百大步道）
@Entity('hike_category_map')
export class HikeCategoryMap {
  @PrimaryColumn()
  hike_id: number;

  @PrimaryColumn()
  category_id: number;

  @ManyToOne(() => Hike)
  @JoinColumn({ name: 'hike_id' })
  hike: Hike;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
