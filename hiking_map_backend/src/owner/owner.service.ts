import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Owner } from './owner.entity';

@Injectable()
export class OwnerService {
  constructor(
    @InjectRepository(Owner)
    private usersRepo: Repository<Owner>,
  ) {}

  async getList() {
    return await this.usersRepo.query(
      `SELECT
          username AS name,
          null AS name_zh,
          avatar,
          level,
          uuid,
          'user' AS type,
          null AS description
        FROM users

        UNION ALL

        SELECT
          layername AS name,
          layername_zh AS name_zh,
          avatar,
          NULL AS level,
          uuid,
          'layer' AS type,
          description
        FROM layers;
        `,
    );
  }

  async getDetail(name: string, type: string): Promise<Owner | null> {
    let result = null;
    if (type === 'user') {
      result = await this.usersRepo.query(
        `SELECT username AS name, level, avatar, uuid FROM users ${name ? `WHERE username = '${name}'` : ''}`,
      );
    }

    if (type === 'layer') {
      result = await this.usersRepo.query(
        `SELECT layername AS name, layername_zh AS name_zh, avatar, uuid, description FROM layers ${name ? `WHERE layername = '${name}'` : ''}`,
      );
    }
    return result;
  }
}
