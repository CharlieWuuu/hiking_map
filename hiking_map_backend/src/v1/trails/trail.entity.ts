import { Entity, Column, PrimaryColumn } from 'typeorm';
import { Geometry } from 'geojson';

@Entity()
export class Trail {
  @PrimaryColumn('uuid')
  uuid: string;

  @Column('text')
  name: string;

  @Column('double precision')
  length: number;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'MultiLineString',
    srid: 4326,
  })
  geom: object;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  center: object;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
  })
  bounds: object;

  @Column('text')
  owner_uuid: string;
}

@Entity()
export class TrailInfo {
  @PrimaryColumn('uuid')
  uuid: string;

  @Column('text')
  name: string;

  @Column('text')
  county: string;

  @Column('text')
  town: string;

  @Column({ type: 'timestamptz' }) // 等同 TIMESTAMP WITH TIME ZONE
  time: Date;

  @Column('double precision')
  length: number;

  @Column('text')
  url: string;

  @Column('text')
  note: string;

  @Column('boolean')
  public: boolean;

  @Column('varchar')
  hundred_id: string;

  @Column('varchar')
  small_hundred_id: string;

  @Column('varchar')
  hundred_trail_id: string;
}
