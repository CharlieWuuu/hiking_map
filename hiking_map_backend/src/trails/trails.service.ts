import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trail } from './trail.entity';
import {
  convertGpxToGeojson,
  convertShpToGeojson,
  convertGeojsonToCsv,
  convertGeojsonToGpx,
} from './utils/covert.utils';
import { TrailsInfoDto } from './dto/trails_info.dio';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid'; // 如果你使用 UUID
import { Response } from 'express';
import { FeatureCollection } from 'geojson';

@Injectable()
export class TrailsService {
  constructor(
    @InjectRepository(Trail)
    private readonly trailRepo: Repository<Trail>,
  ) {}

  async getTrails(
    isLogin: boolean,
    ownerUuid: string,
    type: string,
    uuid?: string,
  ) {
    let rows: any;
    if (type === 'user') {
      const whereClauses = ['users_trails.owner_uuid = $1'];
      const params: any[] = [ownerUuid];

      if (!isLogin) {
        whereClauses.push('users_trails_info.public = true');
      }

      if (uuid) {
        whereClauses.push('users_trails.uuid = $2');
        params.push(uuid);
      }

      const where = whereClauses.join(' AND ');

      const sql = `
      SELECT
        users_trails.uuid,
        ROW_NUMBER() OVER (ORDER BY users_trails_info.time ASC) AS id,
        users_trails.length,
        ST_AsGeoJSON(users_trails.geom) AS geometry,
        ST_AsGeoJSON(users_trails.center) AS center,
        ST_AsGeoJSON(users_trails.bounds) AS bounds,
        users_trails_info.name,
        users_trails_info.county,
        users_trails_info.town,
        users_trails_info.time,
        users_trails_info.url,
        users_trails_info.note,
        users_trails_info.public,
        users_trails_info.hundred_id,
        users_trails_info.small_hundred_id,
        users_trails_info.hundred_trail_id,
        users_trails.name AS filename
      FROM users_trails
      JOIN users_trails_info
        ON users_trails.uuid = users_trails_info.uuid
      WHERE ${where}
      ORDER BY users_trails_info.time ASC;
    `;
      rows = await this.trailRepo.query(sql, params);
      console.log(where);
    } else if (type === 'layer') {
      const whereClauses = ['layers_trails.owner_uuid = $1'];
      const params: any[] = [ownerUuid];

      if (uuid) {
        whereClauses.push('layers_trails.id = $2');
        params.push(uuid);
      }

      const where = whereClauses.join(' AND ');

      const sql = `
      SELECT
        layers_trails.id AS uuid,
        ROW_NUMBER() OVER (ORDER BY layers_trails_info.time ASC) AS id,
        layers_trails.length,
        ST_AsGeoJSON(layers_trails.geom) AS geometry,
        ST_AsGeoJSON(layers_trails.center) AS center,
        ST_AsGeoJSON(layers_trails.bounds) AS bounds,
        layers_trails_info.name,
        layers_trails_info.county,
        layers_trails_info.town,
        layers_trails_info.time,
        layers_trails_info.url,
        layers_trails_info.note,
        layers_trails_info.public,
        layers_trails.name AS filename
      FROM layers_trails
      JOIN layers_trails_info
        ON layers_trails.id = layers_trails_info.id
      WHERE ${where}
      ORDER BY layers_trails_info.time ASC;
    `;

      rows = await this.trailRepo.query(sql, params);
    }

    const geojson: FeatureCollection = {
      type: 'FeatureCollection',
      features: rows.map((row) => ({
        type: 'Feature',
        geometry: JSON.parse(row.geometry),
        properties: {
          uuid: row.uuid,
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
          public: row.public,
          filename: row.filename,
          hundred_id: row.hundred_id,
          small_hundred_id: row.small_hundred_id,
          hundred_trail_id: row.hundred_trail_id,
        },
      })),
    };

    geojson.features.reverse(); // 反轉順序

    return geojson;
  }

