import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trail } from './trail.entity';

@Injectable()
export class TrailsService {
  constructor(
    @InjectRepository(Trail)
    private readonly trailRepo: Repository<Trail>,
  ) {}

  async findAllGeoJSON() {
    const rows = await this.trailRepo.query(`
        SELECT id, length, ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geometry
        FROM hiking_map
        LIMIT 1
    `);

    return {
      type: 'FeatureCollection',
      features: rows.map((row) => ({
        type: 'Feature',
        geometry: JSON.parse(row.geometry),
        properties: {
          id: row.id,
          length: row.length,
        },
      })),
    };
  }
}
