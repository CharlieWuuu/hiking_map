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

  async search(query: string): Promise<SearchResultDto[]> {
    const q = query.trim();
    if (!q) return [];

    const trailRows = await this.dataSource.query(
      `SELECT slug, name, county, town, cover_image_url,
              (name ILIKE $1) AS matches_name
       FROM trails
       WHERE name ILIKE $1 OR county ILIKE $1 OR town ILIKE $1 OR description ILIKE $1`,
      [`%${q}%`],
    );

    const userRows = await this.dataSource.query(
      `SELECT u.username, p.avatar, p.description,
              (u.username ILIKE $1) AS matches_name
       FROM users u
       JOIN profiles p ON p.user_id = u.id
       WHERE u.username ILIKE $1 OR p.description ILIKE $1`,
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

    const userResults: SearchResultDto[] = userRows.map((row: any) => ({
      type: 'user',
      slug: row.username,
      display_name: row.username,
      avatar: row.avatar,
      match_reason: row.matches_name ? 'name' : 'field',
    }));

    return [...trailResults, ...userResults].sort((a, b) =>
      a.match_reason === b.match_reason
        ? 0
        : a.match_reason === 'name'
          ? -1
          : 1,
    );
  }

  async filterTrails(
    categoryKey: string | null,
    county: string | null,
  ): Promise<SearchResultDto[]> {
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