  async getCountyOrder(owner_uuid: string, type: string) {
    let rows: any;
    if (type === 'user') {
      rows = await this.trailRepo.query(
        `
      SELECT
        County,
        COUNT(users_trails_info.county) as county_count
      from users_trails
      JOIN users_trails_info
        ON users_trails.uuid = users_trails_info.uuid
      WHERE users_trails.owner_uuid = $1
      GROUP BY users_trails_info.county
      ORDER BY county_count DESC
      LIMIT 6;
      `,
        [owner_uuid],
      );
    }
    return rows;
  }

  async getTrailsMonthData(owner_uuid: string, type: string) {
    let rows: any;
    console.log(owner_uuid);
    if (type === 'user') {
      rows = await this.trailRepo.query(
        `
        WITH date_range AS (
          SELECT
            DATE_TRUNC('month', MIN(users_trails_info.time)) AS start_month,
            DATE_TRUNC('month', CURRENT_DATE) AS end_month
          FROM users_trails_info
          JOIN users_trails ON users_trails.uuid = users_trails_info.uuid
          WHERE users_trails.owner_uuid = $1
        ),
        months AS (
          SELECT generate_series(start_month, end_month, interval '1 month') AS month
          FROM date_range
        ),
        monthly_sum AS (
          SELECT
            DATE_TRUNC('month', users_trails_info.time) AS month,
            SUM(users_trails.length) AS total_distance_km
          FROM users_trails
          JOIN users_trails_info ON users_trails.uuid = users_trails_info.uuid
          WHERE users_trails.owner_uuid = $1
          GROUP BY DATE_TRUNC('month', users_trails_info.time)
        )
        SELECT
          TO_CHAR(m.month, 'YYYY/MM') AS month,
          ROUND(COALESCE(ms.total_distance_km, 0)::numeric, 2) AS total_distance_km
        FROM months m
        LEFT JOIN monthly_sum ms ON m.month = ms.month
        ORDER BY m.month ASC;
      `,
        [owner_uuid],
      );
    }
    return rows;
  }

  async post(owner_uuid: string, file: Express.Multer.File) {
    console.log(owner_uuid);
    const ext = path.extname(file.originalname).toLowerCase();
    let geojson;

    if (ext === '.geojson' || ext === '.json') {
      geojson = JSON.parse(file.buffer.toString());
    } else if (ext === '.zip') {
      geojson = await convertShpToGeojson(file);
    } else if (ext === '.gpx') {
      geojson = await convertGpxToGeojson(file);
    } else {
      throw new Error('不支援的檔案格式');
    }

    // 寫入資料庫
    for (const feature of geojson.features) {
      if (
        feature.geometry.type === 'LineString' ||
        feature.geometry.type === 'MultiLineString'
      ) {
        const geomJSON = JSON.stringify(feature.geometry);

        // 1. 去除副檔名
        const nameNoExt = Buffer.from(
          path.basename(file.originalname, path.extname(file.originalname)),
          'binary',
        ).toString('utf-8');

        // 2. 中文不要亂碼：通常 multer 已經是 UTF-8，如果還有亂碼，可能是編碼問題，但你可以明確轉換成 UTF-8 試試
        const name = Buffer.from(file.originalname, 'binary').toString('utf-8');
        const uuid = uuidv4(); // 每一筆新資料產生一個 uuid

        // 1. 新增 trails
        await this.trailRepo.query(
          `
        INSERT INTO users_trails (uuid, geom, length, center, bounds, name, owner_uuid)
        VALUES (
          $1,
          ST_Force2D(ST_GeomFromGeoJSON($2)),
          ROUND(
            ST_Length(ST_Transform(ST_Force2D(ST_GeomFromGeoJSON($2)), 3826))::numeric / 1000,
            3
          ),
          ST_Centroid(ST_Force2D(ST_GeomFromGeoJSON($2))),
          ST_Envelope(ST_Force2D(ST_GeomFromGeoJSON($2))),
          $3,
          $4
        )

        `,
          [uuid, geomJSON, name, owner_uuid],
        );

        // 2. 同時新增 trails_info，只填 uuid 與 name
        await this.trailRepo.query(
          `
        INSERT INTO users_trails_info (uuid, name, time)
        VALUES ($1, $2, CURRENT_DATE::timestamp)
        `,
          [uuid, nameNoExt],
        );
      }
    }

    return {
      success: true,
      savedCount: geojson.features.length,
    };
  }

