import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';

const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
const manifest=JSON.parse(await fs.readFile(path.join(base,'data/manifest.json'),'utf8'));
const mustExist=new Set(['index.html','bootstrap.js','app.js','report-export.js','report-export.css',
 ...manifest.catalog.map(s=>s.replace(/^\//,'')),
 ...Object.values(manifest.matching).flat().map(s=>s.replace(/^\//,'')),
 ...Object.values(manifest.evidence).map(s=>s.replace(/^\//,''))]);
for(const rel of mustExist){
 const resolved=path.resolve(base,rel);
 if(!resolved.startsWith(base+path.sep))throw Error('资源路径越界');
 await fs.access(resolved);
}
async function readParts(parts){
 const text=[];
 for(const url of parts){
  const b=await fs.readFile(path.join(base,url.replace(/^\//,'')));
  text.push((b[0]===31&&b[1]===139?gunzipSync(b):b).toString('utf8'));
 }
 return JSON.parse(text.join(''));
}
const catalog=await readParts(manifest.catalog);
const html=await fs.readFile(path.join(base,'index.html'),'utf8');
const startupMatch=html.match(/<script id="public-startup-data" type="application\/json">([\s\S]*?)<\/script>/);
if(!startupMatch)throw Error('缺少独立的门店列表资料');
const startup=JSON.parse(startupMatch[1]);
if(startup.seed.products.length!==0||startup.seed.stores.length!==catalog.stores.length)throw Error('首页不应预加载商品');
if(/<script defer src="\/(?:vendor\/|report-export\.js)/.test(html))throw Error('报表组件不能阻塞首页');
let packedProducts=0;
for(const store of catalog.stores){
 const url=startup.manifest.storePacks[store.id];
 const pack=JSON.parse(await fs.readFile(path.join(base,url),'utf8'));
 if(pack.storeId!==store.id||JSON.stringify(pack.products)!==JSON.stringify(catalog.products.filter(p=>p.storeId===store.id))||JSON.stringify(pack.categories)!==JSON.stringify(catalog.categories.filter(c=>c.storeId===store.id)))throw Error('门店按需资料不一致：'+store.id);
 packedProducts+=pack.products.length;
}
if(packedProducts!==catalog.products.length)throw Error('按需加载商品数量不符');
for(const parts of Object.values(manifest.matching))await readParts(parts);
const serialized=JSON.stringify(catalog);
const assetPaths=new Set(serialized.match(/\/assets\/[A-Za-z0-9_./-]+/g)||[]);
for(const url of assetPaths)await fs.access(path.join(base,url.slice(1)));
if(!manifest.counts||manifest.counts.stores!==7||manifest.counts.products!==9353)throw Error('迁移快照数量不符');
console.log(JSON.stringify({verified:true,stores:manifest.counts.stores,products:manifest.counts.products,matchingStores:Object.keys(manifest.matching).length,requiredResources:mustExist.size,catalogAssetReferences:assetPaths.size,revision:manifest.catalogRevision}));
