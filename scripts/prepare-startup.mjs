import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
const manifest = JSON.parse(await fs.readFile(path.join(root, 'data/manifest.json'), 'utf8'));
const strings = [];
for (const url of manifest.catalog) {
  const bytes = await fs.readFile(path.join(root, url));
  strings.push((bytes[0] === 31 && bytes[1] === 139 ? gunzipSync(bytes) : bytes).toString('utf8'));
}
const catalog = JSON.parse(strings.join(''));
const storePacks = {};
for (const store of catalog.stores) {
  const filename = 'store-' + store.id.replace(/[^a-z0-9_-]/ig, '_') + '.json';
  storePacks[store.id] = '/data/' + filename;
  await fs.writeFile(path.join(root, 'data', filename), JSON.stringify({
    storeId: store.id,
    products: catalog.products.filter(p => p.storeId === store.id),
    categories: catalog.categories.filter(c => c.storeId === store.id),
  }));
}
const seed = { ...catalog, products: [],
  categories: catalog.categories.map(({ id, storeId, observationId, name, order }) => ({ id, storeId, observationId, name, order })),
};
const startup = JSON.stringify({ manifest: { ...manifest, storePacks }, seed }).replace(/</g, '\\u003c');
const tag = '<script id="public-startup-data" type="application/json">' + startup + '</script>';
const indexPath = path.join(root, 'index.html');
let html = await fs.readFile(indexPath, 'utf8');
html = html.replace(/<script defer src="\/(?:vendor\/[^"<>]+|report-export\.js[^"<>]*)"><\/script>\s*/g, '');
html = html.replace(/<script id="public-startup-data" type="application\/json">[\s\S]*?<\/script>\s*/g, '');
html = html.replace(/<script defer src="\/bootstrap\.js[^"<>]*"><\/script>/,
  tag + '\n<script defer src="/bootstrap.js?v=20261110-a85-video-review-v1"></script>');
await fs.writeFile(indexPath, html);
console.log(JSON.stringify({ startupPrepared: true, stores: catalog.stores.length, initialProducts: seed.products.length, startupBytes: Buffer.byteLength(startup), productRecords: catalog.products.length }));
