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

  async findOne(slug: string) {
    const trail = await this.trailsRepo.findOne({ where: { slug } });
    if (!trail) throw new NotFoundException('找不到這條步道');

    // trails.distance_km 是選填欄位，早期匯入的路線（如百岳資料夾的 GPX）沒有填。
    // 缺值時改用 geom 實際算長度，而不是把 0 顯示給使用者看
    const geometry = await this.dataSource.query(
      `SELECT ST_AsGeoJSON(geom) AS geojson, ST_Length(geom::geography) / 1000 AS computed_distance_km
       FROM trail_geometries WHERE trail_id = $1`,
      [trail.id],
    );

    const categories = await this.dataSource.query(
      `SELECT c.name FROM trail_category_map tcm JOIN categories c ON c.id = tcm.category_id WHERE tcm.trail_id = $1 ORDER BY c.id`,
      [trail.id],
    );

    return {
      ...trail,
      distance_km: trail.distance_km ?? (geometry[0] ? Number(geometry[0].computed_distance_km) : null),
      geojson: geometry[0] ? JSON.parse(geometry[0].geojson) : null,
      category_names: categories.map((c: { name: string }) => c.name),
    };
  }
}
