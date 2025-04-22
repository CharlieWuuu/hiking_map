import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from './upload.entity';
import * as path from 'path';
import { default as shp } from 'shpjs'; // 要這樣寫才能正確 import ESM 模組
import { v4 as uuidv4 } from 'uuid'; // 如果你使用 UUID
import { parseStringPromise } from 'xml2js';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadRepo: Repository<Upload>,
  ) {}

  async handleUpload(file: Express.Multer.File) {
    const ext = path.extname(file.originalname).toLowerCase();
    let geojson;

    if (ext === '.geojson' || ext === '.json') {
      geojson = JSON.parse(file.buffer.toString());
    } else if (ext === '.zip') {
      const shpjs = await import('shpjs');
      geojson = await shpjs.default(file.buffer); // 確保是 .default
    } else if (ext === '.gpx') {
      const gpxToGeojson = await import('@tmcw/togeojson');
      const { DOMParser } = await import('@xmldom/xmldom');

      // 移除 BOM (Byte Order Mark)
      const xmlText = file.buffer.toString('utf-8').replace(/^\uFEFF/, '');

      // 直接轉成 DOM
      const gpxDom = new DOMParser().parseFromString(xmlText, 'text/xml');

      // 轉換為 GeoJSON
      geojson = gpxToGeojson.gpx(gpxDom);
    } else {
      throw new Error('不支援的檔案格式');
    }
    console.log(geojson.features);

    // 寫入資料庫
    for (const feature of geojson.features) {
      const geomJSON = JSON.stringify(feature.geometry);
      console.log(geomJSON);

      // 1. 去除副檔名
      const rawName = path.basename(
        file.originalname,
        path.extname(file.originalname),
      );

      // 2. 中文不要亂碼：通常 multer 已經是 UTF-8，如果還有亂碼，可能是編碼問題，但你可以明確轉換成 UTF-8 試試
      const name = Buffer.from(rawName, 'binary').toString('utf-8');

      const uuid = uuidv4(); // 每一筆新資料產生一個 uuid

      // 1. 新增 hiking_map
      await this.uploadRepo.query(
        `
        INSERT INTO hiking_map (uuid, geom, length, center, bounds, name)
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

      // 2. 同時新增 hiking_map_info，只填 uuid 與 name
      await this.uploadRepo.query(
        `
        INSERT INTO hiking_map_info (uuid, name, time)
        VALUES ($1, $2, CURRENT_DATE::timestamp)
        `,
        [uuid, name],
      );
    }

    return {
      success: true,
      savedCount: geojson.features.length,
    };
  }

  async deleteByUuid(uuid: string) {
    // 注意順序！info 依賴 map 的 FK 關係，所以 info 要先刪
    await this.uploadRepo.query(`DELETE FROM hiking_map_info WHERE uuid = $1`, [
      uuid,
    ]);

    await this.uploadRepo.query(`DELETE FROM hiking_map WHERE uuid = $1`, [
      uuid,
    ]);

    return { success: true, message: `資料 uuid=${uuid} 已刪除` };
  }

  async handleUpdate(file: Express.Multer.File) {
    return await this.handleUpload(file);
  }
}
