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

  findAll() {
    return this.mountainsRepo.find({ order: { name: 'ASC' } });
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
