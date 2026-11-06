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
for(const parts of Object.values(manifest.matching))await readParts(parts);
const serialized=JSON.stringify(catalog);
const assetPaths=new Set(serialized.match(/\/assets\/[A-Za-z0-9_./-]+/g)||[]);
for(const url of assetPaths)await fs.access(path.join(base,url.slice(1)));
if(!manifest.counts||manifest.counts.stores!==7||manifest.counts.products!==9353)throw Error('迁移快照数量不符');
console.log(JSON.stringify({verified:true,stores:manifest.counts.stores,products:manifest.counts.products,matchingStores:Object.keys(manifest.matching).length,requiredResources:mustExist.size,catalogAssetReferences:assetPaths.size,revision:manifest.catalogRevision}));
