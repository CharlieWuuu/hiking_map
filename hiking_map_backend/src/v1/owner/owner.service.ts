import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Owner } from './owner.entity';

@Injectable()
export class V1OwnerService {
  constructor(
    @InjectRepository(Owner)
    private usersRepo: Repository<Owner>,
  ) {}

  async getList() {
    return await this.usersRepo.query(
      `SELECT
          u.username AS name,
          null AS name_zh,
          COALESCE(p.avatar, '') AS avatar,
          '' AS level,
          u.uuid::text AS uuid,
          'user' AS type,
          COALESCE(p.description, '') AS description
        FROM users u
        LEFT JOIN profiles p ON p.user_id = u.id

        UNION ALL

        SELECT
          layername AS name,
          layername_zh AS name_zh,
          avatar,
          '' AS level,
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
        `SELECT u.username AS name, '' AS level, COALESCE(p.avatar, '') AS avatar, u.uuid::text AS uuid
         FROM users u LEFT JOIN profiles p ON p.user_id = u.id ${name ? `WHERE u.username = '${name}'` : ''}`,
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
