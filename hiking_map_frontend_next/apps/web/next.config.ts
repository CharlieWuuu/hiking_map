import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.svg': [
        {
          // import logoUrl from './logo.svg?url' → 當靜態檔案，回傳圖片網址
          condition: { query: /url/ },
          type: 'asset',
        },
        {
          // import Logo from './logo.svg' → 轉成 React 元件，可用 className/currentColor 控制樣式
          // svgo: false，避免 SVGO 優化步驟拿掉 viewBox（會讓 CSS 縮放時內容被裁切而非等比縮放）
          loaders: [{ loader: '@svgr/webpack', options: { svgo: false } }],
          as: '*.js',
        },
      ],
    },
  },
};

export default withNextIntl(nextConfig);
