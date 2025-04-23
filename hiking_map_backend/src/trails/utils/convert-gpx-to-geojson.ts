// utils/convert-gpx-to-geojson.ts
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
