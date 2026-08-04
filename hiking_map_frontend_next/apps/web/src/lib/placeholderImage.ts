// 先用代圖：依 seed 產生穩定的漸層色塊 data URI，之後可換成真實圖片
export function placeholderImage(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;

  const hue1 = hash % 360;
  const hue2 = (hue1 + 40) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="hsl(${hue1},55%,35%)"/><stop offset="100%" stop-color="hsl(${hue2},55%,20%)"/></linearGradient></defs><rect width="300" height="200" fill="url(#g)"/></svg>`;

  const encoded = encodeURIComponent(svg).replace(/\(/g, '%28').replace(/\)/g, '%29');
  return `data:image/svg+xml;utf8,${encoded}`;
}
