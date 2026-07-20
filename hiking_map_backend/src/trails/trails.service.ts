import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Trail } from './trail.entity';

@Injectable()
export class TrailsService {
  constructor(
    @InjectRepository(Trail)
    private trailsRepo: Repository<Trail>,

    private dataSource: DataSource,
  ) {}

  findAll() {
    return this.trailsRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const trail = await this.trailsRepo.findOne({ where: { id } });
    if (!trail) throw new NotFoundException('找不到這條步道');

    const geometry = await this.dataSource.query(
      `SELECT ST_AsGeoJSON(geom) AS geojson FROM trail_geometries WHERE trail_id = $1`,
      [id],
    );

    return {
      ...trail,
      geojson: geometry[0] ? JSON.parse(geometry[0].geojson) : null,
    };
  }
}
