import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('mountains')
export class Mountain {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column('double precision')
  elevation_m: number;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: object;

  @Column({ type: 'varchar', nullable: true })
  range: string | null;

  @Column({ type: 'varchar', nullable: true })
  county: string | null;
}
