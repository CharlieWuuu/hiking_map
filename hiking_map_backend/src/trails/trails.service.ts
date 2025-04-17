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
      SELECT
        hiking_map.id,
        hiking_map.length,
        ST_AsGeoJSON(hiking_map.geom) AS geometry,
        ST_AsGeoJSON(hiking_map.center) AS center,
        ST_AsGeoJSON(hiking_map.bounds) AS bounds,
        hiking_map_info.name,
        hiking_map_info.county,
        hiking_map_info.town,
        hiking_map_info.time ,
        hiking_map_info.url,
        hiking_map_info.note
      FROM hiking_map
      JOIN hiking_map_info
        ON hiking_map.id = hiking_map_info.id
      ORDER BY hiking_map.id ASC;
    `);

    return {
      type: 'FeatureCollection',
      features: rows.map((row) => ({
        type: 'Feature',
        geometry: JSON.parse(row.geometry),
        properties: {
          id: row.id,
          length: row.length,
          center: [
            JSON.parse(row.center).coordinates[0],
            JSON.parse(row.center).coordinates[1],
          ],
          bounds: JSON.parse(row.bounds).coordinates[0],
          name: row.name,
          county: row.county,
          town: row.town,
          time: row.time,
          url: row.url !== null ? row.url.split('|') : null,
          note: row.note,
        },
      })),
    };
  }
}
