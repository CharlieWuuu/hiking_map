import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Hike } from './hike.entity';
import { HikeTrack } from './hike-track.entity';
import { HikeCategoryMap } from './hike-category-map.entity';
import { CreateHikeDto } from './dto/create-hike.dto';

@Injectable()
export class HikesService {
  constructor(
    @InjectRepository(Hike)
    private hikesRepo: Repository<Hike>,

    @InjectRepository(HikeTrack)
    private hikeTracksRepo: Repository<HikeTrack>,

    @InjectRepository(HikeCategoryMap)
    private hikeCategoryMapRepo: Repository<HikeCategoryMap>,

    private dataSource: DataSource,
  ) {}

  async create(userId: number, dto: CreateHikeDto) {
    const feature = dto.geojson.features[0];
    if (!feature) {
      throw new ForbiddenException('geojson 中沒有可用的軌跡');
    }

    return this.dataSource.transaction(async (manager) => {
      const hike = await manager.getRepository(Hike).save({
        user_id: userId,
        trail_id: dto.trail_id ?? null,
        name: dto.name,
        date: dto.date,
        distance_km: dto.distance_km,
        is_public: dto.is_public ?? true,
        note: dto.note ?? null,
      });

      await manager.query(
        `INSERT INTO hike_tracks (hike_id, geom)
         VALUES ($1, ST_SetSRID(ST_GeomFromGeoJSON($2), 4326))`,
        [hike.id, JSON.stringify(feature.geometry)],
      );

      if (dto.category_ids?.length) {
        await manager.getRepository(HikeCategoryMap).insert(
          dto.category_ids.map((category_id) => ({
            hike_id: hike.id,
            category_id,
          })),
        );
      }

      return hike;
    });
  }

  async findOne(id: number) {
    const hike = await this.hikesRepo.findOne({ where: { id } });
    if (!hike) throw new NotFoundException('找不到這筆健行紀錄');

    const track = await this.dataSource.query(
      `SELECT ST_AsGeoJSON(geom) AS geojson FROM hike_tracks WHERE hike_id = $1`,
      [id],
    );

    return {
      ...hike,
      geojson: track[0] ? JSON.parse(track[0].geojson) : null,
    };
  }

  async findAll(userId?: number) {
    const where = userId ? { user_id: userId } : {};
    return this.hikesRepo.find({
      where,
      order: { date: 'DESC' },
    });
  }

  async remove(id: number, userId: number) {
    const hike = await this.hikesRepo.findOne({ where: { id } });
    if (!hike) throw new NotFoundException('找不到這筆健行紀錄');
    if (hike.user_id !== userId) {
      throw new ForbiddenException('無法刪除他人的健行紀錄');
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(HikeCategoryMap).delete({ hike_id: id });
      await manager.getRepository(HikeTrack).delete({ hike_id: id });
      await manager.getRepository(Hike).delete(id);
    });
  }
}
