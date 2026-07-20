import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Hike } from './hike.entity';

// GPS 座標路徑獨立存放，查詢 hike 基本資訊時不需要一起載入大量座標點
@Entity('hike_tracks')
export class HikeTrack {
  @PrimaryColumn()
  hike_id: number;

  @OneToOne(() => Hike)
  @JoinColumn({ name: 'hike_id' })
  hike: Hike;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'MultiLineString',
    srid: 4326,
  })
  geom: object;
}
