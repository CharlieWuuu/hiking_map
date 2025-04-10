import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'hiking_map' })
export class Trail {
  @PrimaryGeneratedColumn()
  gid: number;

  @Column('float', { nullable: true })
  id: number;

  @Column('float', { nullable: true })
  length: number;

  @Column('geometry', { spatialFeatureType: 'MultiLineString', srid: 4326 })
  geom: object;
}
