// utils/convert-gpx-to-geojson.ts
export async function convertGpxToGeojson(file: Express.Multer.File) {
  // 假裝轉換
  const gpxToGeojson = await import('@tmcw/togeojson');
  const { DOMParser } = await import('@xmldom/xmldom');

  // 移除 BOM (Byte Order Mark)
  const xmlText = file.buffer.toString('utf-8').replace(/^\uFEFF/, '');

  // 直接轉成 DOM
  const gpxDom = new DOMParser().parseFromString(xmlText, 'text/xml');

  // 轉換為 GeoJSON
  return gpxToGeojson.gpx(gpxDom);
}
