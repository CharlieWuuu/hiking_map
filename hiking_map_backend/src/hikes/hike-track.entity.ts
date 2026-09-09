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

  // 真實來源。API 不會把它整包送給前端，只用來重新產生簡化線與編輯軌跡
  @Column({
    type: 'geometry',
    spatialFeatureType: 'MultiLineString',
    srid: 4326,
  })
  geom: object;

  // 一般縮放層級畫的線，容差約 45 公尺，點數通常是原始的一到兩成
  @Column({
    type: 'geometry',
    spatialFeatureType: 'MultiLineString',
    srid: 4326,
    nullable: true,
  })
  geom_simplified: object | null;

  // 完整軌跡在 R2 的網址，高縮放與匯出時由瀏覽器直接抓
  @Column({ type: 'varchar', nullable: true })
  track_url: string | null;

  @Column({ type: 'int', nullable: true })
  point_count: number | null;

  // 以下兩欄是 generated column，由資料庫從 geom 自動維護，寫入時不要指定
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    insert: false,
    update: false,
  })
  center: object;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
    insert: false,
    update: false,
  })
  bbox: object;
}