  async put(uuid: string, owner_uuid: string, file: Express.Multer.File) {
    console.log(owner_uuid);
    const ext = path.extname(file.originalname).toLowerCase();
    let geojson;

    if (ext === '.geojson' || ext === '.json') {
      geojson = JSON.parse(file.buffer.toString());
    } else if (ext === '.zip') {
      geojson = await convertShpToGeojson(file);
    } else if (ext === '.gpx') {
      geojson = await convertGpxToGeojson(file);
    } else {
      throw new Error('不支援的檔案格式');
    }

    // 寫入資料庫
    for (const feature of geojson.features) {
      const geomJSON = JSON.stringify(feature.geometry);

      // 中文不要亂碼：通常 multer 已經是 UTF-8，如果還有亂碼，可能是編碼問題，但你可以明確轉換成 UTF-8 試試
      const name = Buffer.from(file.originalname, 'binary').toString('utf-8');

      // 更新 trails（空間資料）
      await this.trailRepo.query(
        `
        UPDATE users_trails
        SET
          geom = ST_Force2D(ST_GeomFromGeoJSON($1)),
          length = ROUND(
            ST_Length(ST_Transform(ST_Force2D(ST_GeomFromGeoJSON($1)), 3826))::numeric / 1000,
            3
          ),
          center = ST_Centroid(ST_Force2D(ST_GeomFromGeoJSON($1))),
          bounds = ST_Envelope(ST_Force2D(ST_GeomFromGeoJSON($1))),
          name = $2,
          owner_uuid = $3
        WHERE uuid = $4
        `,
        [geomJSON, name, owner_uuid, uuid],
      );
    }

    return {
      success: true,
      savedCount: geojson.features.length,
    };
  }

  async delete(uuid: string) {
    await this.trailRepo.query(
      `DELETE from users_trails_info WHERE uuid = $1`,
      [uuid],
    );
    await this.trailRepo.query(`DELETE from users_trails WHERE uuid = $1`, [
      uuid,
    ]);
    return { success: true, message: `資料 uuid=${uuid} 已刪除` };
  }

  async patch(uuid: string, dto: TrailsInfoDto) {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;

    for (const [key, originalValue] of Object.entries(dto)) {
      if (originalValue !== undefined) {
        let value = originalValue;

        if (key === 'url' && Array.isArray(value)) {
          value = value.join('|');
        }

        fields.push(`${key} = $${i}`);
        values.push(value);
        i++;
      }
    }

    if (fields.length === 0) {
      return { success: false, message: '未提供任何欄位' };
    }

    values.push(uuid);
    const sql = `UPDATE users_trails_info SET ${fields.join(', ')} WHERE uuid = $${i}`;
    await this.trailRepo.query(sql, values);

    return { success: true, message: `uuid=${uuid} 資料已更新` };
  }

  async getExport(
    res: Response,
    type: string,
    isLogin: boolean,
    owner_uuid: string,
  ) {
    const geojson: FeatureCollection = await this.getTrails(
      isLogin,
      owner_uuid,
      type,
    );

    if (type === 'geojson') {
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="trails.geojson"',
      );
      return res.json(geojson);
    }

    if (type === 'csv') {
      const csv = convertGeojsonToCsv(geojson);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="trails.csv"');
      return res.send(csv);
    }

    if (type === 'gpx') {
      const gpx = await convertGeojsonToGpx(geojson); // 用 to-gpx 套件
      res.setHeader('Content-Disposition', 'attachment; filename="trails.gpx"');
      res.setHeader('Content-Type', 'application/gpx+xml');
      return res.send(gpx);
    }

    throw new BadRequestException('不支援的格式');
  }
}
