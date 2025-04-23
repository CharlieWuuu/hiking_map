import { FeatureCollection } from 'geojson';
import * as Papa from 'papaparse';
import { create as xmlCreate } from 'xmlbuilder2';

export function convertGeojsonToCsv(geojson: FeatureCollection): string {
  const rows = geojson.features.map((f) => f.properties);
  const csv = Papa.unparse(rows);
  const bom = '\uFEFF';
  return bom + csv;
}

export async function convertGeojsonToGpx(geojson: FeatureCollection) {
  const gpx = xmlCreate({ version: '1.0' }).ele('gpx', {
    version: '1.1',
    creator: 'HikingMap',
  });

  geojson.features.forEach((feature) => {
    const trk = gpx.ele('trk');
    trk.ele('name').txt(feature.properties?.name || 'Unnamed');
    console.log(feature.properties?.name);

    // 自訂屬性放 extensions
    const ext = trk.ele('extensions');
    for (const [key, value] of Object.entries(feature.properties || {})) {
      if (key !== 'name') {
        if (key === 'time') {
          ext
            .ele('time')
            .txt(
              new Date(value).toISOString().split('T')[0].replace(/-/g, '/'),
            );
        } else {
          ext.ele(key).txt(String(value ?? ''));
        }
      }
    }

    if (feature.geometry.type === 'LineString') {
      const trkseg = trk.ele('trkseg');
      for (const [lon, lat] of feature.geometry.coordinates) {
        trkseg.ele('trkpt', { lat, lon });
      }
    }

    if (feature.geometry.type === 'MultiLineString') {
      for (const segment of feature.geometry.coordinates) {
        const trkseg = trk.ele('trkseg');
        for (const [lon, lat] of segment) {
          trkseg.ele('trkpt', { lat, lon });
        }
      }
    }
  });

  return gpx.end({ prettyPrint: true });
}

export async function convertGpxToGeojson(file: Express.Multer.File) {
  const gpxToGeojson = await import('@tmcw/togeojson');
  const { DOMParser } = await import('@xmldom/xmldom');

  try {
    // 將 buffer 轉成 UTF-8 字串，並移除 BOM（Byte Order Mark）
    const xmlText = file.buffer.toString('utf-8').replace(/^\uFEFF/, '');

    // 將字串解析為 DOM 結構
    const gpxDom = new DOMParser().parseFromString(xmlText, 'text/xml');

    // 驗證是否有 <gpx> 標籤
    if (
      !gpxDom ||
      !gpxDom.documentElement ||
      gpxDom.documentElement.nodeName !== 'gpx'
    ) {
      throw new Error('這不是有效的 GPX 檔案');
    }

    // 轉換為 GeoJSON 結構
    const geojson = gpxToGeojson.gpx(gpxDom);
    return geojson;
  } catch (err) {
    console.error('GPX 轉換失敗:', err);
    throw new Error('GPX 檔案解析錯誤，請確認格式正確');
  }
}

export async function convertShpToGeojson(file: Express.Multer.File) {
  const shpjs = await import('shpjs');
  return await shpjs.default(file.buffer); // 確保是 .default
}
