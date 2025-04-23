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

  async getTrails() {
    const rows = await this.trailRepo.query(`
      SELECT
        trails.uuid,
        ROW_NUMBER() OVER (ORDER BY trails_info.time ASC) AS id,
        trails.length,
        ST_AsGeoJSON(trails.geom) AS geometry,
        ST_AsGeoJSON(trails.center) AS center,
        ST_AsGeoJSON(trails.bounds) AS bounds,
        trails_info.name,
        trails_info.county,
        trails_info.town,
        trails_info.time ,
        trails_info.url,
        trails_info.note,
        trails_info.public,
        trails.name AS filename
      FROM trails
      JOIN trails_info
        ON trails.uuid = trails_info.uuid
      ORDER BY trails_info.time ASC;
    `);

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
        },
      })),
    };

    geojson.features.reverse(); // 反轉順序

    return geojson;
  }
  async post(file: Express.Multer.File) {
    console.log(file);
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
    console.log(geojson);
    // 寫入資料庫
    for (const feature of geojson.features) {
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
        INSERT INTO trails (uuid, geom, length, center, bounds, name)
        VALUES (
          $1,
          ST_Force2D(ST_GeomFromGeoJSON($2)),
          ROUND(
            ST_Length(ST_Transform(ST_Force2D(ST_GeomFromGeoJSON($2)), 3826))::numeric / 1000,
            3
          ),
          ST_Centroid(ST_Force2D(ST_GeomFromGeoJSON($2))),
          ST_Envelope(ST_Force2D(ST_GeomFromGeoJSON($2))),
          $3
        )
        `,
        [uuid, geomJSON, name],
      );
      console.log(name);
      // 2. 同時新增 trails_info，只填 uuid 與 name
      await this.trailRepo.query(
        `
        INSERT INTO trails_info (uuid, name, time)
        VALUES ($1, $2, CURRENT_DATE::timestamp)
        `,
        [uuid, nameNoExt],
      );
    }

    return {
      success: true,
      savedCount: geojson.features.length,
    };
  }

  async delete(uuid: string) {
    await this.trailRepo.query(`DELETE FROM trails_info WHERE uuid = $1`, [
      uuid,
    ]);

    await this.trailRepo.query(`DELETE FROM trails WHERE uuid = $1`, [uuid]);

    return { success: true, message: `資料 uuid=${uuid} 已刪除` };
  }
  async put(uuid: string, file: Express.Multer.File) {
    console.log(file);
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

      // 1. 去除副檔名
      // const rawName = path.basename(
      //   file.originalname,
      //   path.extname(file.originalname),
      // );

      // 2. 中文不要亂碼：通常 multer 已經是 UTF-8，如果還有亂碼，可能是編碼問題，但你可以明確轉換成 UTF-8 試試
      const name = Buffer.from(file.originalname, 'binary').toString('utf-8');

      // 更新 trails（空間資料）
      await this.trailRepo.query(
        `
        UPDATE trails
        SET
          geom = ST_Force2D(ST_GeomFromGeoJSON($1)),
          length = ROUND(
            ST_Length(ST_Transform(ST_Force2D(ST_GeomFromGeoJSON($1)), 3826))::numeric / 1000,
            3
          ),
          center = ST_Centroid(ST_Force2D(ST_GeomFromGeoJSON($1))),
          bounds = ST_Envelope(ST_Force2D(ST_GeomFromGeoJSON($1))),
          name = $2
        WHERE uuid = $3
        `,
        [geomJSON, name, uuid],
      );
    }

    return {
      success: true,
      savedCount: geojson.features.length,
    };
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
    const sql = `UPDATE trails_info SET ${fields.join(', ')} WHERE uuid = $${i}`;
    await this.trailRepo.query(sql, values);

    return { success: true, message: `uuid=${uuid} 資料已更新` };
  }

  async getExport(res: Response, type: string) {
    const geojson: FeatureCollection = await this.getTrails();

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
