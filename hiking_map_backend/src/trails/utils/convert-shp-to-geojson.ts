export async function convertShpToGeojson(file: Express.Multer.File) {
  const shpjs = await import('shpjs');
  return await shpjs.default(file.buffer); // 確保是 .default
}
