import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Mountain } from './mountain.entity';

@Injectable()
export class MountainsService {
  constructor(
    @InjectRepository(Mountain)
    private mountainsRepo: Repository<Mountain>,

    private dataSource: DataSource,
  ) {}

  // 前端登頂紀錄選單要在山名旁標出百岳/小百岳，一次把所有山的分類撈出來 join 回去，
  // 避免每座山各打一次查詢
  async findAll() {
    const mountains = await this.mountainsRepo.find({ order: { name: 'ASC' } });

    const categoryRows: { mountain_id: number; name: string }[] = await this.dataSource.query(
      `SELECT mcm.mountain_id, c.name
       FROM mountain_category_map mcm
       JOIN categories c ON c.id = mcm.category_id`,
    );
    const categoriesByMountainId = new Map<number, string[]>();
    for (const row of categoryRows) {
      if (!categoriesByMountainId.has(row.mountain_id)) categoriesByMountainId.set(row.mountain_id, []);
      categoriesByMountainId.get(row.mountain_id)!.push(row.name);
    }

    return mountains.map((mountain) => ({
      ...mountain,
      categories: categoriesByMountainId.get(mountain.id) ?? [],
    }));
  }

  async findOne(id: number) {
    const mountain = await this.mountainsRepo.findOne({ where: { id } });
    if (!mountain) throw new NotFoundException('找不到這座山');

    const location = await this.dataSource.query(
      `SELECT ST_AsGeoJSON(location) AS geojson FROM mountains WHERE id = $1`,
      [id],
    );

    return {
      ...mountain,
      geojson: location[0] ? JSON.parse(location[0].geojson) : null,
    };
  }
}
