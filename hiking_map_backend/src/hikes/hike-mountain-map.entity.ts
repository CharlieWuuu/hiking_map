import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Hike } from './hike.entity';
import { Mountain } from '../mountains/mountain.entity';

// hike 與 mountain 的多對多關聯：使用者手動標記這趟紀錄完成了哪些山頭，
// 不透過 trail_id 推導（前端上傳/編輯目前沒有選步道的入口，這條路線索性放棄）
@Entity('hike_mountains')
export class HikeMountainMap {
  @PrimaryColumn()
  hike_id: number;

  @PrimaryColumn()
  mountain_id: number;

  @ManyToOne(() => Hike)
  @JoinColumn({ name: 'hike_id' })
  hike: Hike;

  @ManyToOne(() => Mountain)
  @JoinColumn({ name: 'mountain_id' })
  mountain: Mountain;
}
