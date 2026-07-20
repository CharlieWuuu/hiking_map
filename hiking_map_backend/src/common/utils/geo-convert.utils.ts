import { FeatureCollection } from 'geojson';
import * as Papa from 'papaparse';
import { create as xmlCreate } from 'xmlbuilder2';

export function convertGeojsonToCsv(geojson: FeatureCollection): string {
  const rows = geojson.features.map((f) => {
    const props = { ...f.properties };

    // 檢查 time 欄位是否存在並轉換格式
    if (props.time) {
      const date = new Date(props.time);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 月份從 0 開始
      const day = date.getDate();
      props.time = `${year}年${month}月${day}日`;
    }

    return props;
  });
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
    const xmlText = file.buffer.toString('utf-8').replace(/^\uFEFF/, '');
    const gpxDom = new DOMParser().parseFromString(xmlText, 'text/xml');
    const featureCollection = gpxToGeojson.gpx(gpxDom);

    if (featureCollection.type !== 'FeatureCollection') {
      throw new Error('GPX 轉換後格式異常');
    }

    const lineStrings = featureCollection.features
      .filter(
        (f) =>
          f.geometry.type === 'LineString' &&
          Array.isArray((f.geometry as any).coordinates),
      )
      .map((f) => f.geometry);

    if (lineStrings.length === 0) {
      throw new Error('GPX 中沒有可用的 LineString 軌跡');
    }

    let geometry;
    if (lineStrings.length === 1) {
      geometry = lineStrings[0]; // 單條軌跡，直接直接使用 geometry
    } else {
      geometry = {
        type: 'MultiLineString',
        coordinates: lineStrings.map((g: any) => g.coordinates), // 組成 MultiLineString
      };
    }

    const unifiedFeature = {
      type: 'Feature',
      properties: {},
      geometry,
    };

    return {
      type: 'FeatureCollection',
      features: [unifiedFeature],
    };
  } catch (err) {
    console.error('GPX 轉換失敗:', err);
    throw new Error('GPX 檔案解析錯誤，請確認格式正確');
  }
}

export async function convertShpToGeojson(file: Express.Multer.File) {
  const shpjs = await import('shpjs');
  return await shpjs.default(file.buffer); // 確保是 .default
}
