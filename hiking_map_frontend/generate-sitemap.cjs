const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const { Readable } = require('stream');

const links = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/search', changefreq: 'weekly', priority: 0.7 },
    { url: '/intro', changefreq: 'weekly', priority: 0.7 },
    { url: '/login', changefreq: 'monthly', priority: 0.5 },
];

const stream = new SitemapStream({ hostname: 'https://hiking-map.vercel.app' });

streamToPromise(Readable.from(links).pipe(stream)).then((data) => {
    createWriteStream('./public/sitemap.xml').write(data.toString());
    console.log('Sitemap generated!');
});
