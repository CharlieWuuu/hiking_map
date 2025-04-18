// hiking-map.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'upload' })
export class Upload {
  @PrimaryGeneratedColumn()
  gid: number;

  @Column({ type: 'float8', nullable: true })
  id: number;

  @Column({ type: 'float8', nullable: true })
  length: number;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'MultiLineString',
    srid: 4326,
  })
  geom: any;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  center: any;

  @Column({ type: 'geometry', spatialFeatureType: 'Polygon', srid: 4326 })
  bounds: any;
}
