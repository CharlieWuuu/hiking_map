import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from './upload.entity';
import * as path from 'path';
import { default as shp } from 'shpjs'; // 要這樣寫才能正確 import ESM 模組

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
    } else {
      throw new Error('不支援的檔案格式');
    }

    // 寫入資料庫
    for (const feature of geojson.features) {
      const id = feature.properties?.id;
      const length = feature.properties?.length;
      const geomJSON = JSON.stringify(feature.geometry);

      await this.uploadRepo.query(
        `
        INSERT INTO hiking_map (id, length, geom, center, bounds)
        VALUES ($1, $2, ST_GeomFromGeoJSON($3), ST_Centroid(ST_GeomFromGeoJSON($3)), ST_Envelope(ST_GeomFromGeoJSON($3)))
        ON CONFLICT (id) DO NOTHING;
      `,
        [id, length, geomJSON],
      );
    }

    return {
      success: true,
      savedCount: geojson.features.length,
    };
  }
}
