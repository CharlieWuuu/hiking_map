import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Trail } from './trail.entity';

// 官方步道路徑座標獨立存放，理由同 hike_tracks：查詢步道基本資訊時不需要一起載入大量座標點
@Entity('trail_geometries')
export class TrailGeometry {
  @PrimaryColumn()
  trail_id: number;

  @OneToOne(() => Trail)
  @JoinColumn({ name: 'trail_id' })
  trail: Trail;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'LineString',
    srid: 4326,
  })
  geom: object;
}
