import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SearchResultDto } from './dto/search-result.dto';
import { PopularQueryDto } from './dto/popular-query.dto';
import { SearchQuery } from './search-query.entity';

// 前端用的分類 key -> categories.name
const CATEGORY_KEY_TO_NAME: Record<string, string> = {
  hundred: '百岳',
  smallHundred: '小百岳',
  hundredTrail: '百大必訪步道',
};

const POPULAR_QUERIES_LIMIT = 5;
const POPULAR_QUERIES_WINDOW_DAYS = 30;
const NEARBY_RESULTS_LIMIT = 10;

@Injectable()
export class SearchService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(SearchQuery)
    private searchQueriesRepo: Repository<SearchQuery>,
  ) {}

  async logQuery(query: string): Promise<void> {
    const q = query.trim();
    if (!q) return;
    await this.searchQueriesRepo.insert({ query: q });
  }

  async popularQueries(): Promise<PopularQueryDto[]> {
    const rows = await this.dataSource.query(
      `SELECT query, COUNT(*) AS count
       FROM search_queries
       WHERE created_at > now() - interval '${POPULAR_QUERIES_WINDOW_DAYS} days'
       GROUP BY query
       ORDER BY count DESC, MAX(created_at) DESC
       LIMIT ${POPULAR_QUERIES_LIMIT}`,
    );
    return rows.map((row: any) => ({ text: row.query }));
  }

  // userId 有值時（登入狀態）額外把搜尋範圍擴大到自己的健行紀錄，
  // 未登入則只搜官方步道——封閉系統下沒有「查別人紀錄」這回事，所以永遠只查 userId 自己
  async search(query: string, userId?: number): Promise<SearchResultDto[]> {
    const q = query.trim();
    if (!q) return [];

    const trailRows = await this.dataSource.query(
      `SELECT slug, name, county, town, cover_image_url,
              (name ILIKE $1) AS matches_name
       FROM trails
       WHERE name ILIKE $1 OR county ILIKE $1 OR town ILIKE $1 OR description ILIKE $1`,
      [`%${q}%`],
    );

    const trailResults: SearchResultDto[] = trailRows.map((row: any) => ({
      type: 'trail',
      slug: row.slug,
      display_name: row.name,
      county: row.county,
      town: row.town,
      cover_image_url: row.cover_image_url,
      match_reason: row.matches_name ? 'name' : 'field',
    }));

    let hikeResults: SearchResultDto[] = [];
    if (userId) {
      const hikeRows = await this.dataSource.query(
        `SELECT id, name, county, town, cover_image_url,
                (name ILIKE $1) AS matches_name
         FROM hikes
         WHERE user_id = $2 AND (name ILIKE $1 OR county ILIKE $1 OR town ILIKE $1 OR note ILIKE $1)`,
        [`%${q}%`, userId],
      );
      hikeResults = hikeRows.map((row: any) => ({
        type: 'hike',
        slug: String(row.id),
        display_name: row.name,
        county: row.county,
        town: row.town,
        cover_image_url: row.cover_image_url,
        match_reason: row.matches_name ? 'name' : 'field',
      }));
    }

    return [...hikeResults, ...trailResults].sort((a, b) =>
      a.match_reason === b.match_reason ? 0 : a.match_reason === 'name' ? -1 : 1,
    );
  }

  // 推薦單位是「路線」，一律用 trails + trail_geometries.center 算距離。
  // 百岳/小百岳/百大必訪步道都已補齊 trail_category_map，可以一起參與排序。
  async nearby(lat: number, lng: number): Promise<SearchResultDto[]> {
    if (Number.isNaN(lat) || Number.isNaN(lng)) return [];

    const trailRows = await this.dataSource.query(
      `SELECT DISTINCT ON (t.id) t.slug, t.name, t.county, t.town, t.cover_image_url, c.name AS category_name,
              ST_Distance(tg.center::geography, ST_MakePoint($1, $2)::geography) / 1000 AS distance_km
       FROM trails t
       JOIN trail_geometries tg ON tg.trail_id = t.id
       JOIN trail_category_map tcm ON tcm.trail_id = t.id
       JOIN categories c ON c.id = tcm.category_id
       WHERE tcm.category_id IN (1, 2, 3)
       ORDER BY t.id`,
      [lng, lat],
    );

    return trailRows
      .map((row: any) => ({
        type: 'trail' as const,
        slug: row.slug,
        display_name: row.name,
        county: row.county,
        town: row.town,
        cover_image_url: row.cover_image_url,
        match_reason: 'field' as const,
        distance_km: Number(row.distance_km),
        category_name: row.category_name,
      }))
      .sort((a: SearchResultDto, b: SearchResultDto) => (a.distance_km ?? 0) - (b.distance_km ?? 0))
      .slice(0, NEARBY_RESULTS_LIMIT);
  }

  async lastLocation(userId: number): Promise<{ lat: number; lng: number } | null> {
    const rows = await this.dataSource.query(
      `SELECT ST_Y(tg.center) AS lat, ST_X(tg.center) AS lng
       FROM hikes h
       JOIN trail_geometries tg ON tg.trail_id = h.trail_id
       WHERE h.user_id = $1
       ORDER BY h.date DESC, h.id DESC
       LIMIT 1`,
      [userId],
    );
    if (!rows.length) return null;
    return { lat: Number(rows[0].lat), lng: Number(rows[0].lng) };
  }

  async filterTrails(categoryKey: string | null, county: string | null): Promise<SearchResultDto[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (county) {
      params.push(county);
      conditions.push(`t.county = $${params.length}`);
    }

    if (categoryKey) {
      const categoryName = CATEGORY_KEY_TO_NAME[categoryKey];
      if (!categoryName) return [];
      params.push(categoryName);
      conditions.push(
        `t.id IN (SELECT tcm.trail_id FROM trail_category_map tcm JOIN categories c ON c.id = tcm.category_id WHERE c.name = $${params.length})`,
      );
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await this.dataSource.query(
      `SELECT slug, name, county, town, cover_image_url FROM trails t ${where} ORDER BY name`,
      params,
    );

    return rows.map((row: any) => ({
      type: 'trail',
      slug: row.slug,
      display_name: row.name,
      county: row.county,
      town: row.town,
      cover_image_url: row.cover_image_url,
      match_reason: 'field',
    }));
  }
}
