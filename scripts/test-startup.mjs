import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
const html=await fs.readFile(path.join(root,'index.html'),'utf8');
const startup=JSON.parse(html.match(/<script id="public-startup-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const main={innerHTML:''};let requests=0,mode='offline';
const ctx={URL,AbortController,Blob,Response,TextDecoder,DecompressionStream,Map,
 setTimeout:(fn,ms)=>setTimeout(fn,Math.min(ms,20)),clearTimeout,
 location:{href:'http://test.local/',reload(){}},state:{route:'stores'},
 data:structuredClone(startup.seed),render(){},esc:s=>String(s),toast(){},
 ADDITIONAL_MATCHING_DATA:{},
 document:{addEventListener(){},querySelector:s=>s==='#public-startup-data'?{textContent:JSON.stringify(startup)}:main,
 createElement:()=>({remove(){}}),body:{appendChild:script=>queueMicrotask(()=>{ctx.PUBLIC_APP_READY=true;script.onload();})}},
 fetch:async(url,options)=>{requests++;if(mode==='offline')return new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(Object.assign(Error('timeout'),{name:'AbortError'})),{once:true}));
  const json=JSON.parse(await fs.readFile(path.join(root,new URL(url).pathname),'utf8'));
  return {ok:true,json:async()=>json};},
};ctx.window=ctx;
vm.createContext(ctx);vm.runInContext(await fs.readFile(path.join(root,'bootstrap.js'),'utf8'),ctx);
await new Promise(setImmediate);
assert.equal(ctx.PUBLIC_APP_READY,true);assert.equal(requests,0,'Listing startup must not fetch products or reporting libraries');
const id=startup.seed.stores[0].id;
await assert.rejects(ctx.publicLoadStore(id));
assert.equal(requests,2);assert.equal(ctx.PUBLIC_STORE_READY[id],undefined);
assert.ok(ctx.PUBLIC_STORE_ERRORS[id]);
mode='online';delete ctx.PUBLIC_STORE_ERRORS[id];
const first=ctx.publicLoadStore(id);assert.equal(ctx.publicLoadStore(id),first,'Concurrent opens should reuse the same request');await first;
assert.equal(ctx.PUBLIC_STORE_READY[id],true);
await Promise.all(startup.seed.stores.map(s=>ctx.publicLoadStore(s.id)));
assert.equal(ctx.data.products.length,9353);assert.equal(ctx.data.categories.length,193);
const before=requests;await ctx.publicLoadStore(id);assert.equal(requests,before,'Completed store data should be reused');
mode='offline';await ctx.publicLoadMatching(id);
assert.equal(ctx.PUBLIC_MATCH_LOADING[id],false);assert.ok(ctx.PUBLIC_MATCH_ERRORS[id]);
console.log(JSON.stringify({passed:true,offlineListingStartup:true,storeTimeoutAndRetry:true,reusedRequests:true,products:ctx.data.products.length,categories:ctx.data.categories.length,matchingFailureTerminates:true}));
