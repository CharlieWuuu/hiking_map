import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Hike } from './hike.entity';
import { HikeTrack } from './hike-track.entity';
import { HikeCategoryMap } from './hike-category-map.entity';
import { CreateHikeDto } from './dto/create-hike.dto';
import { HikeStatsDto } from './dto/hike-stats.dto';

// categories.name -> 前端使用的 achievements 欄位名稱
const CATEGORY_NAME_TO_ACHIEVEMENT_KEY: Record<string, 'hundred' | 'small_hundred' | 'hundred_trail'> = {
  百岳: 'hundred',
  小百岳: 'small_hundred',
  百大必訪步道: 'hundred_trail',
};

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
        county: dto.county ?? null,
        town: dto.town ?? null,
        date: dto.date,
        distance_km: dto.distance_km,
        is_public: dto.is_public ?? true,
        note: dto.note ?? null,
        urls: dto.urls ?? [],
        cover_image_url: dto.cover_image_url ?? null,
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

  async findAll(userId?: number, includeGeojson = false) {
    const where = userId ? { user_id: userId } : {};
    const hikes = await this.hikesRepo.find({
      where,
      order: { date: 'DESC' },
    });
    if (hikes.length === 0) return [];

    const categoryRows = await this.dataSource.query(
      `SELECT h.id AS hike_id, c.name AS category_name
       FROM hikes h
       JOIN trail_category_map tcm ON tcm.trail_id = h.trail_id
       JOIN categories c ON c.id = tcm.category_id
       WHERE h.id = ANY($1)`,
      [hikes.map((hike) => hike.id)],
    );

    const categoryKeysByHikeId = new Map<number, Set<string>>();
    for (const row of categoryRows) {
      const key = CATEGORY_NAME_TO_ACHIEVEMENT_KEY[row.category_name];
      if (!key) continue;
      if (!categoryKeysByHikeId.has(row.hike_id)) categoryKeysByHikeId.set(row.hike_id, new Set());
      categoryKeysByHikeId.get(row.hike_id)!.add(key);
    }

    const geojsonByHikeId = new Map<number, object>();
    if (includeGeojson) {
      const trackRows = await this.dataSource.query(
        `SELECT hike_id, ST_AsGeoJSON(geom) AS geojson FROM hike_tracks WHERE hike_id = ANY($1)`,
        [hikes.map((hike) => hike.id)],
      );
      for (const row of trackRows) {
        geojsonByHikeId.set(row.hike_id, JSON.parse(row.geojson));
      }
    }

    return hikes.map((hike) => {
      const keys = categoryKeysByHikeId.get(hike.id) ?? new Set();
      return {
        ...hike,
        is_hundred: keys.has('hundred'),
        is_small_hundred: keys.has('small_hundred'),
        is_hundred_trail: keys.has('hundred_trail'),
        ...(includeGeojson ? { geojson: geojsonByHikeId.get(hike.id) ?? null } : {}),
      };
    });
  }

  async getStats(userId: number): Promise<HikeStatsDto> {
    const totals = await this.dataSource.query(
      `SELECT COALESCE(SUM(distance_km), 0) AS total_distance_km, COUNT(*) AS hike_count
       FROM hikes WHERE user_id = $1`,
      [userId],
    );

    const monthlyDistance = await this.dataSource.query(
      `SELECT TO_CHAR(date, 'YYYY-MM') AS month, SUM(distance_km) AS distance_km
       FROM hikes WHERE user_id = $1
       GROUP BY month ORDER BY month`,
      [userId],
    );

    const countyStats = await this.dataSource.query(
      `SELECT county, COUNT(*) AS count
       FROM hikes WHERE user_id = $1 AND county IS NOT NULL
       GROUP BY county ORDER BY count DESC`,
      [userId],
    );

    const achievementRows = await this.dataSource.query(
      `SELECT c.name AS category_name, COUNT(DISTINCT h.trail_id) AS count
       FROM hikes h
       JOIN trail_category_map tcm ON tcm.trail_id = h.trail_id
       JOIN categories c ON c.id = tcm.category_id
       WHERE h.user_id = $1 AND h.trail_id IS NOT NULL
       GROUP BY c.name`,
      [userId],
    );

    const achievements = { hundred: 0, small_hundred: 0, hundred_trail: 0 };
    for (const row of achievementRows) {
      const key = CATEGORY_NAME_TO_ACHIEVEMENT_KEY[row.category_name];
      if (key) achievements[key] = Number(row.count);
    }

    return {
      total_distance_km: Number(totals[0].total_distance_km),
      hike_count: Number(totals[0].hike_count),
      achievements,
      monthly_distance: monthlyDistance.map((row: { month: string; distance_km: string }) => ({
        month: row.month,
        distance_km: Number(row.distance_km),
      })),
      county_stats: countyStats.map((row: { county: string; count: string }) => ({
        county: row.county,
        count: Number(row.count),
      })),
    };
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
