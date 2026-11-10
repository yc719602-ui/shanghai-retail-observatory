
'use strict';
// Four data groups share storeId. Missing business values remain null.
// Future collectors can call CompetitorBoard.replaceData(data) or import a JSON backup.
// No sample stores, products, ratings or sales are embedded in the delivered file.
const STORAGE_KEY='shanghai-competitor-board-a17-20261027-v1';
const DISTRICTS=['黄浦区','徐汇区','长宁区','静安区','普陀区','虹口区','杨浦区','闵行区','宝山区','嘉定区','浦东新区','金山区','松江区','青浦区','奉贤区','崇明区'];
/* MATCHING_DATA_START */
let MATCHING_DATA=null;
/* MATCHING_DATA_END */
/* ADDITIONAL_MATCHING_DATA_START */
const ADDITIONAL_MATCHING_DATA={};
/* ADDITIONAL_MATCHING_DATA_END */
const EMPTY_DATA={schemaVersion:1,stores:[],categories:[],products:[],observations:[]};
const EMBEDDED_SEED=window.PUBLIC_SEED;
const ICONS={
  store:'<path d="M3 10v10h18V10M2 10l2-6h16l2 6M2 10c0 3 5 3 5 0 0 3 5 3 5 0 0 3 5 3 5 0 0 3 5 3 5 0M9 20v-6h6v6"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',
  up:'<path d="m7 14 5-5 5 5"/>',down:'<path d="m7 10 5 5 5-5"/>',left:'<path d="m14 6-6 6 6 6"/>',right:'<path d="m9 6 6 6-6 6"/>',
  download:'<path d="M12 3v12m-4-4 4 4 4-4M4 15v5h16v-5"/>',
  upload:'<path d="M12 16V4m-4 4 4-4 4 4M4 16v4h16v-4"/>',
  check:'<path d="m5 12 4 4L19 6"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  file:'<path d="M14 3H5v18h14V8l-5-5v5h5M8 12h8M8 16h6"/>',
  layers:'<path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5"/>',
  box:'<path d="m12 3 9 5v9l-9 5-9-5V8l9-5ZM3 8l9 5 9-5M12 13v9M7.5 5.5l9 5"/>',
  star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.2"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  edit:'<path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14l-1 7Z"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8" r="1.5"/><path d="m3 17 6-6 4 4 3-3 5 5"/>',
  list:'<path d="M8 6h12M8 12h12M8 18h12M3 6h.01M3 12h.01M3 18h.01"/>',
  link:'<path d="m9 15 6-6M8 17l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M16 7l2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" transform="translate(1 0) scale(.9)"/>',
  note:'<path d="M15 3H4v18h16V9M15 3v6h5M8 13h8M8 17h5"/>',
  shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  external:'<path d="M14 3h7v7M21 3l-11 11M10 4H4v16h16v-6"/>',
  refresh:'<path d="M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-1l2 6M4 12l2 6a7 7 0 0 0 12-1"/>'
};
const $=s=>document.querySelector(s);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const has=value=>value!==null&&value!==undefined&&String(value).trim()!=='';
const icon=(name,size=18)=>'<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICONS[name]||ICONS.info)+'</svg>';
const clone=value=>JSON.parse(JSON.stringify(value));
const uid=()=>globalThis.crypto?.randomUUID?.()||('id-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10));
const text=value=>has(value)?esc(value):'<span class="dim">—</span>';
function money(value){return has(value)&&Number.isFinite(Number(value))?'¥'+Number(value).toFixed(2):text(value)}
function safeLink(value){if(!has(value))return '';try{const u=new URL(String(value));return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}
function safeLocalScreenshot(value){
  if(typeof value!=='string'||!/^采集记录\/[^\\/:?#\x00-\x1f]+\/[^\\/:?#\x00-\x1f]+\.png$/i.test(value))return '';
  const parts=value.split('/');if(parts.some(part=>part==='.'||part==='..'||part.includes('%')))return '';
  return parts.map(encodeURIComponent).join('/');
}
function safeImage(value){if(!has(value))return '';const str=String(value);if(/^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(str))return str;return safeLocalScreenshot(str)||safeLink(str)}
function externalLink(url,label){const safe=safeLink(url);return safe?'<a class="text-link" href="'+esc(safe)+'" target="_blank" rel="noopener noreferrer">'+esc(label||url)+' '+icon('external',12)+'</a>':'<span class="dim">—</span>'}
function storeAvatarMarkup(store,large=false){
  const url=safeImage(store.avatarUrl),name=store.name||'门店';
  return '<span class="'+(large?'profile-icon':'store-avatar')+'">'+(url?'<img src="'+esc(url)+'" alt="'+esc(name)+'的门店头像" loading="lazy" decoding="async" referrerpolicy="no-referrer">':icon('store',large?31:20))+'</span>';
}
function imageMarkup(url,alt,extra='',productId='',occurrenceIndex){const safe=safeImage(url),clickable=!!safe&&!!productId,tag=clickable?'button':'span';return '<'+tag+' class="product-image '+extra+'"'+(clickable?' type="button" data-action="product-image" data-id="'+esc(productId)+'"'+(Number.isInteger(occurrenceIndex)?' data-occurrence="'+occurrenceIndex+'"':'')+' aria-label="放大查看'+esc(alt)+'的图片" title="点击放大图片"':'')+'>'+(safe?'<img src="'+esc(safe)+'" alt="'+esc(alt)+'" loading="lazy" decoding="async" referrerpolicy="no-referrer">':icon('image',22))+'</'+tag+'>'}
function dateText(value,short=false){if(!has(value))return '尚未采集';const d=new Date(value);if(Number.isNaN(d.getTime()))return String(value);return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:short?undefined:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(d)}
function stamp(value){return has(value)?(Date.parse(value)||0):0}
function options(values,selected,firstLabel){return '<option value="">'+esc(firstLabel)+'</option>'+values.map(v=>'<option value="'+esc(v)+'"'+(v===selected?' selected':'')+'>'+esc(v)+'</option>').join('')}
function badge(label,tone=''){return '<span class="badge '+tone+'">'+esc(label)+'</span>'}
function businessBadge(value){const m={open:['营业中','teal'],closed:['休息中',''],suspended:['暂停营业','amber']};return badge(...(m[value]||['状态未采集','']))}
function captureBadge(value){const m={complete:['列表采集完成','teal'],merchantComplete:['普通分类已采集','teal'],partial:['部分采集','blue'],failed:['采集失败','red'],pending:['待采集','']};return badge(...(m[value]||['待采集','']))}
function smallEmpty(title,description,name='file'){return '<div class="empty-state compact"><span class="empty-icon">'+icon(name,24)+'</span><h3>'+esc(title)+'</h3><p>'+esc(description)+'</p></div>'}
function illustration(){return '<svg class="empty-illustration" viewBox="0 0 190 130" fill="none" aria-hidden="true"><ellipse cx="96" cy="112" rx="74" ry="9" fill="#edf2f6"/><rect x="28" y="41" width="109" height="67" rx="8" fill="#fff" stroke="#cedce4" stroke-width="1.5"/><path d="M23 47 34 24h94l13 23" fill="#e7f5f0" stroke="#a2cec5" stroke-width="1.5"/><path d="m45 24-5 23m27-23-2 23m25-23 2 23m23-23 5 23" stroke="#a2cec5" stroke-width="1.5"/><path d="M23 47c0 12 23 12 23 0 0 12 23 12 23 0 0 12 24 12 24 0 0 12 24 12 24 0 0 12 24 12 24 0" stroke="#a2cec5" stroke-width="1.5"/><rect x="42" y="68" width="35" height="24" rx="3" fill="#f0f6fa" stroke="#d6e3eb"/><path d="M59 69v23" stroke="#d6e3eb"/><path d="M92 108V72a4 4 0 0 1 4-4h22a4 4 0 0 1 4 4v36" stroke="#d6e3eb" stroke-width="1.5"/><circle cx="115" cy="86" r="1.5" fill="#99b6b6"/><rect x="126" y="66" width="45" height="48" rx="6" fill="#fff" stroke="#c8dce0" stroke-width="1.5"/><rect x="136" y="77" width="24" height="5" rx="2.5" fill="#d4eae4"/><path d="M136 91h24m-24 9h16" stroke="#dce5ee" stroke-width="3" stroke-linecap="round"/><circle cx="153" cy="29" r="10" fill="#edf5fa"/><path d="M149 29h8m-4-4v8" stroke="#b4ccda" stroke-width="1.5" stroke-linecap="round"/><circle cx="19" cy="77" r="3" fill="#cce5df"/></svg>'}
let data=clone(EMBEDDED_SEED),storageProblem='',editingStoreId=null,pendingImport=null,lastModalFocus=null;
const geoUi={status:null,busy:false,message:'',storeId:null,district:'',candidates:[]};
const GEO_ORIGIN='';
function validGeoLocation(value){return Array.isArray(value)&&value.length===2&&value.every(v=>typeof v==='number'&&Number.isFinite(v))&&value[0]>=120.8&&value[0]<=122.3&&value[1]>=30.5&&value[1]<=32.0}
function matchedOwnStore(store){return (data.ownStores||[]).find(s=>s.id===store?.ownStoreMatch?.ownStoreId)||null}
function validStoreDistance(store){const own=matchedOwnStore(store),match=store?.ownStoreMatch;return !!own&&validGeoLocation(store.mapLocation?.location)&&validGeoLocation(own.mapLocation?.location)&&store.mapLocation.coordinateSystem==='GCJ-02'&&own.mapLocation.coordinateSystem==='GCJ-02'&&match?.distanceKind==='straightLine'&&Number.isFinite(match.distanceMeters)&&match.distanceMeters>=0&&JSON.stringify(match.competitorLocation)===JSON.stringify(store.mapLocation.location)&&JSON.stringify(match.ownStoreLocation)===JSON.stringify(own.mapLocation.location)}
function formatStoreDistance(value){return Number.isFinite(value)&&value>=0?(value>=1000?(Math.round(value/10)/100).toFixed(2)+'公里':Math.round(value)+'米'):'—'}
function validWalkingRoute(store){const route=store?.ownStoreMatch?.walkingRoute;return validStoreDistance(store)&&route?.distanceKind==='walking'&&Number.isFinite(route.distanceMeters)&&route.distanceMeters>=0&&Number.isFinite(route.durationSeconds)&&route.durationSeconds>=0&&JSON.stringify(route.competitorLocation)===JSON.stringify(store.mapLocation.location)&&JSON.stringify(route.ownStoreLocation)===JSON.stringify(matchedOwnStore(store)?.mapLocation?.location)}
function geoRouteLink(store){if(!validStoreDistance(store))return '';const own=matchedOwnStore(store),url='https://uri.amap.com/navigation?from='+own.mapLocation.location.join(',')+','+encodeURIComponent(own.name)+'&to='+store.mapLocation.location.join(',')+','+encodeURIComponent(store.name)+'&mode=walk&src=competitor-board&callnative=0';return '<a class="text-link" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">高德查看两店路线 '+icon('external',12)+'</a>'}
function ownStoreBusinessMarkup(own){return own?.businessStatus==='notOpen'?' '+badge('未营业','amber'):''}
function ownStoreSummary(store){const own=matchedOwnStore(store);return '<span class="own-store-above">本店铺：'+esc(own?.name||'待匹配醉清风门店')+'</span><span class="own-store-distance">竞品距本店：'+(validStoreDistance(store)?esc(formatStoreDistance(store.ownStoreMatch.distanceMeters))+'（直线）':'—')+(validWalkingRoute(store)?' · 步行 '+esc(formatStoreDistance(store.ownStoreMatch.walkingRoute.distanceMeters)):'')+'</span><span class="own-store-distance">仅在已收录本店中比较</span>'}
function storeGeoPanelBody(store,preview=false){
 const own=preview?null:matchedOwnStore(store),match=store?.ownStoreMatch,valid=!preview&&validStoreDistance(store),count=(data.ownStores||[]).length;
 const walking=valid&&validWalkingRoute(store)?match.walkingRoute:null,publicPins=store?.mapLocation?.matchMethod==='publicStoreMapTargetVerified'&&own?.mapLocation?.matchMethod==='publicStoreMapTargetVerified';
 return '<div class="geo-main"><div class="label-small">本店铺</div><strong>'+esc(own?.name||'待匹配醉清风门店')+ownStoreBusinessMarkup(own)+'</strong><p>'+esc(own?.address||'连接高德后按上海门店名称检索，也可改选本店')+'</p>'+(valid?geoRouteLink(store):'')+'</div><div class="geo-distance"><div class="label-small">竞品店铺距离本店 · 直线</div><strong>'+(valid?esc(formatStoreDistance(match.distanceMeters)):'—')+'</strong>'+(walking?'<span>步行路线 '+esc(formatStoreDistance(walking.distanceMeters))+' · 预计 '+Math.ceil(walking.durationSeconds/60)+' 分钟</span>':'<span>步行路线尚未取得</span>')+'</div><div class="geo-note">'+(valid?esc(match.selectionMethod==='manual'?'本店由你手动指定':'已收录 '+count+' 家本店中的最近门店')+'<br>全上海本店名单仍待核全<br>高德计算 · '+esc(exactDateText(match.computedAt))+'<br>'+esc(publicPins?'两店用美团导航点位，经高德门址互核':store.mapLocation.matchMethod==='verifiedAddressGeocode'?'竞品按原始门牌地址定位':'竞品按高德门店点位定位'):'门店对应关系或坐标尚未核对，距离保持未取得状态')+'</div>'+(preview?'':'<button class="btn small" data-action="geo-settings" data-id="'+esc(store.id)+'">'+icon('link',14)+'本店与距离设置</button>');
}
function storeGeoPanel(store,preview=false){return '<section class="panel store-geo-panel" id="storeGeoPanel">'+storeGeoPanelBody(store,preview)+'</section>'}
function geoMapLink(store){
 const point=store?.mapLocation;if(!validGeoLocation(point?.location))return '';
 const url='https://uri.amap.com/marker?position='+point.location.join(',')+'&name='+encodeURIComponent(store.name)+'&src=competitor-board&coordinate=gaode&callnative=0';
 return '<a class="text-link" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">在高德查看位置 '+icon('external',12)+'</a>';
}
async function geoRequest(route,payload){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),90000);
 try{
  const response=await fetch(GEO_ORIGIN+'/api/maps/'+route,{method:payload===undefined?'GET':'POST',headers:payload===undefined?{}:{'Content-Type':'application/json'},body:payload===undefined?undefined:JSON.stringify(payload),signal:controller.signal});
  const result=await response.json();if(!result.ok){const error=Error(result.error?.message||'地图查询未成功');error.candidates=result.error?.candidates||[];throw error}return result.data;
 }catch(error){if(error.name==='AbortError')throw Error('地图查询超时，已保留上次结果');if(error instanceof TypeError)throw Error('尚未连接本机地图服务，请启动同目录“启动高德地图服务.pyw”');throw error}finally{clearTimeout(timer)}
}
function mergeGeoData(value){
 geoUi.status=value;
 const own=new Map((data.ownStores||[]).map(s=>[s.id,s]));for(const row of value.ownStores||[])own.set(row.id,row);data.ownStores=[...own.values()];
 for(const row of value.stores||[]){const store=data.stores.find(s=>s.id===row.id);if(!store)continue;if(row.mapLocation)store.mapLocation=clone(row.mapLocation);if(row.ownStoreMatch)store.ownStoreMatch=clone(row.ownStoreMatch);if(row.ownStoreDistances)store.ownStoreDistances={...store.ownStoreDistances,...clone(row.ownStoreDistances)}}
 if(value.searchSummary)data.mapSearchSummary=clone(value.searchSummary);
}
function refreshGeoFragments(){
 if(state.route==='stores'&&$('#storeRows'))refreshStores();
 const panel=$('#storeGeoPanel'),ctx=state.route==='detail'?getDetailContext():null;if(panel&&ctx)panel.innerHTML=storeGeoPanelBody(ctx.store,state.preview);
 if($('#geoSettingsDialog')?.open)renderGeoSettings();
}
async function refreshGeoFromService(){try{const result=await geoRequest('data');mergeGeoData(result);saveData();refreshGeoFragments()}catch{}}
const GEO_DISTRICT_CODES={'黄浦区':'310101','徐汇区':'310104','长宁区':'310105','静安区':'310106','普陀区':'310107','虹口区':'310109','杨浦区':'310110','闵行区':'310112','宝山区':'310113','嘉定区':'310114','浦东新区':'310115','金山区':'310116','松江区':'310117','青浦区':'310118','奉贤区':'310120','崇明区':'310151'};
function geoDistrictFor(store){return store?.district||store?.mapLocation?.district||''}
function geoDistrictDistance(store,own){
 const point=store?.mapLocation,ownPoint=own?.mapLocation,record=store?.ownStoreDistances?.[own?.id]||(store?.ownStoreMatch?.ownStoreId===own?.id?store.ownStoreMatch:null);
 if(!record||record.distanceKind!=='straightLine'||!Number.isFinite(record.distanceMeters)||record.distanceMeters<0||point?.coordinateSystem!=='GCJ-02'||ownPoint?.coordinateSystem!=='GCJ-02'||!validGeoLocation(point.location)||!validGeoLocation(ownPoint.location)||JSON.stringify(record.competitorLocation)!==JSON.stringify(point.location)||JSON.stringify(record.ownStoreLocation)!==JSON.stringify(ownPoint.location))return null;
 return record;
}
function geoDistrictRows(store,district){
 return (data.ownStores||[]).filter(s=>String(s.district||'').replace(/\s+/g,'')===district).map(own=>({own,distance:geoDistrictDistance(store,own)})).sort((a,b)=>{
  if(!!a.distance!==!!b.distance)return a.distance?-1:1;
  return (a.distance&&b.distance?a.distance.distanceMeters-b.distance.distanceMeters:0)||a.own.name.localeCompare(b.own.name,'zh-CN');
 });
}
function geoDistrictQueryState(query,district){
 if(geoUi.busy)return {label:'查询中',tone:'blue'};
 if(geoUi.failedDistrict===district||query?.lastAttempt?.status==='failed'||query?.status==='failed')return {label:'查询失败',tone:'red'};
 if(!query)return {label:'待查询',tone:'amber'};
 if(query.queryVersion!==2)return {label:'待重新查询',tone:'amber'};
 return query.status==='complete'?{label:'查询完成',tone:'teal'}:{label:'查询未完成',tone:'amber'};
}
function geoDistrictOwnItem(row,store,own,source){
 const s=row.own,distance=row.distance,disabled=geoUi.busy||!validGeoLocation(store?.mapLocation?.location)||!validGeoLocation(s.mapLocation?.location);
 return '<article class="geo-own-item" data-district-own-store="'+esc(s.id)+'"><div class="geo-own-details"><strong>'+esc(s.name)+'</strong><p>'+esc(s.address||'地址尚未取得')+'</p><span class="geo-source-label">'+esc(source)+'</span>'+geoMapLink(s)+'</div><div class="geo-own-distance">'+(distance?'<strong class="mono">'+esc(formatStoreDistance(distance.distanceMeters))+'</strong><span>距所选竞品 · 直线</span>':'<strong class="dim">—</strong><span>距离待核对</span>')+'</div><button class="btn small" data-action="geo-select-own" data-id="'+esc(s.id)+'"'+(disabled?' disabled':'')+'>'+(own?.id===s.id?'当前对应本店':'设为对应本店')+'</button></article>';
}
function renderGeoSettings(){
 const selected=geoUi.storeId||state.storeId||data.stores[0]?.id||'',store=data.stores.find(s=>s.id===selected),own=matchedOwnStore(store),connected=geoUi.status?.connected;
 const district=geoUi.district||geoDistrictFor(store),code=GEO_DISTRICT_CODES[district],query=data.mapSearchSummary?.districts?.[code],allRows=code?geoDistrictRows(store,district):[],hits=new Set(query?.ownStoreIds||[]);
 const rows=allRows.filter(row=>hits.has(row.own.id)),queryState=geoDistrictQueryState(query,district),failed=queryState.label==='查询失败';
 const disabled=geoUi.busy?' disabled':'',hasResults=query&&query.status!=='failed'&&Number.isFinite(query.apiMatchedStoreCount);
 const choices=rows.map(row=>geoDistrictOwnItem(row,store,own,'高德查询结果')).join('');
 const failure=failed?'<p class="geo-query-warning" role="alert">本次高德查询未成功。'+(hasResults?'下方保留上次查询结果，请重新查询。':'暂时无法确认门店数量，请重新查询。')+'</p>':query?.status==='partial'?'<p class="geo-query-warning" role="status">本次查询未完成，当前仅展示已取得的门店，不能作为完整结果。</p>':'';
 const reasons={reportedTotalReached:'本条件分页已取完',noResults:'无匹配结果',unexpectedEmptyPage:'接口提前返回空页',repeatedPage:'接口返回重复页',apiResultLimit:'达到接口返回上限',requestFailed:'请求失败'};
 const audit=query?.queries?.length?'<details class="geo-query-audit"><summary>查看查询依据</summary><p>按所选行政区核对门店，补做上海范围查询和已登记分店名称核对；同一高德门店编号只计一次。</p><ul>'+query.queries.map(q=>'<li><strong>'+esc(q.keyword)+'</strong> · '+esc(q.purpose==='cityCrossCheck'?'上海范围交叉核对':q.purpose==='knownBranchCheck'?'分店名称核对':district)+'<span>返回 '+esc(q.returnedUniqueResults??'—')+' / 接口标示 '+esc(q.reportedResults??'—')+' 条 · '+esc(reasons[q.stopReason]||(q.paginationComplete?'分页已取完':'尚未取完'))+'</span></li>').join('')+'</ul></details>':'';
 $('#geoSettingsDialog').innerHTML='<div class="modal-header"><h2 id="geoSettingsTitle">本店门店与竞品距离</h2><button class="icon-btn" data-action="close-dialog" data-dialog="geoSettingsDialog" aria-label="关闭地图设置">'+icon('close',17)+'</button></div><div class="modal-body"><div class="geo-status">'+badge(connected?'高德已连接':'等待地图服务',connected?'teal':'amber')+'<span>'+esc(geoUi.message||'选择行政区，在线查询高德收录的醉清风门店。')+'</span></div>'+
 '<label class="label-small" for="geoCompetitor">竞品门店</label><select class="select" id="geoCompetitor"'+disabled+'>'+(data.stores.length?data.stores.map(s=>'<option value="'+esc(s.id)+'"'+(s.id===selected?' selected':'')+'>'+esc(s.name)+'</option>').join(''):'<option value="">尚未登记竞品门店</option>')+'</select>'+
 (store?'<div class="geo-competitor-info">'+badge(geoDistrictFor(store)||'所属区待核对','blue')+'<span>'+esc(store.address||'地址尚未取得')+'</span></div>':'')+
 '<div class="geo-district-controls"><label><span class="label-small">查询行政区</span><select class="select" id="geoDistrict"'+disabled+'><option value="">请选择行政区</option>'+Object.keys(GEO_DISTRICT_CODES).map(d=>'<option value="'+esc(d)+'"'+(d===district?' selected':'')+'>'+esc(d)+'</option>').join('')+'</select></label><button class="btn primary small" data-action="geo-discover"'+(!connected||!code||geoUi.busy?' disabled':'')+'>'+(geoUi.busy?'正在查询…':'重新查询'+esc(district||'本区')+'门店')+'</button></div>'+
 (!connected?'<div class="geo-credential-fields"><p class="section-note">填写高德 Web端 Key 和对应安全密钥，仅存于本机地图服务内存。</p><label class="label-small" for="geoKey">Web端 Key</label><input id="geoKey" class="input" type="password" autocomplete="off"><label class="label-small" for="geoSecurity">安全密钥</label><input id="geoSecurity" class="input" type="password" autocomplete="off"><button class="btn primary small" data-action="geo-connect"'+disabled+'>连接高德</button></div>':'')+
 '<section class="geo-district-section" aria-label="所选行政区的高德查询结果"><div class="geo-district-heading"><h3>'+esc(district?district+' · 高德门店查询':'请选择行政区')+'</h3>'+badge(queryState.label,queryState.tone)+'</div>'+failure+'<div class="geo-district-stats"><div><span>高德查询匹配</span><strong data-api-store-count>'+(hasResults?query.apiMatchedStoreCount+'<small> 家</small>':'—')+'</strong></div><p>'+(query?.searchedAt?'结果时间：'+esc(exactDateText(query.searchedAt)):'尚未在线查询。选择区域后自动查询。')+'</p></div>'+
 '<div class="geo-own-list geo-api-results">'+(choices||'<div class="drawer-empty">'+(geoUi.busy?'正在查询'+esc(district)+'的高德门店…':hasResults?'本次高德查询未返回匹配门店。':'查询成功后，在这里显示高德返回的门店。')+'</div>')+'</div><p class="section-note">仅统计高德查询匹配门店。未被高德收录的门店不会自动出现在此结果中。</p>'+audit+'</section>'+
 '<div class="geo-tools"><button class="btn small" data-action="geo-recompute"'+(!connected||!code||geoUi.busy?' disabled':'')+'>更新本区距离</button><button class="btn small" data-action="geo-resolve"'+(!connected||!store||geoUi.busy?' disabled':'')+'>高德定位这家竞品</button>'+(store?geoMapLink(store):'')+'</div>'+
 (geoUi.candidates.length?'<div class="geo-candidates"><h3>请按名称和地址选择竞品点位</h3>'+geoUi.candidates.map(p=>'<article class="geo-own-item"><div><strong>'+esc(p.name)+'</strong><p>'+esc(p.address)+'</p></div><button class="btn small" data-action="geo-select-poi" data-id="'+esc(p.poiId)+'">使用此点位</button></article>').join('')+'</div>':'')+'</div>';
}
function changeGeoSelection(kind,value){
 if(geoUi.busy)return;
 if(kind==='competitor'){geoUi.storeId=value;geoUi.district=geoDistrictFor(data.stores.find(s=>s.id===value))}else geoUi.district=value;
 geoUi.message='';geoUi.failedDistrict='';geoUi.candidates=[];renderGeoSettings();
 if(geoUi.status?.connected&&GEO_DISTRICT_CODES[geoUi.district])runGeoAction('discover',null,{force:false});
}
async function openGeoSettings(storeId){
 geoUi.storeId=storeId||state.storeId||data.stores[0]?.id||null;geoUi.district=geoDistrictFor(data.stores.find(s=>s.id===geoUi.storeId));geoUi.message='';geoUi.failedDistrict='';geoUi.candidates=[];renderGeoSettings();showDialog('geoSettingsDialog');
 try{mergeGeoData(await geoRequest('status'));renderGeoSettings();if(geoUi.status?.connected&&GEO_DISTRICT_CODES[geoUi.district])await runGeoAction('discover',null,{force:false})}catch(error){geoUi.message=error.message;renderGeoSettings()}
}
async function runGeoAction(action,id,options={}){
 if(geoUi.busy)return;
 const key=$('#geoKey')?.value||'',security=$('#geoSecurity')?.value||'';
 const storeId=$('#geoCompetitor')?.value||geoUi.storeId||state.storeId||data.stores[0]?.id;
 const store=data.stores.find(s=>s.id===storeId),district=$('#geoDistrict')?.value||geoUi.district||geoDistrictFor(store);
 geoUi.storeId=storeId;geoUi.district=district;geoUi.busy=true;geoUi.failedDistrict='';geoUi.message='正在通过高德查询'+(district||'所选行政区')+'，请稍候…';renderGeoSettings();let queryAfterConnect=false;
 try{
  const route={connect:'connect',discover:'district-own-stores',resolve:'resolve',recompute:'recompute',selectOwn:'select-own',selectPoi:'resolve'}[action];
  const payload=action==='connect'?{key,securityJsCode:security}:action==='selectOwn'?{storeId,ownStoreId:id}:action==='selectPoi'?{storeId,poiId:id}:action==='resolve'?{storeId}:{storeId,district,force:action==='discover'&&options.force!==false};
  const result=await geoRequest(route,payload);mergeGeoData(result);saveData();const query=result.searchSummary?.districts?.[GEO_DISTRICT_CODES[district]];geoUi.message=action==='discover'?(query?.lastAttempt?.status==='failed'?'本次高德查询失败，请重试':query?.status==='partial'?'高德查询尚未完成，请核对查询依据':'已查询'+district+'，高德匹配 '+(query?.apiMatchedStoreCount??'—')+' 家门店'):action==='connect'?'已连接高德地图':'已更新本店与距离';geoUi.candidates=[];refreshGeoFragments();queryAfterConnect=action==='connect'&&!!GEO_DISTRICT_CODES[district];
 }catch(error){geoUi.message=error.message;geoUi.candidates=error.candidates||[];if(action==='discover')geoUi.failedDistrict=district}finally{geoUi.busy=false;renderGeoSettings()}
 if(queryAfterConnect)await runGeoAction('discover',null,{force:false});
}


const state={route:'stores',storeId:null,expandedOwnGroups:{},preview:false,tab:'catalog',storePage:1,productPage:1,storeSearch:'',brand:'',district:'',business:'',capture:'',storeSort:'recent',category:'',productSearch:'',productSort:'source',reviewUnreadable:false};
let toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3500)}
function normalize(payload){
  if(!payload||typeof payload!=='object'||Array.isArray(payload))throw new Error('资料内容应为一个 JSON 对象');
  if(payload.schemaVersion!==undefined&&payload.schemaVersion!==1)throw new Error('不支持这个资料版本，请使用版本1的备份');
  const out={schemaVersion:1};
  for(const key of ['stores','categories','products','observations']){if(!Array.isArray(payload[key]))throw new Error('资料缺少 '+key+' 数组');out[key]=clone(payload[key]);const ids=new Set();for(const row of out[key]){if(!row||typeof row!=='object'||Array.isArray(row)||typeof row.id!=='string'||!row.id.trim())throw new Error(key+' 中有记录缺少编号');if(ids.has(row.id))throw new Error(key+' 中存在重复编号');ids.add(row.id);if(key==='stores'&&(!has(row.name)||typeof row.name!=='string'))throw new Error('店铺名称不能为空');if(['categories','products'].includes(key)&&(!has(row.name)||typeof row.name!=='string'))throw new Error('分类或商品名称不能为空')}}

  if(payload.ownStores!==undefined&&!Array.isArray(payload.ownStores))throw new Error('本店资料 ownStores 应为数组');
  out.ownStores=clone(payload.ownStores||[]);const ownIds=new Set();
  for(const row of out.ownStores){if(!row||typeof row.id!=='string'||!row.id.trim()||!has(row.name)||ownIds.has(row.id))throw new Error('本店资料缺少名称、编号或存在重复编号');ownIds.add(row.id);if(row.mapLocation?.location&&!validGeoLocation(row.mapLocation.location))throw new Error('本店坐标无效，应为高德上海经纬度')}
  if(payload.mapSearchSummary&&typeof payload.mapSearchSummary==='object')out.mapSearchSummary=clone(payload.mapSearchSummary);
  const stores=new Set(out.stores.map(s=>s.id));const cats=new Map(out.categories.map(c=>[c.id,c]));
  for(const key of ['categories','products','observations'])for(const row of out[key])if(!stores.has(row.storeId))throw new Error('发现未关联到有效店铺的'+({categories:'分类',products:'商品',observations:'采集记录'}[key]));
  for(const row of out.products){if(has(row.categoryId)&&(!cats.has(row.categoryId)||cats.get(row.categoryId).storeId!==row.storeId))throw new Error('商品关联的分类不属于同一家店铺');if(row.variants!==undefined&&!Array.isArray(row.variants))throw new Error('商品规格 variants 应为数组');if(row.variants?.some(v=>!v||typeof v!=='object'||Array.isArray(v)))throw new Error('规格明细中包含无效记录')}
  for(const row of out.observations){if(!['complete','partial','failed','pending'].includes(row.status))throw new Error('采集状态应为 complete、partial、failed 或 pending');for(const key of ['onSaleProductCount','categoryCount'])if(has(row[key])&&(!Number.isInteger(Number(row[key]))||Number(row[key])<0))throw new Error('在售数量和分类数量应为非负整数或空值');for(const key of ['offers','screenshots'])if(row[key]!==undefined&&!Array.isArray(row[key]))throw new Error('活动与截图明细应为数组');if(row.offers?.some(v=>!v||typeof v!=='object'||Array.isArray(v)))throw new Error('活动明细中包含无效记录')}
  const obs=new Map(out.observations.map(o=>[o.id,o]));
  for(const key of ['categories','products'])for(const row of out[key])if(has(row.observationId)&&(!obs.has(row.observationId)||obs.get(row.observationId).storeId!==row.storeId))throw new Error('分类或商品关联的采集记录不属于同一家店铺');
  return out;
}

function compactLocalData(payload){
 const out=clone(payload), seedProducts=new Map(EMBEDDED_SEED.products.map(p=>[p.id,p])), seedObservations=new Map(EMBEDDED_SEED.observations.map(o=>[o.id,o]));
 for(const p of out.products){const seed=seedProducts.get(p.id);if(seed?.imageUrl&&p.imageUrl===seed.imageUrl){p._embeddedImageId=p.id;delete p.imageUrl}}
 for(const o of out.observations){const seed=seedObservations.get(o.id);if(!seed)continue;for(let i=0;i<(o.screenshots||[]).length;i++){const shot=o.screenshots[i];if(shot&&typeof shot==='object'&&shot.url===seed.screenshots?.[i]?.url){shot._embeddedScreenshotIndex=i;delete shot.url}}}
 return out;
}
function hydrateOrderMetadata(payload){
 const stores=new Map(EMBEDDED_SEED.stores.map(s=>[s.id,s]));
 for(const s of Array.isArray(payload.stores)?payload.stores:[]){const seed=stores.get(s?.id);if(seed?.avatarUrl&&!has(s.avatarUrl)){s.avatarUrl=seed.avatarUrl;if(!s.avatarSource&&seed.avatarSource)s.avatarSource=clone(seed.avatarSource)}}
 const products=new Map(EMBEDDED_SEED.products.map(p=>[p.id,p])),categories=new Map(EMBEDDED_SEED.categories.map(c=>[c.id,c])),observations=new Map(EMBEDDED_SEED.observations.map(o=>[o.id,o]));
 for(const p of Array.isArray(payload.products)?payload.products:[]){const seed=products.get(p?.id);if(seed&&p.observationId===seed.observationId&&!p.categoryPlacements&&seed.categoryPlacements)p.categoryPlacements=clone(seed.categoryPlacements)}
 for(const c of Array.isArray(payload.categories)?payload.categories:[]){const seed=categories.get(c?.id);if(seed&&c.observationId===seed.observationId&&!c.orderEvidence&&seed.orderEvidence)c.orderEvidence=clone(seed.orderEvidence)}
 for(const o of Array.isArray(payload.observations)?payload.observations:[]){const seed=observations.get(o?.id);if(seed){if(!o.screenshotBasePath)o.screenshotBasePath=seed.screenshotBasePath;if(!o.categoryOrderRecovery&&seed.categoryOrderRecovery)o.categoryOrderRecovery=clone(seed.categoryOrderRecovery)}}
 if(Array.isArray(payload.observations)&&Array.isArray(payload.stores)){const storeIds=new Set(payload.stores.map(s=>s.id)),ids=new Set(payload.observations.map(o=>o.id));for(const o of EMBEDDED_SEED.observations)if(o.recordType==='orderBuyerSignal'&&storeIds.has(o.storeId)&&!ids.has(o.id)){payload.observations.push(clone(o));ids.add(o.id)}}

 const own=new Map((Array.isArray(payload.ownStores)?payload.ownStores:[]).map(s=>[s.id,s]));for(const row of EMBEDDED_SEED.ownStores||[]){const saved=own.get(row.id);if(!saved||stamp(row.mapLocation?.lookedUpAt)>stamp(saved.mapLocation?.lookedUpAt))own.set(row.id,{...saved,...clone(row)})}payload.ownStores=[...own.values()];
 for(const s of Array.isArray(payload.stores)?payload.stores:[]){const seed=stores.get(s?.id);if(!seed)continue;if(seed.mapLocation&&(!s.mapLocation||stamp(seed.mapLocation.lookedUpAt)>stamp(s.mapLocation.lookedUpAt)))s.mapLocation=clone(seed.mapLocation);if(seed.ownStoreMatch&&(!s.ownStoreMatch||stamp(seed.ownStoreMatch.computedAt)>stamp(s.ownStoreMatch.computedAt)))s.ownStoreMatch=clone(seed.ownStoreMatch)}
 for(const s of Array.isArray(payload.stores)?payload.stores:[]){const seed=stores.get(s?.id);if(!seed?.ownStoreDistances)continue;s.ownStoreDistances=s.ownStoreDistances||{};for(const [id,row] of Object.entries(seed.ownStoreDistances))if(!s.ownStoreDistances[id]||stamp(row.computedAt)>stamp(s.ownStoreDistances[id].computedAt))s.ownStoreDistances[id]=clone(row);}
 if(EMBEDDED_SEED.mapSearchSummary&&(!payload.mapSearchSummary||stamp(EMBEDDED_SEED.mapSearchSummary.recheckedAt||EMBEDDED_SEED.mapSearchSummary.searchedAt)>stamp(payload.mapSearchSummary.recheckedAt||payload.mapSearchSummary.searchedAt)))payload.mapSearchSummary=clone(EMBEDDED_SEED.mapSearchSummary);
 return payload;
}
function hydrateLocalData(payload){
 if(!payload||typeof payload!=='object')return payload;
 const seedProducts=new Map(EMBEDDED_SEED.products.map(p=>[p.id,p])),seedObservations=new Map(EMBEDDED_SEED.observations.map(o=>[o.id,o]));
 for(const p of Array.isArray(payload.products)?payload.products:[]){if(p?._embeddedImageId){p.imageUrl=seedProducts.get(p._embeddedImageId)?.imageUrl||null;delete p._embeddedImageId}}
 for(const o of Array.isArray(payload.observations)?payload.observations:[]){const seed=seedObservations.get(o.id);for(const shot of Array.isArray(o.screenshots)?o.screenshots:[]){if(shot&&typeof shot==='object'&&Number.isInteger(shot._embeddedScreenshotIndex)){shot.url=seed?.screenshots?.[shot._embeddedScreenshotIndex]?.url||null;delete shot._embeddedScreenshotIndex}}}
 return hydrateOrderMetadata(payload);
}

function saveData(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(compactLocalData(data)));storageProblem='';updateStorageIndicator();return true}catch{storageProblem='当前浏览器无法保存资料。请使用“资料备份”导出，避免关闭页面后丢失。';updateStorageIndicator();return false}}
function updateStorageIndicator(){$('#localState').innerHTML='<span class="dot'+(storageProblem?' warn':'')+'"></span>'+(storageProblem?'暂未保存':'本地保存');$('#localState').title=storageProblem||'资料保存在当前浏览器，可导出备份'}
function mergeCollectionSnapshot(payload){
 if(!payload||typeof payload!=='object')return payload;
 for(const group of ['stores','ownStores','categories','products','observations']){
  const records=new Map((payload[group]||[]).map(row=>[row.id,row]));
  for(const seed of EMBEDDED_SEED[group]||[]){const old=records.get(seed.id),row={...(old||{}),...clone(seed)};if(group==='stores'&&old?.note)row.note=old.note;if(old?.operatorNote)row.operatorNote=old.operatorNote;records.set(seed.id,row)}
  payload[group]=[...records.values()];
 }
 return payload;
}
function readData(){try{const raw=localStorage.getItem(STORAGE_KEY);if(raw)data=normalize(mergeCollectionSnapshot(hydrateLocalData(JSON.parse(raw))))}catch{storageProblem='本地资料未能读取。原记录未被覆盖，你可以尝试从备份导入。'}updateStorageIndicator()}
function isOrderBuyerRecord(o){return o?.recordType==='orderBuyerSignal'}
function latestValidRecord(storeId){return observationsFor(storeId).find(o=>['complete','partial'].includes(o.status))||null}
function latestOrderBuyerRecord(storeId){return observationsFor(storeId).find(o=>isOrderBuyerRecord(o)&&['complete','partial'].includes(o.status)&&has(o.orderBuyerSignal?.rawText))||null}
function exactDateText(value){
  if(!has(value))return '尚未采集';const date=new Date(value);if(Number.isNaN(date.getTime()))return String(value);
  const parts=Object.fromEntries(new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date).map(p=>[p.type,p.value]));
  return parts.year+'-'+parts.month+'-'+parts.day+' '+parts.hour+':'+parts.minute+(/T\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(String(value))?'':':'+parts.second);
}

function latestRecentOrderBuyerRecord(storeId){return observationsFor(storeId).find(o=>['complete','partial'].includes(o.status)&&has(o.recentOrderBuyerSignal?.rawText))||null}
function buyerMinuteDateText(value){return exactDateText(value).slice(0,16)}
function recordedBuyerClock(record){const at=record.recentOrderBuyerSignal?.capturedAt||record.sourceVideo?.recordedAt;return at?buyerMinuteDateText(at)+'（精确到分钟）':record.sourceVideo?.recordedClockTime||'录制时间未核实'}
function buyerSignalVideoPosition(record,signal){
 if(signal.sourceMedia?.videoTimeLabel)return signal.sourceMedia.videoTimeLabel;
 const m=String(signal.sourceScreenshot||'').match(/frame_(\d+)\./),fps=record.sourceVideo?.samplingFramesPerSecond;
 if(!m||!Number.isFinite(fps)||fps<=0)return '未记录';const t=(Number(m[1])-1)/fps;
 return String(Math.floor(t/60)).padStart(2,'0')+':'+(t%60).toFixed(2).padStart(5,'0');
}
function recentOrderBuyerPanel(record){
 const signal=record.recentOrderBuyerSignal,h=signal.windowHours,position=buyerSignalVideoPosition(record,signal),dated=has(signal.capturedAt),window=signal.windowStart&&signal.windowEnd?'约 '+buyerMinuteDateText(signal.windowStart)+' 至 '+buyerMinuteDateText(signal.windowEnd):'最近'+h+'小时；录制日期尚未确认';
 return '<section class="panel order-buyer-panel" aria-label="页面下单人数，'+esc(h)+'小时口径"><div class="order-buyer-overview"><div class="label-small">近'+esc(h)+'h下单人数 · 页面原文</div><div class="order-buyer-value">'+esc(signal.rawText)+'</div><p class="section-note">人数口径，不等于订单笔数。</p>'+(record.recentViewerSignal?.rawText?'<p class="section-note">浏览人数 · '+esc(record.recentViewerSignal.rawText)+'</p>':'')+'</div><div class="order-buyer-times"><div><span class="label-small">记录时间（北京时间）</span><strong>'+esc(recordedBuyerClock(record))+'</strong></div><div><span class="label-small">以记录时间回推'+esc(h)+'小时的参考区间</span><span>'+esc(window)+'</span></div><div><span class="label-small">原始录屏位置</span><span>'+esc(position)+'</span></div><p class="section-note">'+(dated?(record.sourceVideo?.recordedDateSource==='videoContainerMetadata'?'日期依据视频元数据，画面未直接显示日期；时间取录屏左上角，保留到分钟。':'日期由用户确认；时间取录屏左上角状态栏，保留到分钟。'):'时间取录屏左上角状态栏，日期待确认。')+'</p></div><button class="btn small" data-action="order-buyer-evidence" data-id="'+esc(record.id)+'">'+icon('image',14)+'查看原始截图</button></section>';
}
function openRecentOrderBuyerEvidence(record){
 const signal=record.recentOrderBuyerSignal,target=record.screenshotBasePath+'/'+signal.sourceScreenshot,url=safeImage(target);
 const image=record.screenshots?.find(s=>s&&safeImage(s.url)&&(String(s.url||'').endsWith('/'+signal.sourceScreenshot)||safeImage(s.url)===url))||(url?{url:target}:null);if(!image)return;
 $('#imageDialog').innerHTML='<div class="modal-header"><h2 id="imageTitle">'+esc(signal.rawText)+'</h2><button class="icon-btn" data-action="close-dialog" data-dialog="imageDialog" aria-label="关闭截图">'+icon('close',17)+'</button></div><div class="modal-body"><p class="section-note">录屏位置：'+esc(buyerSignalVideoPosition(record,signal))+'<br>记录时间：'+esc(recordedBuyerClock(record))+'<br>页面人数为最近'+esc(signal.windowHours)+'小时口径；'+(record.sourceVideo?.recordedDateSource==='videoContainerMetadata'?'日期依据视频元数据，画面未直接显示日期；':'日期由用户确认；')+'时间取录屏左上角。</p><img src="'+esc(safeImage(image.url))+'" alt="'+esc(signal.rawText)+'的原始录屏帧"></div>';showDialog('imageDialog');
}

function orderBuyerCell(storeId){
  const record=latestOrderBuyerRecord(storeId);if(!record){const recent=latestRecentOrderBuyerRecord(storeId);return recent?'<span class="cell-title">'+esc(recent.recentOrderBuyerSignal.rawText)+'</span><span class="cell-sub">录屏 '+esc(recordedBuyerClock(recent))+'</span>':'<span class="dim">—</span><span class="cell-sub">尚未采集</span>';}
  return '<span class="cell-title">'+esc(record.orderBuyerSignal.rawText)+'</span><span class="cell-sub">'+(record.orderBuyerSignal.timeSource==='screenshotFilename'?'截图 ':'采集 ')+esc(exactDateText(record.orderBuyerSignal.capturedAt))+'</span>';
}
function orderBuyerPanel(storeId,preview=false){
  const record=preview?null:latestOrderBuyerRecord(storeId),signal=record?.orderBuyerSignal,viewer=record?.recentViewerSignal,isScreenshot=signal?.timeSource==='screenshotFilename';
  if(!signal&&!preview){const recent=latestRecentOrderBuyerRecord(storeId);if(recent)return recentOrderBuyerPanel(recent);}
  return '<section class="panel order-buyer-panel" aria-label="近24小时下单人数"><div class="order-buyer-overview"><div class="label-small">近24h下单人数 · 页面原文</div><div class="order-buyer-value">'+(signal?esc(signal.rawText):'<span class="dim">—</span>')+'</div><p class="section-note">人数口径，不等于订单笔数。</p>'+(viewer?'<p class="section-note"><strong>'+esc(viewer.rawText)+'</strong></p>':'')+'</div><div class="order-buyer-times"><div><span class="label-small">'+(isScreenshot?'截图时间（北京时间）':'采集时间（北京时间）')+'</span><strong>'+esc(signal?exactDateText(signal.capturedAt):'尚未采集')+'</strong></div><div><span class="label-small">'+(isScreenshot?'以截图时刻回推24小时的参考区间':'以采集时刻回推24小时的区间')+'</span><span>'+(signal?esc(exactDateText(signal.windowStart))+' 至 '+esc(exactDateText(signal.windowEnd)):'采集后记录起止时间')+'</span></div>'+(viewer?'<div><span class="label-small">浏览人数对应3小时的参考区间</span><span>'+esc(exactDateText(viewer.windowStart))+' 至 '+esc(exactDateText(viewer.windowEnd))+'</span></div>':'')+'<p class="section-note">'+(isScreenshot?'按截图文件名时间记录，状态栏时间相符；不是本次读取时间。':'按采集时刻回推24小时记录；历次快照分别保存。')+'</p></div>'+(record?'<button class="btn small" data-action="order-buyer-evidence" data-id="'+esc(record.id)+'">'+icon('image',14)+'查看原始截图</button>':'')+'</section>';
}
function openOrderBuyerEvidence(id){
  const recent=data.observations.find(o=>o.id===id&&has(o.recentOrderBuyerSignal?.rawText));if(recent&&!recent.orderBuyerSignal)return openRecentOrderBuyerEvidence(recent);
  const record=data.observations.find(o=>o.id===id&&isOrderBuyerRecord(o)),signal=record?.orderBuyerSignal;
  const image=record?.screenshots?.find(s=>s&&safeImage(s.url));if(!signal||!image)return;
  $('#imageDialog').innerHTML='<div class="modal-header"><h2 id="imageTitle">'+esc(signal.rawText)+'</h2><button class="icon-btn" data-action="close-dialog" data-dialog="imageDialog" aria-label="关闭截图">'+icon('close',17)+'</button></div><div class="modal-body"><p class="section-note">采集时间：'+esc(exactDateText(signal.capturedAt))+'（北京时间）<br>回推24小时区间：'+esc(exactDateText(signal.windowStart))+' 至 '+esc(exactDateText(signal.windowEnd))+'<br>页面原文按人数记录。</p><img src="'+esc(safeImage(image.url))+'" alt="'+esc(signal.rawText)+'的原始门店页面"></div>';
  showDialog('imageDialog');
}
function observationsFor(storeId){return data.observations.filter(o=>o.storeId===storeId).sort((a,b)=>stamp(b.capturedAt)-stamp(a.capturedAt))}
function latest(storeId){return observationsFor(storeId).find(o=>!isOrderBuyerRecord(o)&&(o.status==='complete'||o.status==='partial'))||null}
function captureDisplayState(record){
  if(record?.status==='partial'&&record.merchantListsComplete)return 'merchantComplete';
  return record?.status||'pending';
}
function captureState(storeId){
  const records=observationsFor(storeId);
  return captureDisplayState(records.find(o=>!isOrderBuyerRecord(o))||records[0]);
}
function currentRows(group,storeId,observation){const all=data[group].filter(r=>r.storeId===storeId);if(all.some(r=>has(r.observationId)))return observation?all.filter(r=>r.observationId===observation.id):[];return all}
function categoryTotal(observation,categories){if(!observation)return null;if(has(observation.categoryCount))return observation.categoryCount;return observation.categoriesComplete===true?categories.length:null}
function metric(label,value,foot,name,unit='',isText=false){return '<div class="metric"><div class="metric-label">'+esc(label)+'</div>'+(name?'<span class="metric-icon">'+icon(name,17)+'</span>':'')+'<div class="metric-value'+(isText?' text-value':'')+'">'+value+(unit?'<span class="metric-unit">'+esc(unit)+'</span>':'')+'</div><div class="metric-foot">'+esc(foot)+'</div></div>'}
function paginate(total,page,size,kind){const pages=Math.max(1,Math.ceil(total/size));return '<div class="pagination"><span>共 '+total+' '+(kind==='store'?'家店铺':'项商品')+' · 每页 '+size+' '+(kind==='store'?'家':'项')+'</span><div class="pagination-buttons"><button class="icon-btn" data-action="page" data-kind="'+kind+'" data-page="'+(page-1)+'" aria-label="上一页"'+(page<=1?' disabled':'')+'>'+icon('left',14)+'</button><span class="page-current">'+page+' / '+pages+'</span><button class="icon-btn" data-action="page" data-kind="'+kind+'" data-page="'+(page+1)+'" aria-label="下一页"'+(page>=pages?' disabled':'')+'>'+icon('right',14)+'</button></div></div>'}
function warning(){return storageProblem?'<div class="storage-warning" role="alert">'+esc(storageProblem)+'</div>':''}
function render(){
  $('#navStores').classList.toggle('active',state.route!=='records');
  $('#navRecords').classList.toggle('active',state.route==='records');
  if(state.route==='detail'&&!state.preview&&window.PUBLIC_MANIFEST.storePacks?.[state.storeId]&&!window.PUBLIC_STORE_READY[state.storeId]){
    $('#main').innerHTML=publicStoreLoadingMarkup(state.storeId);
    if(!window.PUBLIC_STORE_ERRORS[state.storeId])publicLoadStore(state.storeId).catch(()=>{});
    return;
  }
  $('#main').innerHTML=warning()+(state.route==='detail'?renderDetail():state.route==='records'?renderRecords():renderStores());
  fillIcons();
}
function fillIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon,16)})}
function renderStores(){
  const collected=data.stores.filter(s=>observationsFor(s.id).some(o=>['complete','partial'].includes(o.status))).length;
  const last=data.observations.filter(o=>o.status==='complete'||o.status==='partial').sort((a,b)=>stamp(b.capturedAt)-stamp(a.capturedAt))[0];
  const brands=[...new Set(data.stores.map(s=>s.brand).filter(has))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
  return '<section aria-labelledby="storesTitle"><div class="page-head"><div><div class="eyebrow">SHANGHAI · COMPETITOR OBSERVATORY</div><h1 id="storesTitle">竞品店铺<span class="badge teal" style="vertical-align:middle;margin-left:12px">上海</span></h1><p class="page-description">从一间门店开始，把评分、分类与商品放在同一张表里。</p></div><div class="actions"><button class="btn" data-action="preview">'+icon('layers',16)+'预览空白详情</button><button class="btn primary" data-action="add-store">'+icon('plus',17)+'添加竞品店铺</button></div></div>'+
    '<div class="metric-grid">'+metric('已登记店铺',data.stores.length,'已建立的真实店铺档案','store','家')+metric('已采集店铺',collected,'至少有一次有效采集记录','check','家')+metric('待采集店铺',data.stores.length-collected,'经营信息尚未取得','clock','家')+metric('最近采集',last?esc(dateText(last.capturedAt,true)):'<span class="dim">—</span>',last?'仅统计有效采集记录':'尚无采集记录','refresh','',true)+'</div>'+
    '<div class="panel"><div class="panel-heading"><div class="heading-with-count"><h2>店铺资料</h2><span class="count-pill">'+data.stores.length+' 家</span></div><label><span class="label-small" style="display:none">店铺排序</span><select class="select compact" id="storeSort" aria-label="店铺排序"><option value="recent"'+(state.storeSort==='recent'?' selected':'')+'>最近采集优先</option><option value="rating"'+(state.storeSort==='rating'?' selected':'')+'>评分从高到低</option><option value="name"'+(state.storeSort==='name'?' selected':'')+'>按店铺名称</option></select></label></div>'+
    '<div class="filters"><div class="field-control">'+icon('search',16)+'<input class="input" id="storeSearch" value="'+esc(state.storeSearch)+'" placeholder="搜索店铺名称、品牌或地址" aria-label="搜索竞品店铺"></div>'+
    '<select class="select" id="brandFilter" aria-label="按品牌筛选">'+options(brands,state.brand,'全部品牌')+'</select>'+
    '<select class="select" id="districtFilter" aria-label="按上海行政区筛选">'+options(DISTRICTS,state.district,'全部行政区')+'</select>'+
    '<select class="select" id="businessFilter" aria-label="按营业状态筛选">'+[['','全部营业状态'],['open','营业中'],['closed','休息中'],['suspended','暂停营业'],['unknown','状态未采集']].map(v=>'<option value="'+v[0]+'"'+(v[0]===state.business?' selected':'')+'>'+v[1]+'</option>').join('')+'</select>'+
    '<select class="select" id="captureFilter" aria-label="按采集状态筛选">'+[['','全部采集状态'],['pending','待采集'],['partial','部分采集'],['merchantComplete','普通分类已采集'],['complete','列表采集完成'],['failed','采集失败']].map(v=>'<option value="'+v[0]+'"'+(v[0]===state.capture?' selected':'')+'>'+v[1]+'</option>').join('')+'</select>'+
    '<button class="btn ghost small" data-action="reset-filters" title="清除搜索与筛选">'+icon('refresh',14)+'重置</button></div>'+
    '<div id="storeRows" class="store-groups">'+storeRowsMarkup()+'</div><div id="storePagination">'+storePaginationMarkup()+'</div></div>'+
    '<div class="context-grid"><div class="context-item">'+icon('info',23)+'<div><h3>未采集，和实际为零分开记录</h3><p>经营信息尚未取得时显示“—”，不会用0代替未知。</p></div></div><div class="context-item">'+icon('layers',23)+'<div><h3>页面在售数，和已收录数分开查看</h3><p>保留用户端数量口径，同时标注本次采集的完整程度。</p></div></div></div></section>';
}
function filteredStores(){
  const search=state.storeSearch.trim().toLocaleLowerCase();
  const list=data.stores.filter(s=>{
    const o=latest(s.id),biz=o?.businessStatus||s.businessStatus||'unknown';
    return (!search||[s.name,s.brand,s.address,s.district].join(' ').toLocaleLowerCase().includes(search))&&(!state.brand||s.brand===state.brand)&&(!state.district||s.district===state.district)&&(!state.business||biz===state.business)&&(!state.capture||captureState(s.id)===state.capture);
  });
  list.sort((a,b)=>{
    if(state.storeSort==='name')return a.name.localeCompare(b.name,'zh-CN');
    if(state.storeSort==='rating'){const av=latest(a.id)?.rating,bv=latest(b.id)?.rating,an=has(av)&&Number.isFinite(Number(av)),bn=has(bv)&&Number.isFinite(Number(bv));if(an!==bn)return an?-1:1;if(an&&Number(av)!==Number(bv))return Number(bv)-Number(av)}
    return stamp(latestValidRecord(b.id)?.capturedAt)-stamp(latestValidRecord(a.id)?.capturedAt)||stamp(b.registeredAt)-stamp(a.registeredAt);
  });
  state.storePage=Math.min(Math.max(1,state.storePage),Math.max(1,Math.ceil(list.length/20)));
  return list;
}
function competitorStoreGroups(stores){
  const groups=new Map();
  for(const store of stores){
    const own=matchedOwnStore(store),key=own?.id||'__unmatched__';
    if(!groups.has(key))groups.set(key,{key,own,stores:[]});
    groups.get(key).stores.push(store);
  }
  return [...groups.values()];
}
function toggleOwnStoreGroup(key){
  const group=[...document.querySelectorAll('[data-own-store-group]')].find(el=>el.dataset.ownStoreGroup===key);
  if(!group)return;
  const button=group.querySelector('[data-action="toggle-own-group"]'),list=group.querySelector('.own-competitor-list');
  if(!button||!list)return;
  const expanded=!Boolean(state.expandedOwnGroups[key]);
  state.expandedOwnGroups[key]=expanded;list.hidden=!expanded;
  button.setAttribute('aria-expanded',String(expanded));
  button.setAttribute('aria-label',(expanded?'收起':'展开')+(matchedOwnStoreGroupName(key))+'的竞品列表');
  button.innerHTML=(expanded?'收起':'展开')+icon(expanded?'up':'down',14);
}
function matchedOwnStoreGroupName(key){return data.ownStores.find(store=>store.id===key)?.name||'待关联本店'}
function competitorStoreRow(s){
  const o=latest(s.id),cats=currentRows('categories',s.id,o),catTotal=categoryTotal(o,cats),recent=latestValidRecord(s.id);
  const rating=has(o?.rating)?'<span class="score">'+icon('star',13)+esc(o.rating)+'</span>':'<span class="dim">—</span>';
  const distance=validStoreDistance(s)?'<span class="competitor-distance mono" title="高德计算 · '+esc(exactDateText(s.ownStoreMatch.computedAt))+'">'+esc(formatStoreDistance(s.ownStoreMatch.distanceMeters))+'</span>':'<span class="dim" aria-label="距本店距离待核对">—</span>';
  return '<tr class="click-row" tabindex="0" data-action="open-store" data-id="'+esc(s.id)+'" aria-label="查看'+esc(s.name)+'的店铺详情"><td><div class="store-cell">'+storeAvatarMarkup(s)+'<span><span class="cell-title">'+esc(s.name)+'</span><span class="cell-sub">'+esc(s.brand||'品牌未记录')+' · '+esc(s.platform||'来源未记录')+'</span></span></div></td><td class="competitor-distance-cell">'+distance+'</td><td>'+text(s.district)+'</td><td>'+rating+'</td><td>'+text(o?.displayedSales)+'</td><td>'+orderBuyerCell(s.id)+'</td><td class="store-stock-cell">'+text(o?.onSaleProductCountLabel??o?.onSaleProductCount)+(has(o?.onSaleProductCountLabel??o?.onSaleProductCount)?'<span class="cell-sub">'+esc(o.countUnit||'商品，按页面口径')+'</span>':'')+'</td><td>'+text(catTotal)+(o&&!has(catTotal)?'<span class="cell-sub">已收录 '+cats.length+' 类</span>':'')+'</td><td>'+captureBadge(captureState(s.id))+'</td><td><span class="cell-sub" style="margin:0">'+(recent?.recordingScopeComplete&&!recent.capturedAt?esc('整理 '+dateText(recent.videoImportedAt,true)):recent?esc(dateText(recent.capturedAt,true)):'尚未采集')+'</span></td><td class="row-arrow">'+icon('right',16)+'</td></tr>';
}
function storeRowsMarkup(){
  const list=filteredStores();
  if(!list.length){const noData=data.stores.length===0;return '<div class="empty-state">'+illustration()+'<h3>'+(noData?'还没有竞品店铺':'没有符合条件的店铺')+'</h3><p>'+(noData?'先建立店铺档案。评分、分类和商品信息将在采集后显示。<br>关联本店后，展开本店即可查看对应竞品及距离。':'试试其他关键词，或清除筛选条件查看全部店铺。')+'</p><div class="actions">'+(noData?'<button class="btn primary" data-action="add-store">'+icon('plus',16)+'添加第一家店铺</button><button class="btn ghost" data-action="preview">先看详情框架 '+icon('right',14)+'</button>':'<button class="btn" data-action="reset-filters">清除搜索与筛选</button>')+'</div></div>'}
  const allGroups=competitorStoreGroups(list),totals=new Map(allGroups.map(group=>[group.key,group.stores.length]));
  const ordered=allGroups.flatMap(group=>group.stores),page=ordered.slice((state.storePage-1)*20,state.storePage*20);
  return competitorStoreGroups(page).map(group=>{
    const own=group.own,total=totals.get(group.key),count=group.stores.length===total?'竞品 '+total+' 家':'本页 '+group.stores.length+' 家 / 共 '+total+' 家竞品';
    const expanded=Boolean(state.expandedOwnGroups[group.key]),listId='own-competitors-'+group.key,ownName=own?.name||'待关联本店';
    const heading='<div class="own-store-group-head"><div class="own-store-group-info"><h3 class="own-store-group-title"><span>本店铺：</span>'+esc(ownName)+ownStoreBusinessMarkup(own)+'</h3><p>'+esc(own?.address||'关联本店后展示竞品与本店之间的距离')+'</p></div><div class="own-group-actions"><span class="count-pill">'+count+'</span><button type="button" class="btn small own-group-toggle" data-action="toggle-own-group" data-id="'+esc(group.key)+'" aria-expanded="'+expanded+'" aria-controls="'+esc(listId)+'" aria-label="'+(expanded?'收起':'展开')+esc(ownName)+'的竞品列表">'+(expanded?'收起':'展开')+icon(expanded?'up':'down',14)+'</button></div></div>';
    return '<section class="store-group" data-own-store-group="'+esc(group.key)+'" aria-label="'+esc(ownName)+'的竞品门店">'+heading+'<div class="table-scroll own-competitor-list" id="'+esc(listId)+'"'+(expanded?'':' hidden')+'><table class="data-table grouped-store-table"><colgroup><col class="competitor-name-column"><col class="competitor-distance-column"><col style="width:72px"><col style="width:80px"><col style="width:98px"><col style="width:170px"><col><col style="width:74px"><col style="width:102px"><col style="width:105px"><col style="width:35px"></colgroup><thead><tr><th scope="col">竞品店铺 / 来源</th><th scope="col">距本店<span class="distance-unit">（直线）</span></th><th scope="col">所属区</th><th scope="col">店铺评分</th><th scope="col">页面展示销量</th><th scope="col">下单人数（页面口径）</th><th scope="col">页面标示在售</th><th scope="col">一级分类</th><th scope="col">采集状态</th><th scope="col">最近采集</th><th scope="col" aria-label="查看详情"></th></tr></thead><tbody>'+group.stores.map(competitorStoreRow).join('')+'</tbody></table></div></section>';
  }).join('');
}
function storePaginationMarkup(){const list=filteredStores();return paginate(list.length,state.storePage,20,'store')}
function refreshStores(){$('#storeRows').innerHTML=storeRowsMarkup();$('#storePagination').innerHTML=storePaginationMarkup()}
function getDetailContext(){
  const store=state.preview?{id:'__preview__',name:'店铺详情预览'}:data.stores.find(s=>s.id===state.storeId);
  if(!store)return null;const observation=state.preview?null:latest(store.id);
  const categories=state.preview?[]:currentRows('categories',store.id,observation).sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0));
  const products=state.preview?[]:currentRows('products',store.id,observation);
  return {store,observation,categories,products};
}
function userPauseBanner(ctx){
 const o=ctx.observation;if(!['userRequested','waitingForStorePage'].includes(o?.collectionPauseReason))return '';
 const c=o.resumeCheckpoint||{},last=c.lastVisibleItem?.name||'尚未记录';
 if(o.collectionPauseReason==='waitingForStorePage')return '<div class="preview-banner" role="status" data-collection-paused="true">'+icon('clock',17)+'<span><strong>采集已暂停，等待返回门店页面</strong><br>手机当前停在系统弹窗。已保留历史记录和今天的商品首屏；当前分类：'+esc(c.primaryCategory)+'，尚未完成。最后有效商品截图时间：'+esc(exactDateText(c.lastScreenAt))+'。</span></div>';
 if(c.pauseContext==='currentStoreMerchantListsFinished'&&o.merchantListsComplete)return '<div class="preview-banner" role="status" data-collection-paused="true">'+icon('clock',17)+'<span><strong>普通分类列表已采集</strong><br>已保存 '+ctx.products.length+' 条按完整名称合并的记录，'+esc(o.completedMerchantCategoryCount)+' 个普通一级类目已核对至末尾。推荐排序待核对，活动与健康卡见各入口记录，完整规格待补充。最后一张商品截图：'+esc(exactDateText(c.lastScreenAt))+'。</span></div>';
 const position=c.automaticReviewBlocked?esc(c.primaryCategory)+'类目尚未完成，仍需核对衔接缺口和类目末尾。自动审批已阻止继续滑动，手机操作已停止。':c.resumeFromCategoryStart?esc(c.lastCompletedCategory)+'类目已完成；明天从 '+esc(c.primaryCategory)+' 首屏开始。':'续采断点：'+esc(c.primaryCategory||'分类待核对')+' → '+esc(last)+'。';
 return '<div class="preview-banner" role="status" data-collection-paused="true">'+icon('clock',17)+'<span><strong>已按你的要求暂停采集</strong><br>已保存 '+ctx.products.length+' 条按名称去重记录；全店尚未完成。'+position+'断点截图时间：'+esc(exactDateText(c.lastScreenAt))+'。等待你再次明确指令后继续。</span></div>';
}
function collectionStoppedBanner(ctx){
 const o=ctx.observation;if(o?.priceReviewSummary){const r=o.priceReviewSummary;return '<div class="preview-banner" role="status"><span><strong>价格已按 '+esc(r.recordedDate)+' 新录屏复核</strong><br>已确认 '+r.clearPrices+' 条价格，'+r.unreadablePrices+' 条标记未看清；另 '+r.notVerifiedInNewRecording+' 条沿用原录屏价格，每条单独注明。'+(r.listingDetailsUpdated?'可辨销量及优惠同步更新；分类顺序与匹对结论保留原记录。':'商品分类、销量与匹对结论保留原采集内容；')+'可在商品下方查看价格复核画面。</span></div>'}if(o?.recordingScopeComplete)return '<div class="preview-banner" role="status"><span><strong>用户录屏范围已整理完成</strong><br>商品保留一级分类、视频位置及来源画面；组包另存，推荐和活动不额外计数。资料整理：'+esc(exactDateText(o.videoImportedAt))+'。'+(o.sourceVideo?.recordedDate?'录屏首屏时间：'+esc(recordedBuyerClock(o))+'；':'实际录制时间未核实；')+'完整长标题、规格及精确全店在售总数未独立核验。</span></div>';if(!o?.collectionStopReason)return '';
 return '<div class="preview-banner" role="status" style="background:#fff7e8;border-color:#f0d9aa;color:#805b20">'+icon('info',17)+'<span><strong>采集已停止 · '+esc(o.collectionStopLabel||'手机出现身份核实')+'</strong><br>已保存 '+ctx.products.length+' 条商品记录；全店商品尚未采集完成。'+ctx.categories.length+' 项为已记录的分类名称，不代表每类商品均已采集。停止时间：'+esc(exactDateText(o.stoppedAt))+'。详细现场见“来源与记录”。</span></div>';
}
function isBundleCategory(category){return category?.bundleCategory===true||String(category?.name||'').normalize('NFKC').replace(/\s/g,'').includes('组包钜惠')}
function isPromotionEntry(category){return ['推荐','活动'].includes(String(category?.name||'').normalize('NFKC').replace(/\s/g,''))}
function catalogCountingScope(ctx){
 const uniqueProducts=[...new Map(ctx.products.map(p=>[p.id,p])).values()],knownIds=new Set(ctx.categories.map(c=>c.id));
 const categoryIds=new Set(ctx.categories.filter(isBundleCategory).map(c=>c.id)),entryCategoryIds=new Set(ctx.categories.filter(isPromotionEntry).map(c=>c.id));
 const names=new Map(ctx.categories.map(c=>[String(c.name).normalize('NFKC').replace(/\s/g,''),c.id]));
 const members=new Map(uniqueProducts.map(p=>[p.id,new Set([...(p.categoryIds||[]),...(p.categoryId?[p.categoryId]:[]),...Object.keys(p.categoryPlacements||{}),...(p.sourceCategoryNames||[]).map(n=>names.get(String(n).normalize('NFKC').replace(/\s/g,''))).filter(Boolean)])]));
 for(const c of ctx.categories)for(const row of c.listingSequence||[])members.get(row.productId)?.add(c.id);
 const bundleIds=new Set(),entryOnlyIds=new Set(),unknownCategoryIds=new Set(),sharedEntryIds=new Set();
 for(const [id,set] of members){
  if([...set].some(c=>categoryIds.has(c)))bundleIds.add(id);
  if(set.size&&[...set].every(c=>entryCategoryIds.has(c)))entryOnlyIds.add(id);
  if(![...set].some(c=>knownIds.has(c)))unknownCategoryIds.add(id);
  if([...set].some(c=>entryCategoryIds.has(c))&&[...set].some(c=>knownIds.has(c)&&!entryCategoryIds.has(c)))sharedEntryIds.add(id);
 }
 const excludedIds=new Set([...bundleIds,...entryOnlyIds,...unknownCategoryIds]),countedIds=new Set(uniqueProducts.filter(p=>!excludedIds.has(p.id)).map(p=>p.id));
 return {categoryIds,bundleIds,entryCategoryIds,entryOnlyIds,unknownCategoryIds,sharedEntryIds,excludedIds,countedIds,uniqueProducts,members,total:ctx.products.length,bundleCount:bundleIds.size,entryOnlyCount:entryOnlyIds.size,productCount:countedIds.size};
}
function productCountingText(scope){return '计入商品数 '+scope.productCount+' · 组包 '+scope.bundleCount+' 另存'+(scope.entryOnlyCount?' · 仅入口 '+scope.entryOnlyCount+' 暂不计':'')+' · 推荐/活动不另计数'}
function categoryQuantityText(ctx,c){
 const scope=catalogCountingScope(ctx),bundle=isBundleCategory(c),count=new Set(scope.uniqueProducts.filter(p=>(p.categoryId===c.id||p.categoryIds?.includes(c.id)||c.listingSequence?.some(r=>r.productId===p.id))&&(bundle||scope.countedIds.has(p.id))).map(p=>p.id)).size;
 if(bundle)return (c.bundleCategory?'套餐 ':'组包 ')+count;
 if(has(c.displayedProductCount))return '页面 '+esc(c.displayedProductCount);
 return count||c.allListComplete||ctx.observation?.productsComplete?'已录 '+count:'未采集';
}

function renderDetail(){
  const ctx=getDetailContext();if(!ctx){state.route='stores';return renderStores()}
  const scope=catalogCountingScope(ctx),s=ctx.store,o=ctx.observation,total=categoryTotal(o,ctx.categories),status=state.preview?'pending':captureState(s.id);
  return '<div class="breadcrumb"><button data-action="go-stores">店铺资料库</button>'+icon('right',12)+'<span>'+(state.preview?'空白详情预览':esc(s.name))+'</span></div>'+
    storeGeoPanel(s,state.preview)+collectionStoppedBanner(ctx)+userPauseBanner(ctx)+
    (state.preview?'<div class="preview-banner">'+icon('info',17)+'<span>正在预览空白详情。这里不代表真实门店，也不会计入店铺数量。</span></div>':'')+
    '<div class="page-head detail-head"><div class="store-profile">'+storeAvatarMarkup(s,true)+'<div><h1>'+esc(s.name)+'</h1><div class="profile-tags">'+(state.preview?badge('框架预览','blue'):badge(s.brand||'品牌未记录'))+badge(s.platform||'平台待补充')+badge(s.district||'所属区未记录')+businessBadge(o?.businessStatus||s.businessStatus)+'</div><div class="address-line">'+icon('pin',13)+'<span>'+esc(s.address||'详细地址尚未记录')+'</span></div></div></div><div class="actions">'+(state.preview?'<button class="btn primary" data-action="add-store">'+icon('plus',16)+'添加真实店铺</button>':'<button class="btn" data-action="edit-store" data-id="'+esc(s.id)+'">'+icon('edit',15)+'编辑档案</button>')+(state.preview?'':'<button class="btn primary" type="button" data-action="report-export">'+icon('download',15)+'导出报表</button>')+'<button class="btn" data-action="go-stores">'+icon('left',15)+'返回列表</button></div></div>'+
    '<div class="metric-grid detail-metrics">'+
    metric('店铺评分',has(o?.rating)?'<span style="color:#bd892c">'+esc(o.rating)+'</span>':'<span class="dim">—</span>','保留用户端展示值')+
    metric('页面展示销量',text(o?.displayedSales),'保留原始统计口径',null,'',true)+
    metric('页面商品数',text(o?.onSaleProductCountLabel??o?.onSaleProductCount),o?.countUnit||'数量与单位按页面记录')+
    metric('一级分类',text(total),has(total)?(o?.merchantCategoryCount!==undefined?'含推荐/活动入口；店铺分类'+o.merchantCategoryCount+'项':'页面展示或完整枚举的分类'):(o?'分类总数尚不确定':'尚未采集分类'))+
    metric('收录记录',o?scope.total:'<span class="dim">—</span>',o?productCountingText(scope):'尚未采集商品')+
    (o?.recordingScopeComplete?metric('录屏资料整理',esc(dateText(o.videoImportedAt,true)),o.sourceVideo?.recordedDate?'录屏首屏 '+buyerMinuteDateText(o.sourceVideo.recordedAt):'实际录制时间未核实',null,'',true):metric('商品资料采集',o?esc(dateText(o.capturedAt,true)):'<span class="dim">—</span>',o?({complete:'本次全店列表已采集',merchantComplete:'普通分类列表已采集，推荐排序待核对',partial:'本次为部分采集'}[captureDisplayState(o)]||'有效采集记录'):'尚无有效采集记录',null,'',true))+'</div>'+
    (status==='failed'?'<div class="preview-banner" style="background:#fff7f3;border-color:#f0ded6;color:#a16c4a">'+icon('info',17)+'<span>最近一次采集失败。上方经营信息保留自上次有效记录，详情见“来源与记录”。</span></div>':'')+
    orderBuyerPanel(s.id,state.preview)+
    '<nav class="tabs" aria-label="店铺详情栏目" role="tablist">'+[['catalog','分类与商品'],['delivery','配送与活动'],['sources','来源与记录'],['matching','匹对结果']].map(t=>'<button class="tab'+(state.tab===t[0]?' active':'')+'" role="tab" aria-selected="'+(state.tab===t[0])+'" aria-controls="detailContent" id="tab-'+t[0]+'" data-action="detail-tab" data-tab="'+t[0]+'">'+t[1]+(t[0]==='catalog'&&o?'<span class="tab-count">'+ctx.products.length+' 条已收录</span>':'')+'</button>').join('')+'</nav>'+
    '<section id="detailContent" role="tabpanel" aria-labelledby="tab-'+state.tab+'">'+renderDetailTab(ctx)+'</section>';
}
/* MATCHING_UI_START */
/* Captured storefront labels only. Never infer a sales count or its period. */
function matchSalesCapturedAt(value){
 if(!value)return '未记录';
 const date=new Date(value);
 if(!Number.isFinite(date.getTime()))return '时间未能识别';
 const parts=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date);
 const part=type=>parts.find(p=>p.type===type)?.value||'';
 return part('year')+'-'+part('month')+'-'+part('day')+' '+part('hour')+':'+part('minute')+':'+part('second');
}
function matchSaleDetailsMarkup(product){
 if(!product)return '';
 const recorded=value=>value!==null&&value!==undefined&&String(value).trim()!=='';
 const sales=recorded(product.displayedSales)?String(product.displayedSales):'未采集';
 const status=recorded(product.displayedSaleStatus)?String(product.displayedSaleStatus):'未采集';
 const salesProof=product.displayedSalesEvidence,salesMedia=salesProof?.sourceMedia||product.sourceMedia;
 return '<div class="match-sale-details" aria-label="对方售卖详情"><strong class="match-sale-title">对方售卖详情</strong><dl class="match-sale-facts"><div><dt>页面展示销量</dt><dd class="match-sale-count" data-sales-recorded="'+recorded(product.displayedSales)+'">'+esc(sales)+'</dd></div><div><dt>售卖状态</dt><dd>'+esc(status)+'</dd></div></dl><p class="match-sale-captured">采集时间（北京时间）：<time>'+esc(salesProof?'新录屏复核 '+salesProof.recordedDate+'（拍摄时刻未核实）':matchSalesCapturedAt(product.capturedAt))+'</time></p>'+(salesMedia?.type==='userProvidedVideo'?'<p class="match-sale-captured">录屏位置：'+esc(salesMedia.videoTimeLabel||'未记录')+' · '+(salesMedia.recordedDate?'资料日期 '+esc(salesMedia.recordedDate):'拍摄日期未核实')+'</p>':'')+'<p class="match-sale-note">采集时页面原文；未采集不代表0，不推算日销量。</p></div>';
}

/* Local product-pool comparison. Kept outside captured-store data and storage. */
const matchView={group:'all',search:'',category:'',status:'',page:1,origin:'comp'};
const MATCH_GROUPS=[['all','全部比对记录'],['common','已确认共有商品'],['pending','待确认商品'],['competitorOnly','对方有的我们没有的商品'],['ownOnly','对方没有我们有的商品'],['bundles','组包记录（不计入）']];
function matchingFor(ctx){const found=ADDITIONAL_MATCHING_DATA[ctx.store.id];if(found)return found;publicLoadMatching(ctx.store.id);return null}
function matchMaps(d){return {own:new Map(d.ownProducts.map(p=>[p.id,p])),comp:new Map(d.competitorProducts.map(p=>[p.id,p]))}}
function matchingRows(d){
 if(matchView.group==='bundles')return d.excludedBundleMatches||[];
 if(matchView.group==='all')return d.matches;
 if(matchView.group==='pending'){const rows=[...d.matches.filter(r=>r.group==='pending'),...(d.pendingOwnMatches||[])];return rows.filter(r=>matchView.origin==='all'||(matchView.origin==='own'?r.group==='pendingOwn':r.group==='pending'))}
 return matchView.group==='ownOnly'?d.ownOnlyMatches:d.matches.filter(r=>r.group===matchView.group);
}
function matchingParts(d,row){const m=matchMaps(d);return {own:m.own.get(row.ownId||row.candidateOwnId),comp:m.comp.get(row.competitorId||row.candidateCompetitorId)}}
function matchingFiltered(d){
 const q=matchView.search.trim().toLocaleLowerCase(),m=matchMaps(d);
 return matchingRows(d).filter(r=>{const c=m.comp.get(r.competitorId||r.candidateCompetitorId),o=m.own.get(r.ownId||r.candidateOwnId);
  return (!matchView.status||r.status===matchView.status)&&(!matchView.category||c?.categories.some(x=>x.id===matchView.category))&&(!q||[c?.name,o?.name,o?.barcode,o?.specification,...(c?.categories||[]).map(x=>x.name)].join(' ').toLocaleLowerCase().includes(q));
 });
}
function matchScore(label,value){return '<span>'+label+' <strong>'+(value===null||value===undefined?'—':Number(value).toFixed(1))+'</strong></span>'}
function matchThumb(url,name,side,id){return url?'<button class="match-thumb" data-action="match-image" data-side="'+side+'" data-id="'+esc(id)+'" aria-label="放大'+esc(name)+'的图片"><img src="'+esc(safeImage(url))+'" alt="'+esc(name)+'" loading="lazy" decoding="async"></button>':'<span class="match-thumb">'+icon('image',24)+'</span>'}
function matchCategoryMarkup(comp){
 if(!comp)return '<span class="dim">没有已确认的竞品对应商品</span>';
 return comp.categories.map(c=>'<button class="match-category" data-action="match-jump" data-id="'+esc(comp.id)+'" data-category="'+esc(c.id)+'" title="进入此分类定位商品">'+esc(c.name)+(c.productOrder?' · 记录 #'+c.productOrder:' · 位置未恢复')+'</button>').join('');
}
function matchControlsMarkup(row,comp){
 return '<div class="match-inline-controls"><div class="match-row-actions">'+(comp?'<button class="btn small" data-action="match-source" data-id="'+esc(comp.id)+'">'+icon('image',13)+'采集截图</button><button class="btn small" data-action="match-jump" data-id="'+esc(comp.id)+'">定位竞品商品</button>':'')+'<button class="btn small" data-action="match-detail" data-id="'+esc(row.id)+'">'+(row.group==='common'?'查看匹对依据':'查看候选与依据')+'</button></div></div>';
}

function matchingVerificationMarkup(row){
 const v=row.visualVerification;if(!v)return ['pending','pendingOwn'].includes(row.group)&&row.reason?'<div class="match-verification unconfirmed"><strong>待确认说明</strong><p>'+esc(row.reason)+'</p></div>':'';
 return v.passed?'<details class="match-verification verified match-verification-fold"><summary>主品图已确认 <span class="match-fold-hint">展开说明</span></summary><p>'+esc(v.reason)+'</p></details>':'<div class="match-verification unconfirmed"><strong>待确认原因</strong><p>'+esc(v.reason)+'</p></div>';
}
function matchingSourceIssuesMarkup(row){
 const issues=row.sourceDataIssues||[];return issues.length?'<div class="match-source-issues"><strong>源表待校对 · 与主品是否共有分开记录</strong><p>'+issues.map(esc).join('<br>')+'</p></div>':'';
}
function matchingListMarkup(ctx){
 const d=matchingFor(ctx),rows=matchingFiltered(d);matchView.page=Math.max(1,Math.min(matchView.page,Math.ceil(rows.length/20)||1));
 if(!rows.length)return '<div class="match-empty">'+smallEmpty('没有符合条件的匹对记录','可以更换分组、关键词或竞品分类。','box')+'</div>';
 const maps=matchMaps(d);
 return rows.slice((matchView.page-1)*20,matchView.page*20).map(row=>{
  const comp=maps.comp.get(row.competitorId||row.candidateCompetitorId),own=maps.own.get(row.ownId||row.candidateOwnId);
  const ownImage=row.ownImageUrl||own?.imageUrl;
  return '<article class="match-row" data-match-group="'+esc(row.group)+'" data-match-id="'+esc(row.id)+'"><div class="match-pair match-pair-aligned">'+
   '<section class="match-side"><div class="match-side-label">竞品商品'+(['ownOnly','pendingOwn'].includes(row.group)?' · 最相近候选，未确认同款':'')+'</div><div class="match-product">'+matchThumb(comp?.imageUrl,comp?.name||'竞品','comp',comp?.id||'')+'<div><h3>'+esc(comp?.name||'没有已确认的竞品对应商品')+'</h3><p class="match-sub">'+esc(d.competitorStore.name)+'</p><div class="match-categories">'+matchCategoryMarkup(comp)+'</div>'+(comp?thumbnailReviewMarkup(comp)+thumbnailEvidenceButton(comp):'')+'</div></div>'+(comp?matchSaleDetailsMarkup(comp):'<div class="match-sale-details"><strong class="match-sale-title">对方售卖详情</strong><p class="match-sub">没有已确认的竞品对应商品</p></div>')+'</section>'+
   '<section class="match-side"><div class="match-side-label">本店商品'+(['competitorOnly','pending'].includes(row.group)?' · 最相近候选，未确认同款':'')+'</div><div class="match-product">'+matchThumb(ownImage,own?.name||'本店商品','own',row.id)+'<div><h3>'+esc(own?.name||'未找到本店对应商品')+'</h3><p class="match-outcome">'+esc(row.excludedFromProductCount?'组包记录 · 不计入商品数量':row.outcomeLabel||row.status)+'</p></div></div><div class="match-own-details"><strong class="match-sale-title">本店商品资料</strong><div class="match-own-facts"><p class="match-barcode">条码：'+esc(own?.barcode||'—')+'</p><p class="match-sub">规格原文：'+esc(own?.specification||'未填写')+'</p></div><p class="match-sub match-own-origin">'+esc(own?.brand||'品牌未填写')+' · '+esc(own?.category||'分类未填写')+' · 源表第 '+(own?.sourceRow||'—')+' 行</p>'+matchingVerificationMarkup(row)+matchingSourceIssuesMarkup(row)+matchControlsMarkup(row,comp)+'</div></section></div></article>';
 }).join('');
}

function renderMatching(ctx){
 const d=matchingFor(ctx);if(!d){const error=window.PUBLIC_MATCH_ERRORS[ctx.store.id];return '<section class="panel"><div class="section-body">'+smallEmpty(error?'匹对结果暂未加载完成':(window.PUBLIC_MANIFEST?.matching[ctx.store.id]?'正在加载匹对结果':'这家店尚无匹对结果'),error||'取得竞品快照和本店商品池后，结果将在此展示。','box')+(error?'<button class="btn primary" data-public-action="retry-matching">重新加载匹对结果</button>':'')+'</div></section>';}
 if(matchView.group==='pendingCommon')matchView.group='pending';
 const s=d.summary,bundleName=d.countingPolicy?.excludedCategoryNames?.[0]||'组包钜惠',bundleLabel=s.displayOnlyExcludedProducts?'另存记录（不计入）':'组包记录（不计入）',counts={all:s.eligibleCompetitorProducts??d.matches.length,bundles:s.bundleExcludedProducts||0,common:s.commonCompetitorProducts,competitorOnly:s.competitorOnlyProducts,ownOnly:s.ownOnlyProducts,pending:s.competitorPendingReview};
 const visibleIds=new Set((matchView.group==='bundles'?(d.excludedBundleMatches||[]):d.matches).map(r=>r.competitorId));
 const cats=[...new Map(d.competitorProducts.filter(p=>visibleIds.has(p.id)).flatMap(p=>p.categories).map(c=>[c.id,c])).values()].sort((a,b)=>a.order-b.order);
 if(matchView.category&&!cats.some(c=>c.id===matchView.category))matchView.category='';
 const statuses=[...new Set([...d.matches,...d.ownOnlyMatches,...(d.pendingOwnMatches||[])].map(r=>r.status))];
 const notes={bundles:'单独保留“'+bundleName+'”原图片及分类。'+(s.displayOnlyExcludedProducts?'仅在推荐或活动入口出现的记录也在这里单独保留。':'')+'这些记录不计入普通商品数量和匹对统计。',common:'可见主品外观、色调与可辨包装文字已核对；共有按主品计，不表示整个套餐或条码相同。',competitorOnly:'仅表示本次本店商品池未检索到对应主品，不能作为门店实际无货的结论。',ownOnly:'仅在证据充分时登记本店独有；0不表示对方拥有本店所有商品。',pending:'双方是否同款尚未确认的商品统一放在这里。保留图片、名称、规格及每条疑点，确认后再归入相应结果。',all:'商品按正式分类去重；推荐、活动仅作展示入口，不额外计数。'+bundleName+'单独保留，不计入商品数量和匹对统计。'};
 return '<div class="matching-view"><section class="panel match-overview"><div class="panel-heading"><div><h2>'+esc(d.displayTitle||'主品逐图复核')+'</h2><p class="section-note">'+esc(d.sourceWorkbookName)+' · 本店商品池 '+s.ownProducts+' 个条码 · 普通商品匹对</p></div><a class="btn small" href="'+esc(d.reportUrl)+'" target="_blank" rel="noopener">查看全部比对分组</a></div><div class="section-body">'+
 '<div class="match-capture-scope"><span>已收录 <strong>'+s.competitorProducts+'</strong> 条记录（含组包）</span><span>计入商品匹对 <strong>'+counts.all+'</strong> 条非组包记录</span><span>组包 <strong>'+(s.bundleOnlyProducts??counts.bundles)+'</strong> 条，单独保留</span>'+(s.displayOnlyExcludedProducts?'<span>仅推荐或活动 <strong>'+s.displayOnlyExcludedProducts+'</strong> 条，单独保留</span>':'')+'</div>'+
 '<div class="match-summary strict-summary">'+['common','pending','competitorOnly','ownOnly'].map(id=>MATCH_GROUPS.find(g=>g[0]===id)).map(([id,label])=>'<button class="match-group'+(matchView.group===id?' active':'')+'" data-action="match-group" data-group="'+id+'" aria-pressed="'+(matchView.group===id)+'"><span>'+esc(label)+'</span><strong>'+counts[id]+'<small>'+(id==='ownOnly'?' 个本店条码':' 条竞品记录')+'</small></strong><em>'+esc(id==='common'?'主品外观、色调及可辨印字已确认':id==='competitorOnly'?'本次商品池未检索到对应主品':id==='pending'?'是否同款尚未确认，保留每条具体说明':'本店侧条码另计；有充分证据才确认独有')+'</em></button>').join('')+'</div>'+
 '<div class="match-notice"><strong>本轮逐图复核与纠正</strong><p>先看主产品的轮廓、实际颜色和可辨认的包装文字/英文，再结合名称、型号、容量判断。相同主品的拍摄角度、广告背景、搭配品或已保存主图版本不同，不作为排除依据。源表填写疑点单独标注；实际颜色款、包装文字或结构不能对应的，保留具体待确认原因。</p><p>是否同款尚未确认的记录，统一列入“待确认商品”，每条保留具体说明。统计口径：按一级分类“'+esc(bundleName)+'”归属排除；同一记录只扣除一次。组包原采集和历史匹对结论仍可在“组包记录”中查看。'+(d.countingPolicy?.crossListedRecords?'有 '+d.countingPolicy.crossListedRecords+' 条跨分类记录，按组包归属优先排除。':'')+' 图文核对时间：'+esc(exactDateText(d.matchedAt))+'。</p></div></div></section>'+
 '<section class="panel"><div class="match-view-tabs" role="group" aria-label="比对记录分组">'+MATCH_GROUPS.map(([id,label])=>'<button class="match-view-tab'+(matchView.group===id?' active':'')+'" data-action="match-group" data-group="'+id+'" aria-pressed="'+(matchView.group===id)+'">'+(id==='bundles'?esc(bundleLabel):esc(label))+' <span>'+counts[id]+'</span></button>').join('')+'</div>'+
 '<div class="match-filters"><label class="search-box">'+icon('search',15)+'<input id="matchSearch" value="'+esc(matchView.search)+'" placeholder="搜索双方商品名称、条码或规格" aria-label="搜索匹对结果"></label><select class="select" id="matchCategory" aria-label="按竞品一级分类筛选"><option value="">全部竞品一级分类</option>'+cats.map(c=>'<option value="'+esc(c.id)+'"'+(matchView.category===c.id?' selected':'')+'>'+esc(c.name)+'</option>').join('')+'</select><select class="select" id="matchStatus" aria-label="按匹对状态筛选"><option value="">全部匹对状态</option>'+statuses.map(v=>'<option value="'+esc(v)+'"'+(matchView.status===v?' selected':'')+'>'+esc(v)+'</option>').join('')+'</select>'+(matchView.group==='pending'?'<select class="select" id="matchOrigin" aria-label="待确认来源">'+[['comp','竞品侧待确认'],['own','本店侧待确认'],['all','两侧全部待确认']].map(([v,l])=>'<option value="'+v+'"'+(matchView.origin===v?' selected':'')+'>'+l+'</option>').join('')+'</select>':'')+'<button class="btn ghost small" data-action="match-reset">重置</button></div><div class="match-list-label"><strong id="matchListTitle">'+(matchView.group==='bundles'?esc(bundleLabel):esc(MATCH_GROUPS.find(g=>g[0]===matchView.group)[1]))+'</strong><span id="matchCount" class="muted">当前 '+matchingFiltered(d).length+' 条结果</span></div><p class="match-group-description">'+esc(notes[matchView.group])+'</p><div id="matchingList">'+matchingListMarkup(ctx)+'</div><div id="matchingPagination">'+paginate(matchingFiltered(d).length,matchView.page,20,'matching')+'</div></section></div>';
}

function refreshMatching(){const ctx=getDetailContext(),d=ctx&&matchingFor(ctx);if(!d||!$('#matchingList'))return;$('#matchingList').innerHTML=matchingListMarkup(ctx);$('#matchingPagination').innerHTML=paginate(matchingFiltered(d).length,matchView.page,20,'matching');$('#matchCount').textContent='当前 '+matchingFiltered(d).length+' 条结果'}
function matchingRowById(d,id){return d.excludedBundleMatches?.find(r=>r.id===id)||d.matches.find(r=>r.id===id)||d.ownOnlyMatches.find(r=>r.id===id)||d.pendingOwnMatches?.find(r=>r.id===id)}
function openMatchingImage(side,id){
 const d=matchingFor(getDetailContext());if(!d)return;let url,name;
 if(side==='candidate'){const parts=id.split('|'),r=matchingRowById(d,parts[0]),c=r?.candidates?.[Number(parts[1])],o=d.ownProducts.find(p=>p.id===c?.ownId);url=c?.ownImageUrl||o?.imageUrl;name=o?.name}
 else if(side==='comp'){const c=d.competitorProducts.find(p=>p.id===id);url=c?.imageUrl;name=c?.name}
 else{const r=matchingRowById(d,id),o=d.ownProducts.find(p=>p.id===(r?.ownId||r?.candidateOwnId));url=r?.ownImageUrl||o?.imageUrl;name=o?.name}
 if(!safeImage(url))return;const size=Math.min(420,Math.max(200,window.innerWidth-100));
 $('#imageDialog').innerHTML='<div class="modal-header"><h2 id="imageTitle">匹对商品图片</h2><button class="icon-btn" data-action="close-dialog" data-dialog="imageDialog" aria-label="关闭大图">'+icon('close',17)+'</button></div><div class="modal-body product-picture-viewer"><p class="product-picture-name">'+esc(name)+'</p><div class="product-picture-toolbar"><div class="actions"><button class="btn small" data-action="product-image-zoom" data-direction="out">缩小</button><button class="btn small" data-action="product-image-zoom" data-direction="in">放大</button><button class="btn small" data-action="product-image-zoom" data-direction="reset">适合窗口</button></div></div><div class="product-picture-stage"><img id="productPicture" src="'+esc(safeImage(url))+'" alt="'+esc(name)+'" data-initial-size="'+size+'" style="width:'+size+'px"></div><p class="product-picture-note">使用已有源图；放大不会增加清晰度。</p></div>';showDialog('imageDialog');
}
function openMatchingSource(id,categoryId){
 const d=matchingFor(getDetailContext()),p=d?.competitorProducts.find(p=>p.id===id);if(!p)return;
 const c=p.categories.find(c=>c.id===(categoryId||matchView.category)&&c.sourceScreenshotUrl)||p.categories.find(c=>c.sourceScreenshotUrl),url=safeLocalScreenshot(c?.sourceScreenshotUrl||p.sourceScreenshotUrl);
 if(!url){toast('此商品尚未关联采集截图');return}
 $('#imageDialog').innerHTML='<div class="modal-header"><h2 id="imageTitle">竞品商品采集截图</h2><button class="icon-btn" data-action="close-dialog" data-dialog="imageDialog" aria-label="关闭截图">'+icon('close',17)+'</button></div><div class="modal-body"><p>'+esc(p.name)+'</p><p class="section-note">'+esc(c?.name||'来源分类未记录')+(c?.productOrder?' · 分类记录 #'+c.productOrder:' · 分类位置未恢复')+' · '+esc(exactDateText(c?.capturedAt||p.capturedAt))+'<br>采集时的记录位置，不能作为现在的客户端排名。</p><img src="'+esc(url)+'" alt="竞品商品采集采集页面"></div>';showDialog('imageDialog');
}
function jumpToMatchingProduct(id,categoryId){
 const ctx=getDetailContext(),d=matchingFor(ctx),p=d?.competitorProducts.find(p=>p.id===id);if(!p||!ctx.products.some(x=>x.id===id)){toast('当前商品快照已变化，请通过匹对采集截图核实');return}
 const bundleCategory=p.categories.find(isBundleCategory);
 const cat=bundleCategory||p.categories.find(c=>c.id===(categoryId||matchView.category))||p.categories.find(c=>c.kind==='merchant')||p.categories[0];
 closeDialog('productDrawer');state.tab='catalog';state.category=cat?.id||'';state.productSearch='';state.productSort='source';state.reviewUnreadable=false;state.productPage=1;
 const list=filteredProducts(ctx),index=list.findIndex(p=>p.id===id);state.productPage=index<0?1:Math.floor(index/50)+1;render();
 requestAnimationFrame(()=>{const row=[...document.querySelectorAll('#productRows tr')].find(r=>r.dataset.id===id);row?.scrollIntoView({block:'center'});row?.classList.add('match-located');row?.focus({preventScroll:true});setTimeout(()=>row?.classList.remove('match-located'),4000)});
}
function openMatchingDetail(id){
 const d=matchingFor(getDetailContext()),row=d&&matchingRowById(d,id);if(!row)return;const m=matchMaps(d),comp=m.comp.get(row.competitorId||row.candidateCompetitorId);
 const selectedOwn=m.own.get(row.ownId||row.candidateOwnId);
 const candidateRows=row.candidates||row.candidateCompetitorIds?.map(cid=>{const c=m.comp.get(cid);return {competitor:c,ownId:row.ownId,conflicts:[],agreements:[]}})||[];
 $('#productDrawer').innerHTML='<div class="drawer-header"><h2 id="productDrawerTitle">匹对依据与候选</h2><button class="icon-btn" data-action="close-dialog" data-dialog="productDrawer" aria-label="关闭匹对依据">'+icon('close',17)+'</button></div><div class="drawer-body"><p>'+badge(row.status,row.group==='common'?'teal':'amber')+'</p><p class="section-note">'+esc((row.excludedFromProductCount?'此记录归属组包钜惠，不计入商品数量及匹对统计；下方为原匹对依据。 ':'')+row.reason)+'</p><p class="match-sub">本店图片：'+esc(row.ownImageVersion||'未记录')+' · 源表第 '+(selectedOwn?.sourceRow||'—')+' 行</p><div class="match-score">'+matchScore('原候选图像分',row.imageScore)+matchScore('原候选标题分',row.titleScore)+'</div>'+matchSaleDetailsMarkup(comp)+'<p class="section-note">'+esc(d.method.scoreNote)+'。竞品未采集条码和完整规格，不作条码级相同的保证。</p><h3 style="margin-top:24px">'+(['ownOnly','pendingOwn'].includes(row.group)?'相近竞品候选':row.group==='common'?'本店候选（已确认项置顶）':'本店候选（均待确认）')+'</h3>'+candidateRows.map((c,i)=>{const own=m.own.get(c.ownId),p=c.competitor;return '<section class="match-candidate">'+(p?matchThumb(p.imageUrl,p.name,'comp',p.id):matchThumb(c.ownImageUrl||own?.imageUrl,own?.name||'本店候选','candidate',id+'|'+i))+'<strong>候选 '+(i+1)+(c.adopted?' · 已采用':'')+' · '+esc(p?.name||own?.name)+'</strong><p class="match-sub">'+(p?'竞品分类见下方':esc(own?.barcode)+' · '+esc(own?.specification||'规格未填写'))+'</p>'+(typeof c.imageScore==='number'?'<p class="match-sub">图像 '+c.imageScore+' · 标题 '+c.titleScore+' · 采用'+esc(c.ownImageVersion)+'</p>':'')+'<p class="section-note">'+esc((c.conflicts?.length?c.conflicts:c.agreements)?.join('；')||'相近候选，尚未确认')+'</p>'+(p?'<div class="match-categories">'+matchCategoryMarkup(p)+'</div><button class="btn small" data-action="match-source" data-id="'+esc(p.id)+'">查看采集截图</button>'+matchSaleDetailsMarkup(p):'')+'</section>'}).join('')+(comp?'<h3 style="margin-top:24px">竞品所在全部一级分类</h3><div class="match-categories">'+matchCategoryMarkup(comp)+'</div>':'')+'<p class="section-note">本店来源：'+esc(d.sourceWorkbookName)+'，条码按原文保留。分类记录序号对应采集时的页面；多分类商品保留各分类入口。</p></div>';showDialog('productDrawer');
}

/* MATCHING_UI_END */
function renderDetailTab(ctx){return state.tab==='matching'?renderMatching(ctx):state.tab==='delivery'?renderDelivery(ctx):state.tab==='sources'?renderSources(ctx):renderCatalog(ctx)}
function renderCatalog(ctx){
  if(state.category&&!ctx.categories.some(c=>c.id===state.category))state.category='';
  const total=categoryTotal(ctx.observation,ctx.categories),scope=catalogCountingScope(ctx);
  return '<div class="catalog"><aside class="panel"><div class="categories-head"><h2>一级分类</h2><span class="count-pill">'+(has(total)?esc(total)+' 类':'—')+'</span></div><div class="category-list" role="region" aria-label="一级分类，可独立滚动" tabindex="0"><button class="category-btn'+(!state.category?' active':'')+'" data-action="category" data-id=""><span>'+icon('layers',14)+'<span style="margin-left:8px">全部商品（去重统计）</span></span><span class="category-qty">'+(ctx.observation?scope.productCount:'—')+'</span></button>'+
    ctx.categories.map((c,i)=>'<button class="category-btn'+(state.category===c.id?' active':'')+'" data-action="category" data-id="'+esc(c.id)+'" aria-pressed="'+(state.category===c.id)+'"'+(isPromotionEntry(c)?' title="展示入口；与正式分类重合的商品只计一次，不额外计入商品总数"':'')+'><span><span class="category-number">'+String(i+1).padStart(2,'0')+'</span>'+esc(c.name)+'</span>'+(isPromotionEntry(c)?'':'<span class="category-qty">'+categoryQuantityText(ctx,c)+'</span>')+'</button>').join('')+
    (!ctx.categories.length?'<div class="category-empty">'+icon('list',25)+'分类将在采集后展示<br>保留用户端的原始顺序</div>':'')+'</div><div class="category-foot">'+(ctx.observation?(ctx.observation.categoriesComplete===true?'组包另存；推荐/活动仅作展示入口':'已收录 '+ctx.categories.length+' 类，完整性待核对'):'分类名称与数量均尚未采集')+'</div></aside>'+
    '<div class="panel catalog-main"><div class="panel-heading"><div class="heading-with-count"><h2>商品明细</h2></div><div class="product-tools"><div class="field-control">'+icon('search',14)+'<input class="input" id="productSearch" value="'+esc(state.productSearch)+'" placeholder="搜索商品名称或规格" aria-label="搜索商品"></div><select class="select compact" id="productSort" aria-label="商品排序">'+[['source',sourceSortLabel()],['priceAsc','现价从低到高'],['priceDesc','现价从高到低'],['name','按商品名称']].map(v=>'<option value="'+v[0]+'"'+(state.productSort===v[0]?' selected':'')+'>'+v[1]+'</option>').join('')+'</select></div></div><div class="catalog-caption"><span id="productCaption">'+productCaption(ctx)+'</span>'+(unreadableReviewButton(scope)||'<span>多规格在商品详情内查看</span>')+'</div>'+
    '<div class="table-scroll product-scroll-pane" role="region" aria-label="商品列表，可独立滚动" tabindex="0"><table class="data-table product-table"><thead><tr><th scope="col">商品 / 规格</th><th scope="col">所属分类</th><th scope="col">现价 / 原价</th><th scope="col">优惠条件</th><th scope="col">页面展示销量</th><th scope="col">售卖状态</th><th scope="col" aria-label="查看商品"></th></tr></thead><tbody id="productRows">'+productRowsMarkup(ctx)+'</tbody></table></div><div id="productPagination">'+productPaginationMarkup(ctx)+'</div></div></div>';
}
function sourcePlacement(p){return state.category?(p._sourceOccurrence||p.categoryPlacements?.[state.category]):null}
function sourceSortLabel(){return state.category?'分类页面记录顺序':'全店首次收录顺序'}
function sourceOrderValue(p){const value=state.category?sourcePlacement(p)?.order:p.order;return has(value)&&Number.isInteger(Number(value))&&Number(value)>0?Number(value):null}
function categoryOrderText(ctx,p){
  if(!state.category)return '全店收录 #'+(p.order||'—')+'，不表示客户端分类排名';
  const placement=sourcePlacement(p),category=ctx.categories.find(c=>c.id===state.category);
  if(category?.replaySkippedByUser)return '分类记录 '+(placement?'#'+placement.order+' · ':'')+'排序未核对（'+category.name+'）';
  if(!placement)return '分类顺序未确认';
  return '分类记录 #'+placement.order+(category?.orderEvidence?.status==='reconstructed'?' · 逐屏顺序已核对':' · 顺序待核对');
}
function productEvidence(ctx,p){
  const placement=state.reviewUnreadable?null:sourcePlacement(p),fieldSource=placement?.fieldEvidence?.price||(p.priceReview?.sourceScreenshot?p.priceReview:null)||placement?.fieldEvidence?.name||p.fieldReview,filename=fieldSource?.sourceScreenshot||placement?.sourceScreenshot||p.sourceScreenshot;
  const base=ctx.observation?.screenshotBasePath;
  return {url:fieldSource?.sourceScreenshotUrl?safeLocalScreenshot(fieldSource.sourceScreenshotUrl):base&&filename?safeLocalScreenshot(base+'/'+filename):'',filename,priceReview:fieldSource?.kind==='priceReview',reviewNote:fieldSource?.note,
    capturedAt:fieldSource?.capturedAt||placement?.capturedAt||p.capturedAt,categoryMatch:!!placement&&fieldSource?.kind!=='priceReview',sourceMedia:fieldSource?.sourceMedia||placement?.sourceMedia||p.sourceMedia};
}
function productEvidenceMarkup(ctx,p){
  const evidence=productEvidence(ctx,p);if(!evidence.url)return '<span class="dim">采集截图尚未关联</span>';
  return '<button class="evidence-btn" data-action="product-evidence" data-id="'+esc(p.id)+'"'+(Number.isInteger(p._occurrenceIndex)?' data-occurrence="'+p._occurrenceIndex+'"':'')+'>'+icon('image',12)+' '+(evidence.priceReview?'查看价格复核画面':evidence.sourceMedia?.type==='userProvidedVideo'?'查看录屏画面':state.category&&!evidence.categoryMatch?'商品来源截图（非当前分类）':'查看采集截图')+'</button>';
}
function thumbnailEvidenceButton(product){
  if(!safeLocalScreenshot(product.thumbnailEvidence?.sourceScreenshotUrl))return '';
  return '<button class="evidence-btn" data-action="thumbnail-evidence" data-id="'+esc(product.id)+'">'+icon('image',12)+' 查看补图画面</button>';
}
function thumbnailReviewMarkup(product){
  return product.thumbnailReview?'<span class="cell-sub">'+esc(product.thumbnailReview)+'</span>':'';
}
function openThumbnailEvidence(productId){
  const product=getDetailContext()?.products.find(item=>item.id===productId);
  const evidence=product?.thumbnailEvidence,url=safeLocalScreenshot(evidence?.sourceScreenshotUrl);
  if(!url)return;
  $('#imageDialog').innerHTML='<div class="modal-header"><h2 id="imageTitle">补图来源画面</h2><button class="icon-btn" data-action="close-dialog" data-dialog="imageDialog" aria-label="关闭截图">'+icon('close',17)+'</button></div><div class="modal-body"><p class="section-note">'+esc(product.name)+'<br>录屏 '+esc(evidence.videoTimeLabel)+(evidence.publicView?' · '+esc(evidence.publicView):'')+'</p><img src="'+esc(url)+'" alt="'+esc(product.name)+'的主图来源画面"></div>';
  showDialog('imageDialog');
}
function productOrderMarkup(ctx,p){return '<span class="source-order"><span>'+esc(categoryOrderText(ctx,p))+'</span>'+productEvidenceMarkup(ctx,p)+thumbnailEvidenceButton(p)+'</span>'}
function openProductEvidence(productId,occurrenceIndex){
  const ctx=getDetailContext(),original=ctx?.products.find(item=>item.id===productId);if(!original)return;
  const occurrence=state.category&&occurrenceIndex!==undefined?ctx.categories.find(c=>c.id===state.category)?.listingSequence?.[Number(occurrenceIndex)]:null;
  const p=occurrence?.productId===productId?{...original,_sourceOccurrence:occurrence}:original;
  const evidence=productEvidence(ctx,p);if(!evidence.url)return;
  $('#imageDialog').innerHTML='<div class="modal-header"><h2 id="imageTitle">商品采集页面</h2><button class="icon-btn" data-action="close-dialog" data-dialog="imageDialog" aria-label="关闭截图">'+icon('close',17)+'</button></div><div class="modal-body"><p class="section-note">'+esc(categoryOrderText(ctx,p))+'<br>'+esc(evidence.priceReview?[evidence.sourceMedia?.recordedDate,evidence.sourceMedia?.videoName,evidence.sourceMedia?.videoTimeLabel].filter(Boolean).join(' · '):evidence.sourceMedia?.type==='userProvidedVideo'?videoPosition(evidence.sourceMedia):dateText(evidence.capturedAt))+' · '+esc(evidence.filename)+(evidence.priceReview?'<br>'+esc(evidence.reviewNote||'价格来自新录屏；分类顺序与销量保留原采集记录。'):state.category&&!evidence.categoryMatch?'<br>此截图证明商品来源，不能证明它在当前分类的位置。':'')+'</p><img src="'+esc(evidence.url)+'" alt="'+esc(p.name)+'的采集采集页面" loading="eager"></div>';
  showDialog('imageDialog');
}
function productCaption(ctx){
  const filtered=filteredProducts(ctx);if(!ctx.observation)return '尚未取得商品资料，页面在售总数仍待采集';
  let description='全店首次收录顺序，不表示客户端分类排名';
  if(state.category){
    const category=ctx.categories.find(c=>c.id===state.category),e=category?.orderEvidence;
    description=e?.status==='reconstructed'?'按采集时「'+(e.scope||'分类列表')+'」顺序整理，逐屏顺序已核对':
      e?.status==='conflict'?'分类顺序待核对：页面有同名重复或顺序冲突，记录序号不代表客户端名次':
      e?.status==='partial'?'分类顺序部分恢复：有缺页衔接或未确认位置，保留全部已收录商品':'尚未恢复分类内顺序，暂按全店首次收录顺序展示';
    if(category?.replaySkippedByUser)description='排序未核对（'+category.name+'）：按你的要求不重复翻阅，保留历史记录与来源；可在普通分类核实商品';
  }
  if(state.productSort!=='source')description='当前按'+({priceAsc:'现价从低到高',priceDesc:'现价从高到低',name:'商品名称'}[state.productSort]||'所选条件')+'排序；切回“分类页面记录顺序”可对照采集页面';
  const scope=catalogCountingScope(ctx),viewingBundle=scope.categoryIds.has(state.category);
  const repeated=state.category&&new Set(filtered.map(p=>p.id)).size<filtered.length;
  return '已收录 '+scope.total+' 条记录 · '+productCountingText(scope)+' · '+(state.reviewUnreadable?'仅看已收录的未看清记录 · ':viewingBundle?'当前为组包 · ':scope.entryCategoryIds.has(state.category)?'当前为展示入口 · ':'')+'当前筛选 '+filtered.length+' 条'+(repeated?'（含页面重复展示）':'')+'<span class="order-caption">'+esc(description)+'</span>'+(ctx.observation.priceReviewSummary?'<span class="order-caption">价格来源：'+esc(ctx.observation.priceReviewSummary.recordedDate)+' 新录屏已确认 '+ctx.observation.priceReviewSummary.clearPrices+' 条，未看清 '+ctx.observation.priceReviewSummary.unreadablePrices+' 条；另 '+ctx.observation.priceReviewSummary.notVerifiedInNewRecording+' 条沿用原录屏价格。'+(ctx.observation.priceReviewSummary.listingDetailsUpdated?'可辨销量及优惠同步复核；分类顺序保留原记录。':'分类顺序及销量保持原采集口径。')+'</span>':'');
}
function unreadableLabels(product){
  const fields={name:'标题',image:'主图',price:'价格'};
  return Object.keys(fields)
    .filter(key=>product.unreadableFields?.includes(key)||product.fieldStatus?.[key]==='未看清')
    .map(key=>fields[key]);
}
function unreadableReviewButton(scope){
  const count=scope.uniqueProducts.filter(product=>unreadableLabels(product).length).length;
  if(!count)return '';
  return '<button class="btn small" data-action="review-unreadable" aria-pressed="'+state.reviewUnreadable+'">'
    +'仅看未看清（'+count+'）</button>';
}
function filteredProducts(ctx){
  const search=state.productSearch.trim().toLocaleLowerCase(),scope=catalogCountingScope(ctx),viewingBundle=scope.categoryIds.has(state.category);
  let list=scope.uniqueProducts.filter(p=>(state.reviewUnreadable
    ? unreadableLabels(p).length>0
    : viewingBundle?scope.bundleIds.has(p.id):scope.entryCategoryIds.has(state.category)?true:scope.countedIds.has(p.id))&&(!state.category||p.categoryId===state.category||p.categoryIds?.includes(state.category)||scope.members.get(p.id)?.has(state.category))&&(!search||[p.name,p.specification,...(p.variants||[]).map(v=>v.name)].join(' ').toLocaleLowerCase().includes(search)));
  const sequence=state.category&&!state.reviewUnreadable?ctx.categories.find(c=>c.id===state.category)?.listingSequence:null;
  if(sequence?.length){
    const products=new Map(list.map(p=>[p.id,p])),seen=new Set(),occurrences=[];
    sequence.forEach((entry,index)=>{const p=products.get(entry.productId);if(p){occurrences.push({...p,...entry,id:p.id,_sourceOccurrence:entry,_occurrenceIndex:index});seen.add(p.id)}});
    list=[...occurrences,...list.filter(p=>!seen.has(p.id))];
  }
  list.sort((a,b)=>{if(state.productSort==='name')return a.name.localeCompare(b.name,'zh-CN');if(state.productSort==='priceAsc'||state.productSort==='priceDesc'){const an=has(a.price)&&Number.isFinite(Number(a.price)),bn=has(b.price)&&Number.isFinite(Number(b.price));if(an!==bn)return an?-1:1;if(an&&Number(a.price)!==Number(b.price))return (Number(a.price)-Number(b.price))*(state.productSort==='priceAsc'?1:-1)}const ar=sourceOrderValue(a),br=sourceOrderValue(b);if(ar!==null&&br===null)return -1;if(ar===null&&br!==null)return 1;if(ar!==null&&br!==null&&ar!==br)return ar-br;return (Number(a.order)||0)-(Number(b.order)||0)});
  state.productPage=Math.min(Math.max(1,state.productPage),Math.max(1,Math.ceil(list.length/50)));
  return list;
}
function saleBadge(value){const map={available:['可选购','teal'],soldout:['已售罄','amber'],off:['已下架','']};return map[value]?badge(...map[value]):badge(has(value)?String(value):'未采集')}
function videoPosition(media){
  return [media.videoLabel||'录屏',media.videoTimeLabel].filter(Boolean).join(' ');
}
function videoSourceLabel(p){
  const occurrence=p?._sourceOccurrence,media=occurrence?occurrence.sourceMedia:p?.sourceMedia;
  return media?.type==='userProvidedVideo'?videoPosition(media):'';
}
function productPriceReviewMarkup(p){
 const review=p.priceReview;if(!review)return '';
 if(review.status==='notVerifiedInNewRecording')return '<span class="cell-sub" title="'+esc(review.note||'')+'">沿用原录屏价格</span>';
 return '<span class="cell-sub" title="'+esc(review.sourceMedia?.videoName||'')+'">'+(review.status==='unreadable'?'新价格未看清':'价格复核')+' · '+esc(review.recordedDate)+' · '+esc(review.sourceMedia?.videoTimeLabel||'')+'</span>';
}
function productRowsMarkup(ctx){
  const products=filteredProducts(ctx);
  if(!products.length){const isFiltered=state.category||state.productSearch||state.reviewUnreadable;return '<tr><td class="empty-cell" colspan="7">'+smallEmpty(isFiltered?'没有符合条件的商品':'商品信息，等待下一次观察',isFiltered?'换个分类或关键词，查看其他已收录商品。':'商品名称、规格、价格与优惠条件将在采集后展示。','box')+'</td></tr>'}
  const cats=new Map(ctx.categories.map(c=>[c.id,c.name]));
  return products.slice((state.productPage-1)*50,state.productPage*50).map(p=>'<tr class="click-row" tabindex="0" data-action="open-product" data-id="'+esc(p.id)+'"'+(Number.isInteger(p._occurrenceIndex)?' data-occurrence="'+p._occurrenceIndex+'"':'')+' aria-label="查看'+esc(p.name)+'的商品与规格"><td><div class="product-cell">'+(!p.imageUrl&&p.fieldStatus?.image==='未看清'?'<span style="display:grid;place-items:center;width:48px;height:48px;background:#f3f6f8;color:#8090a0;font-size:11px;flex-shrink:0;border-radius:7px">'+(p.thumbnailReview?'未显示':'未看清')+'</span>':imageMarkup(p.imageUrl,p.name,'',p.id,p._occurrenceIndex))+'<span><span class="cell-title">'+esc(p.name)+'</span>'+(unreadableLabels(p).length?'<span class="cell-sub">未看清 · '+esc(unreadableLabels(p).join('、'))+'</span>':'')+thumbnailReviewMarkup(p)+(videoSourceLabel(p)?'<span class="cell-sub">'+esc(videoSourceLabel(p))+' · 可见标题</span>':'')+'<span class="cell-sub">'+esc(p.specification||p.listDescription||'规格尚未记录')+(p.variants?.length?' · '+p.variants.length+' 个已录规格':'')+'</span>'+productOrderMarkup(ctx,p)+'</span></div></td><td>'+text(p.categorySummary||cats.get(p.categoryId))+'</td><td><span class="price">'+(p.fieldStatus?.price==='未看清'&&!has(p.price)?'未看清':money(p.price))+esc(p.priceQualifier||'')+'</span>'+productPriceReviewMarkup(p)+(has(p.originalPrice)?'<span class="cell-sub old-price">'+money(p.originalPrice)+'</span>':'')+'</td><td class="cell-lines">'+text(p.promotion)+'</td><td>'+(p.sourceType==='userProvidedVideo'&&!has(p.displayedSales)?'<span class="dim">未展示</span>':text(p.displayedSales))+'</td><td>'+saleBadge(p.saleStatus)+'</td><td class="row-arrow">'+icon('right',15)+'</td></tr>').join('');
}
function productPaginationMarkup(ctx){const products=filteredProducts(ctx);return paginate(products.length,state.productPage,50,'product')}
function refreshProducts(){const ctx=getDetailContext();if(!ctx)return;$('#productRows').innerHTML=productRowsMarkup(ctx);$('#productPagination').innerHTML=productPaginationMarkup(ctx);$('#productCaption').innerHTML=productCaption(ctx);const option=$('#productSort option[value="source"]');if(option)option.textContent=sourceSortLabel();const pane=$('.product-scroll-pane');if(pane)pane.scrollTop=0}
function selectCategory(id){
  state.category=id||'';state.productPage=1;
  // Keep the category buttons mounted so their scroll position and focus survive.
  document.querySelectorAll('.category-list [data-action="category"]').forEach(button=>{
    const selected=button.dataset.id===state.category;
    button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));
  });
  refreshProducts();
}
function definition(label,value,full=false,raw=false){return '<dl class="definition'+(full?' full-span':'')+'"><dt>'+esc(label)+'</dt><dd'+(full?' class="long"':'')+'>'+(raw?value:text(value))+'</dd></dl>'}
function renderDelivery(ctx){
  const o=ctx.observation,d=o?.delivery||{};
  return '<div class="content-grid"><section class="panel"><div class="panel-heading"><h2>营业与配送</h2>'+icon('clock',18)+'</div><div class="section-body"><div class="definition-grid">'+definition('营业状态',businessBadge(o?.businessStatus||ctx.store.businessStatus),false,true)+definition('营业时段',o?.businessHours)+definition('起送价',money(d.minimumOrder),false,true)+definition('配送费',money(d.deliveryFee),false,true)+definition('预计送达',d.estimatedArrival)+definition('配送范围 / 距离',d.distance)+definition('配送方式',d.method)+definition('配送时段',d.serviceTime)+'</div><hr class="section-divider"><div class="definition-grid">'+definition('隐私配送说明',o?.privacyDelivery,true)+definition('店铺公告',o?.announcement,true)+'</div><p class="section-note">配送与费用对应采集时的查询位置；未取得的金额保持空白。</p></div></section>'+
    '<section class="panel"><div class="panel-heading"><h2>优惠与活动</h2>'+icon('file',18)+'</div><div class="section-body">'+(o?.offers?.length?o.offers.map(offer=>'<article class="offer-item"><h3>'+esc(offer.title||'活动信息')+'</h3><p>'+esc(offer.conditions||'参与条件尚未记录')+'</p>'+(has(offer.validTime)?'<p>有效时间：'+esc(offer.validTime)+'</p>':'')+(has(offer.description)?'<p>'+esc(offer.description)+'</p>':'')+'</article>').join(''):smallEmpty('尚未记录优惠活动','满减、券和会员优惠分别记录条件，避免把不同口径的价格直接比较。','file'))+'</div></section></div>';
}
function screenshotMarkup(screenshots){
  const valid=(Array.isArray(screenshots)?screenshots:[]).map(s=>typeof s==='string'?{url:s}:s).filter(s=>s&&safeImage(s.url));
  if(!valid.length)return smallEmpty('暂无页面截图','采集截图会与对应的店铺、时间和查询位置一起保存。','image');
  return '<div class="screenshot-grid">'+valid.map((s,i)=>'<button class="screenshot-card" data-action="image" data-url="'+esc(safeImage(s.url))+'" data-label="'+esc(s.label||'页面截图 '+(i+1))+'"><img src="'+esc(safeImage(s.url))+'" alt="'+esc(s.label||'页面截图 '+(i+1))+'" loading="lazy" referrerpolicy="no-referrer"><span>'+esc(s.label||'页面截图 '+(i+1))+'</span></button>').join('')+'</div>';
}
function renderSources(ctx){
  const s=ctx.store,o=ctx.observation;
  return '<div class="records-stack"><div class="content-grid"><section class="panel"><div class="panel-heading"><h2>本次记录来源</h2>'+(o?captureBadge(captureDisplayState(o)):badge('尚未采集'))+'</div><div class="section-body"><div class="definition-grid">'+definition('平台来源',o?.platform||s.platform)+definition('查询入口',o?.channel,true)+definition('采集范围',o?.captureScope,true)+definition('去重口径',o?.deduplicationBasis,true)+definition('页面商品数原文',o?.displayedProductCountRaw,true)+definition('精确在售数量',o?.onSaleProductCount)+definition('页面评价条数',o?.reviewCountDisplayed)+definition('页面展示标签',o?.marketingTags?.join('；'),true)+definition('店铺头部截图时间',o?.storeHeaderSnapshot?exactDateText(o.storeHeaderSnapshot.capturedAt):null)+definition('截图选中入口',o?.storeHeaderSnapshot?.selectedSecondaryCategoryRaw)+definition('入会优惠原文',o?.membershipOfferRaw)+definition('商家服务',o?.services?.join('；'),true)+definition('采集时间',o?dateText(o.capturedAt):null)+definition('查询位置',o?.queryLocation,true)+definition('门店入口链接',externalLink(s.sourceUrl),true,true)+definition('本次采集来源',externalLink(o?.sourceUrl),true,true)+definition('商品完整性',o?(o.merchantListsComplete?'普通分类列表已采集，完整规格待补充':o.productsComplete===true?'已完整采集':'部分或尚未确认'):null)+definition('分类完整性',o?(o.categoriesComplete===true?'已完整采集':'部分或尚未确认'):null)+'</div></div></section>'+
    '<section class="panel"><div class="panel-heading"><h2>运营备注</h2>'+icon('note',18)+'</div><div class="section-body"><label for="storeNote" class="label-small">记录你的观察、待核对问题与运营判断</label><textarea class="textarea" id="storeNote" maxlength="10000" placeholder="'+(state.preview?'添加真实店铺后，即可记录观察与备注。':'例如记录需要下次核对的商品或活动条件。')+'"'+(state.preview?' disabled':'')+'>'+esc(s.note||'')+'</textarea><div class="note-foot"><span id="noteSaveState">'+(state.preview?'预览不会保存备注':'基础档案与备注保存在当前浏览器')+'</span><button class="btn primary small" data-action="save-note"'+(state.preview?' disabled':'')+'>'+icon('check',14)+'保存备注</button></div></div></section></div>'+
    '<section class="panel"><div class="panel-heading"><h2>页面截图</h2><span class="muted" style="font-size:11px">保留可复核的原始信息</span></div><div class="section-body">'+screenshotMarkup(o?.screenshots)+'</div></section>'+
    '<section class="panel"><div class="panel-heading"><h2>历次采集记录</h2><span class="count-pill">'+(state.preview?0:observationsFor(s.id).length)+' 条</span></div>'+historyTable(state.preview?[]:observationsFor(s.id),false)+'</section></div>';
}
function historyTable(records,withStore){
  return '<div class="table-scroll"><table class="data-table records-table"><thead><tr>'+(withStore?'<th scope="col">店铺名称</th>':'')+'<th scope="col">采集时间</th><th scope="col">采集状态</th><th scope="col">查询位置</th><th scope="col">商品完整性</th><th scope="col">分类完整性</th><th scope="col">记录说明</th></tr></thead><tbody>'+
    (records.length?records.map(o=>'<tr>'+(withStore?'<td><button class="btn ghost small" data-action="open-store" data-id="'+esc(o.storeId)+'">'+esc(data.stores.find(s=>s.id===o.storeId)?.name||'未命名店铺')+'</button></td>':'')+'<td>'+esc(isOrderBuyerRecord(o)?exactDateText(o.capturedAt):dateText(o.capturedAt))+(isOrderBuyerRecord(o)?'<span class="cell-sub">近24h下单人数单项记录</span>':'')+'</td><td>'+captureBadge(captureDisplayState(o))+'</td><td class="cell-lines">'+text(o.queryLocation)+'</td><td>'+esc(isOrderBuyerRecord(o)?'本次未采集':o.status==='failed'?'未取得':o.merchantListsComplete?'普通分类已采集':o.productsComplete===true?'完整':'部分 / 待核对')+'</td><td>'+esc(isOrderBuyerRecord(o)?'本次未采集':o.status==='failed'?'未取得':o.categoriesComplete===true?'完整':'部分 / 待核对')+'</td><td class="cell-lines">'+text(o.message)+'</td></tr>').join(''):'<tr><td class="empty-cell" colspan="'+(withStore?7:6)+'">'+smallEmpty('还没有采集记录','每次观察的时间、位置与完整程度会记录在这里。','clock')+'</td></tr>')+'</tbody></table></div>';
}
function renderRecords(){
  const records=[...data.observations].sort((a,b)=>stamp(b.capturedAt)-stamp(a.capturedAt));
  return '<section><div class="page-head"><div><div class="eyebrow">OBSERVATION LOG</div><h1>采集记录</h1><p class="page-description">每一次观察，都保留对应的时间、位置与采集口径。</p></div><button class="btn" data-action="go-stores">'+icon('left',15)+'返回店铺资料库</button></div><div class="panel"><div class="panel-heading"><div class="heading-with-count"><h2>全部记录</h2><span class="count-pill">'+records.length+' 条</span></div><span class="muted" style="font-size:11px">失败记录不覆盖历史有效数据</span></div>'+historyTable(records,true)+'</div></section>';
}
function productAtOccurrence(ctx,productId,occurrenceIndex){
 const original=ctx?.products.find(p=>p.id===productId);if(!original)return null;
 const index=occurrenceIndex===undefined?null:Number(occurrenceIndex);
 const occurrence=state.category&&Number.isInteger(index)?ctx.categories.find(c=>c.id===state.category)?.listingSequence?.[index]:null;
 return occurrence?.productId===productId?{...original,...occurrence,id:original.id,categoryId:state.category,capturedAt:occurrence.fieldEvidence?.price?.capturedAt||occurrence.capturedAt,_sourceOccurrence:occurrence,_occurrenceIndex:index}:original;
}
function openProductImage(productId,occurrenceIndex){
 const ctx=getDetailContext(),product=productAtOccurrence(ctx,productId,occurrenceIndex),url=safeImage(product?.imageUrl);
 if(!product||!url)return;
 const evidence=productEvidence(ctx,product),size=Math.min(420,Math.max(200,window.innerWidth-100));
 $('#imageDialog').innerHTML='<div class="modal-header"><h2 id="imageTitle">商品图片</h2><button class="icon-btn" data-action="close-dialog" data-dialog="imageDialog" aria-label="关闭大图">'+icon('close',17)+'</button></div><div class="modal-body product-picture-viewer"><p class="product-picture-name">'+esc(product.name)+'</p><div class="product-picture-toolbar"><div class="actions"><button class="btn small" data-action="product-image-zoom" data-direction="out" aria-label="缩小商品图片">缩小</button><button class="btn small" data-action="product-image-zoom" data-direction="in" aria-label="放大商品图片">放大</button><button class="btn small" data-action="product-image-zoom" data-direction="reset">适合窗口</button></div>'+(evidence.url?'<button class="btn small" data-action="product-evidence" data-id="'+esc(product.id)+'"'+(Number.isInteger(product._occurrenceIndex)?' data-occurrence="'+product._occurrenceIndex+'"':'')+'>'+icon('image',14)+'查看已有采集页面</button>':'')+'</div><div class="product-picture-stage" tabindex="0" role="region" aria-label="商品大图，可滚动查看"><img id="productPicture" src="'+esc(url)+'" alt="'+esc(product.name)+'" data-initial-size="'+size+'" style="width:'+size+'px" referrerpolicy="no-referrer"></div><p class="product-picture-note">当前为已采集的商品小图，放大不会增加清晰度。<span id="productPictureSize"></span></p></div>';
 const picture=$('#productPicture');picture.addEventListener('load',()=>{const label=$('#productPictureSize');if(label)label.textContent='原图尺寸：'+picture.naturalWidth+' × '+picture.naturalHeight+' 像素。'},{once:true});
 showDialog('imageDialog');
}
function zoomProductImage(direction){
 const image=$('#productPicture');if(!image)return;
 const initial=Number(image.dataset.initialSize),width=parseFloat(image.style.width)||initial;
 image.style.width=Math.round(direction==='reset'?initial:Math.max(100,Math.min(2000,width*(direction==='in'?1.5:1/1.5))))+'px';
}

function openProduct(productId,occurrenceIndex){
  const ctx=getDetailContext();const p=productAtOccurrence(ctx,productId,occurrenceIndex);if(!p)return;
  const cat=ctx.categories.find(c=>c.id===p.categoryId);
  $('#productDrawer').innerHTML='<div class="drawer-header"><h2 id="productDrawerTitle">商品与规格详情</h2><button class="icon-btn" data-action="close-dialog" data-dialog="productDrawer" aria-label="关闭商品详情">'+icon('close',17)+'</button></div><div class="drawer-body"><div class="product-profile">'+imageMarkup(p.imageUrl,p.name,'',p.id,p._occurrenceIndex)+'<div><h2>'+esc(p.name)+'</h2><div class="profile-tags">'+badge(cat?.name||'分类未记录')+saleBadge(p.saleStatus)+'</div></div></div>'+
    '<div class="drawer-price"><div class="label-small">用户端展示现价</div><span class="price">'+money(p.price)+esc(p.priceQualifier||'')+'</span>'+productPriceReviewMarkup(p)+(has(p.originalPrice)?'<span class="old-price" style="margin-left:12px">'+money(p.originalPrice)+'</span>':'')+'<p class="section-note" style="margin-top:7px">'+esc(p.promotion||'优惠条件尚未记录')+'</p></div>'+
    '<section class="drawer-section"><h3>商品信息</h3><div class="definition-grid">'+definition('规格说明',p.specification)+definition('页面所属分类',p.categorySummary,true)+definition('列表描述标签',p.listDescription,true)+definition('品牌',p.brand)+definition('页面展示销量',p.displayedSales)+definition('商品条码',p.barcode)+'</div></section>'+
    '<section class="drawer-section"><h3>规格与对应价格 <span class="count-pill">'+(p.variants?.length||0)+' 项已录</span></h3>'+(p.variants?.length?'<table class="variant-table"><thead><tr><th>规格</th><th>现价</th><th>原价</th><th>状态</th></tr></thead><tbody>'+p.variants.map(v=>'<tr><td>'+text(v.name)+'</td><td>'+money(v.price)+'</td><td>'+money(v.originalPrice)+'</td><td>'+saleBadge(v.saleStatus)+'</td></tr>').join('')+'</tbody></table>':'<div class="drawer-empty">尚未取得规格明细，不能据此判断商品没有其他规格。</div>')+'</section>'+
    '<section class="drawer-section"><h3>来源记录</h3><div class="definition-grid">'+definition('采集时间',has(p.capturedAt||ctx.observation?.capturedAt)?dateText(p.capturedAt||ctx.observation?.capturedAt):null,true)+definition('查询位置',ctx.observation?.queryLocation,true)+definition('商品来源',externalLink(p.sourceUrl),true,true)+definition('当前分类顺序',categoryOrderText(ctx,p),true)+definition('采集页面',productEvidenceMarkup(ctx,p),true,true)+definition('补充说明',p.note,true)+'</div></section></div>';
  showDialog('productDrawer');
}
function showDialog(id){lastModalFocus=document.activeElement;const dialog=document.getElementById(id);if(!dialog.open){dialog._returnFocus=document.activeElement;dialog.showModal()}document.body.style.overflow='hidden'}
function closeDialog(id){const dialog=document.getElementById(id);if(dialog?.open)dialog.close()}
document.querySelectorAll('dialog').forEach(dialog=>{
  dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.style.overflow='';const focusTarget=dialog._returnFocus||lastModalFocus;if(focusTarget?.isConnected)focusTarget.focus({preventScroll:true});dialog._returnFocus=null;if(dialog.id==='importDialog')pendingImport=null});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
});
function saveNote(quiet=false){
  const note=$('#storeNote');if(!note||state.preview||note.disabled)return;
  const store=data.stores.find(s=>s.id===state.storeId);if(!store)return;
  if((store.note||'')===note.value){if(!quiet)toast('备注已保存');return}
  store.note=note.value;store.noteUpdatedAt=new Date().toISOString();
  const saved=saveData();const label=$('#noteSaveState');if(label){label.classList.toggle('note-save-state',saved);label.textContent=saved?'已保存到当前浏览器':'暂未保存，请导出资料备份'}
  if(!quiet)toast(saved?'备注已保存':storageProblem);
}
function resetListFilters(){Object.assign(state,{storeSearch:'',brand:'',district:'',business:'',capture:'',storePage:1})}
function resetProductFilters(){Object.assign(state,{category:'',productSearch:'',productSort:'source',productPage:1,reviewUnreadable:false})}
function applyRoute(){
  const raw=location.hash.slice(1);const previousId=state.storeId,previousPreview=state.preview;
  state.preview=false;
  if(raw==='preview'){state.route='detail';state.storeId=null;state.preview=true}
  else if(raw.startsWith('store=')){try{state.storeId=new URLSearchParams(raw).get('store');state.route='detail'}catch{state.route='stores';state.storeId=null}}
  else{state.route=raw==='records'?'records':'stores';state.storeId=null}
  if(previousId!==state.storeId||previousPreview!==state.preview){state.tab='catalog';resetProductFilters();Object.assign(matchView,{group:'all',search:'',category:'',status:'',page:1,origin:'comp'})}
  const params=new URLSearchParams(raw);
  if(params.get('tab')==='matching')state.tab='matching';
  else if(state.route==='detail'&&!state.preview&&params.get('review')==='unreadable'){
    state.tab='catalog';
    state.reviewUnreadable=true;
  }
  render();window.scrollTo({top:0,behavior:'instant'});$('#main').focus({preventScroll:true});
}
function navigate(route,id){
  saveNote(true);
  const hash=route==='detail'?'store='+encodeURIComponent(id):route;
  if(location.hash==='#'+hash)applyRoute();else location.hash=hash;
}
window.addEventListener('hashchange',applyRoute);
function showStoreForm(id=null){
  saveNote(true);editingStoreId=id;
  const s=id?data.stores.find(item=>item.id===id):null;if(id&&!s)return;
  $('#storeForm').reset();$('#storeFormError').hidden=true;
  $('#storeDistrict').innerHTML=options(DISTRICTS,s?.district||'','尚未记录所属区');
  $('#storeDialogTitle').textContent=s?'编辑店铺档案':'添加竞品店铺';
  $('#storeSubmit').textContent=s?'保存档案':'建立店铺档案';
  for(const field of ['name','brand','address','sourceUrl','businessStatus'])$('#storeForm').elements[field].value=s?.[field]||'';
  const platform=s?.platform||'美团微信小程序';
  if(![...$('#storePlatform').options].some(o=>o.value===platform))$('#storePlatform').add(new Option(platform,platform));
  $('#storePlatform').value=platform;
  showDialog('storeDialog');
}
$('#storeForm').addEventListener('submit',event=>{
  event.preventDefault();const form=event.currentTarget;const name=form.elements.name.value.trim();
  const showError=message=>{$('#storeFormError').textContent=message;$('#storeFormError').hidden=false};
  if(!name){showError('请填写用户端展示的完整店铺名称。');form.elements.name.focus();return}
  const sourceUrl=form.elements.sourceUrl.value.trim();if(sourceUrl&&!safeLink(sourceUrl)){showError('店铺入口链接应以 http:// 或 https:// 开头。');return}
  const prior=editingStoreId?data.stores.find(s=>s.id===editingStoreId):null;
  const store={...(prior||{}),id:prior?.id||uid(),name,brand:form.elements.brand.value.trim(),district:form.elements.district.value,address:form.elements.address.value.trim(),platform:form.elements.platform.value,businessStatus:form.elements.businessStatus.value||null,sourceUrl:sourceUrl||null,registeredAt:prior?.registeredAt||new Date().toISOString(),updatedAt:new Date().toISOString(),note:prior?.note||''};
  if(prior)data.stores[data.stores.findIndex(s=>s.id===prior.id)]=store;else data.stores.push(store);
  const saved=saveData();closeDialog('storeDialog');resetListFilters();navigate('detail',store.id);
  toast(saved?(prior?'店铺档案已更新':'店铺档案已建立，经营信息保持未采集'):'档案已在当前页面建立，但未能本地保存，请导出备份');
});
function downloadJson(payload,filename){
  saveNote(true);const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function backupName(){const date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()).replace(/[- :]/g,'');return '竞品资料备份_'+date+'.json'}
$('#importFile').addEventListener('change',async event=>{
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  try{
    if(file.size>25*1024*1024)throw new Error('备份文件超过25MB，请先减少内嵌图片后再导入');
    const raw=await file.text();pendingImport=normalize(JSON.parse(raw));
    $('#importSummary').innerHTML='<p style="font-size:13px">将导入以下资料：</p><div class="import-summary">'+[['stores','店铺'],['categories','分类'],['products','商品'],['observations','采集记录']].map(item=>'<div class="import-stat"><strong>'+pendingImport[item[0]].length+'</strong>'+item[1]+'</div>').join('')+'</div><p class="section-note">导入将替换当前浏览器中的全部竞品资料，包括基础档案与备注。你现有的 '+data.stores.length+' 家店铺、'+data.products.length+' 项商品不会自动合并；请先确认已留存备份。</p>';
    showDialog('importDialog');
  }catch(error){pendingImport=null;toast(error instanceof SyntaxError?'文件不是有效的 JSON 备份，请检查后重试':error.message)}
});
function replaceData(payload,{persist=true}={}){
  const next=normalize(payload);data=next;
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  if(persist)saveData();resetListFilters();resetProductFilters();Object.assign(state,{route:'stores',storeId:null,preview:false,tab:'catalog'});
  if(location.hash!=='#stores')location.hash='stores';render();
  return {stores:data.stores.length,categories:data.categories.length,products:data.products.length,observations:data.observations.length};
}
// Stable, local data interface. No network calls or credentials are used.
// Observation status: complete | partial | failed | pending.
// Link categories/products to an observationId to keep historical snapshots separate.
window.CompetitorBoard=Object.freeze({schemaVersion:1,getData:()=>clone(data),replaceData});
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
  const action=button.dataset.action;
  switch(action){
    case 'go-stores':navigate('stores');break;
    case 'go-records':navigate('records');break;
    case 'preview':navigate('preview');break;
    case 'geo-settings':openGeoSettings(button.dataset.id);break;
    case 'geo-connect':runGeoAction('connect');break;
    case 'geo-discover':runGeoAction('discover');break;
    case 'geo-resolve':runGeoAction('resolve');break;
    case 'geo-recompute':runGeoAction('recompute');break;
    case 'geo-select-own':runGeoAction('selectOwn',button.dataset.id);break;
    case 'geo-select-poi':runGeoAction('selectPoi',button.dataset.id);break;
    case 'help':showDialog('helpDialog');break;
    case 'add-store':showStoreForm();break;
    case 'edit-store':showStoreForm(button.dataset.id);break;
    case 'open-store':navigate('detail',button.dataset.id);break;
    case 'toggle-own-group':toggleOwnStoreGroup(button.dataset.id);break;
    case 'close-dialog':closeDialog(button.dataset.dialog);break;
    case 'reset-filters':resetListFilters();render();break;
    case 'toggle-data':$('#dataMenu').hidden=!$('#dataMenu').hidden;$('#dataMenuButton').setAttribute('aria-expanded',String(!$('#dataMenu').hidden));break;
    case 'export':saveNote(true);downloadJson({...clone(data),exportedAt:new Date().toISOString()},backupName());toast('已生成资料备份');break;
    case 'empty-template':downloadJson(clone(EMPTY_DATA),'竞品看板_空数据格式.json');break;
    case 'import':$('#importFile').click();break;
    case 'confirm-import':if(pendingImport){const next=clone(pendingImport);replaceData(next);toast(storageProblem||'备份已导入，资料已更新')}break;
    case 'match-group':matchView.group=button.dataset.group;if(matchView.group==='pending')matchView.origin='comp';matchView.page=1;matchView.status='';render();refreshMatching();break;
    case 'match-reset':Object.assign(matchView,{search:'',category:'',status:'',page:1});render();refreshMatching();break;
    case 'match-image':openMatchingImage(button.dataset.side,button.dataset.id);break;
    case 'match-source':openMatchingSource(button.dataset.id);break;
    case 'match-jump':jumpToMatchingProduct(button.dataset.id,button.dataset.category);break;
    case 'match-detail':openMatchingDetail(button.dataset.id);break;
    case 'detail-tab':saveNote(true);state.tab=button.dataset.tab;render();$('#tab-'+state.tab)?.focus({preventScroll:true});break;
    case 'review-unreadable':
      state.reviewUnreadable=!state.reviewUnreadable;
      button.setAttribute('aria-pressed',String(state.reviewUnreadable));
      selectCategory('');
      break;
    case 'category':selectCategory(button.dataset.id);break;
    case 'page':if(button.dataset.kind==='matching'){matchView.page=Number(button.dataset.page);refreshMatching();$('#matchingList')?.scrollIntoView({block:'start'});break}if(button.dataset.kind==='store'){state.storePage=Number(button.dataset.page);refreshStores()}else{state.productPage=Number(button.dataset.page);refreshProducts()}break;
    case 'order-buyer-evidence':openOrderBuyerEvidence(button.dataset.id);break;
    case 'product-evidence':openProductEvidence(button.dataset.id,button.dataset.occurrence);break;
    case 'thumbnail-evidence':openThumbnailEvidence(button.dataset.id);break;
    case 'product-image':openProductImage(button.dataset.id,button.dataset.occurrence);break;
    case 'product-image-zoom':zoomProductImage(button.dataset.direction);break;
    case 'open-product':openProduct(button.dataset.id,button.dataset.occurrence);break;
    case 'save-note':saveNote();break;
    case 'image':{
      const url=safeImage(button.dataset.url);if(!url)break;$('#imageDialog').innerHTML='<div class="modal-header"><h2 id="imageTitle">'+esc(button.dataset.label||'页面截图')+'</h2><button class="icon-btn" data-action="close-dialog" data-dialog="imageDialog" aria-label="关闭截图">'+icon('close',17)+'</button></div><div class="modal-body"><img src="'+esc(url)+'" alt="'+esc(button.dataset.label||'页面截图')+'" referrerpolicy="no-referrer"></div>';showDialog('imageDialog');break;
    }
  }
  if(action!=='toggle-data'){$('#dataMenu').hidden=true;$('#dataMenuButton').setAttribute('aria-expanded','false')}
});
document.addEventListener('click',event=>{if(!event.target.closest('.data-menu-wrap')){$('#dataMenu').hidden=true;$('#dataMenuButton').setAttribute('aria-expanded','false')}});
document.addEventListener('input',event=>{
  if(event.target.id==='matchSearch'){matchView.search=event.target.value;matchView.page=1;refreshMatching()}
  if(event.target.id==='storeSearch'){state.storeSearch=event.target.value;state.storePage=1;refreshStores()}
  if(event.target.id==='productSearch'){state.productSearch=event.target.value;state.productPage=1;refreshProducts()}
  if(event.target.id==='storeNote'){$('#noteSaveState').textContent='备注尚未保存';$('#noteSaveState').classList.remove('note-save-state')}
});
document.addEventListener('focusout',event=>{if(event.target.id==='storeNote')saveNote(true)});
document.addEventListener('change',event=>{
  if(event.target.id==='geoCompetitor')changeGeoSelection('competitor',event.target.value);
  if(event.target.id==='geoDistrict')changeGeoSelection('district',event.target.value);
  const fields={brandFilter:'brand',districtFilter:'district',businessFilter:'business',captureFilter:'capture',storeSort:'storeSort'};
  if(fields[event.target.id]){state[fields[event.target.id]]=event.target.value;state.storePage=1;refreshStores()}
  if(event.target.id==='matchCategory'){matchView.category=event.target.value;matchView.page=1;refreshMatching()}
  if(event.target.id==='matchOrigin'){matchView.origin=event.target.value;matchView.page=1;refreshMatching()}
  if(event.target.id==='matchStatus'){matchView.status=event.target.value;matchView.page=1;refreshMatching()}
  if(event.target.id==='productSort'){state.productSort=event.target.value;state.productPage=1;refreshProducts()}
});
document.addEventListener('keydown',event=>{
  const row=event.target.closest('tr[data-action]');if(row&&event.target===row&&(event.key==='Enter'||event.key===' ')){event.preventDefault();row.click()}
  const tab=event.target.closest('[role="tab"]');if(tab&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
    event.preventDefault();const values=['catalog','delivery','sources','matching'];const i=values.indexOf(state.tab);const next=event.key==='Home'?0:event.key==='End'?values.length-1:(i+(event.key==='ArrowRight'?1:values.length-1))%values.length;saveNote(true);state.tab=values[next];render();$('#tab-'+state.tab)?.focus({preventScroll:true});
  }
  if(event.key==='Escape'){$('#dataMenu').hidden=true;$('#dataMenuButton').setAttribute('aria-expanded','false')}
});
document.addEventListener('error',event=>{if(event.target instanceof HTMLImageElement){const parent=event.target.parentElement;if(parent.classList.contains('store-avatar')||parent.classList.contains('profile-icon'))parent.innerHTML=icon('store',parent.classList.contains('profile-icon')?31:20);else if(parent.classList.contains('product-image'))parent.innerHTML=icon('image',22);else event.target.replaceWith(Object.assign(document.createElement('span'),{textContent:'图片暂不可用'}))}},true);
window.addEventListener('beforeunload',()=>saveNote(true));
$('#dataIcon').innerHTML=icon('download',15);$('#chevronIcon').innerHTML=icon('down',12);
readData();applyRoute();


/* Public read-only snapshot. No local services, account state, or write endpoints. */
function safeLocalScreenshot(value){if(typeof value!=='string')return '';if(/^\/assets\/(?:img|evidence)\/[a-f0-9]+\.(?:png|jpe?g|webp|avif|gif)$/.test(value))return value;return window.PUBLIC_MANIFEST.evidence[value]||''}
function saveData(){return false}
function readData(){data=clone(EMBEDDED_SEED);updateStorageIndicator()}
function saveNote(){return false}
function updateStorageIndicator(){$('#localState').innerHTML='<span class="dot"></span>公开只读';$('#localState').title='查看已发布资料；更新由维护者重新发布'}
async function geoRequest(){throw Error('公开版展示已保存的地图资料，实时路线请打开高德地图')}
async function refreshGeoFromService(){}
function renderGeoSettings(){
 const store=data.stores.find(s=>s.id===geoUi.storeId)||data.stores[0];if(!store)return;
 const districts=[...new Set((data.ownStores||[]).map(s=>s.district).filter(Boolean))];geoUi.district=geoUi.district||store.district||districts[0];
 const rows=geoDistrictRows(store,geoUi.district);
 $('#geoSettingsDialog').innerHTML='<div class="modal-header"><h2 id="geoSettingsTitle">本店与竞品距离 · 已保存资料</h2><button class="icon-btn" data-action="close-dialog" data-dialog="geoSettingsDialog" aria-label="关闭">'+icon('close',17)+'</button></div><div class="modal-body"><p class="public-snapshot-note">以下为已核对并发布的高德定位和距离资料。门店名单可能不完整；实时位置与路线可通过高德链接查看。</p><label class="field"><span>竞品门店</span><select class="select" id="publicGeoStore">'+data.stores.map(s=>'<option value="'+esc(s.id)+'"'+(s.id===store.id?' selected':'')+'>'+esc(s.name)+'</option>').join('')+'</select></label><label class="field"><span>已收录本店所属区</span><select class="select" id="publicGeoDistrict">'+districts.map(d=>'<option'+(d===geoUi.district?' selected':'')+'>'+esc(d)+'</option>').join('')+'</select></label><p class="public-snapshot-note">已收录 '+rows.length+' 家本店；仅表示当前已保存名单。</p>'+rows.map(({own,distance})=>'<div class="public-geo-row"><div><strong>'+esc(own.name)+'</strong><p>'+esc(own.address||'地址未取得')+'</p></div><div class="distance">'+(distance?esc(formatStoreDistance(distance.distanceMeters)):'距离未取得')+'</div></div>').join('')+'<div class="actions" style="margin-top:18px">'+geoMapLink(store)+geoRouteLink(store)+'</div></div>';
}
async function openGeoSettings(storeId){geoUi.storeId=storeId||state.storeId||data.stores[0]?.id;geoUi.district=data.stores.find(s=>s.id===geoUi.storeId)?.district||'';renderGeoSettings();showDialog('geoSettingsDialog')}
function publicHelp(){
 $('#helpDialog').innerHTML='<div class="modal-header"><h2 id="helpTitle">公开看板使用说明</h2><button class="icon-btn" data-action="close-dialog" data-dialog="helpDialog" aria-label="关闭">'+icon('close',17)+'</button></div><div class="modal-body"><p>点击门店查看分类与商品；可搜索、排序、查看采集截图与匹对结果。</p><p>“全部比对记录”表示所有商品均参与检索；共同主品、名单差异和待核实分别展示。待核实不等于缺品，空白不等于0。</p><p>数据为已发布的采集快照，不代表此刻库存、价格或销量。来源截图以网页格式压缩，保持原尺寸；本地保留原文件。</p><p>本网站为只读展示，资料更新由维护者重新发布。高德部分展示已保存的定位与距离，实时路线请打开高德地图。</p></div>';showDialog('helpDialog');
}
document.addEventListener('click',event=>{
 const b=event.target.closest('[data-action]');if(!b)return;
 const blocked=['add-store','edit-store','save-note','toggle-data','export','import','empty-template','confirm-import','geo-action'];
 if(blocked.includes(b.dataset.action)){event.preventDefault();event.stopImmediatePropagation();toast('公开版只读，资料由维护者更新')}
 if(b.dataset.action==='help'){event.preventDefault();event.stopImmediatePropagation();publicHelp()}
},true);
document.addEventListener('submit',event=>{event.preventDefault();event.stopImmediatePropagation()},true);
document.addEventListener('change',event=>{
 if(event.target.id==='publicGeoStore'){geoUi.storeId=event.target.value;geoUi.district=data.stores.find(s=>s.id===geoUi.storeId)?.district||'';renderGeoSettings()}
 if(event.target.id==='publicGeoDistrict'){geoUi.district=event.target.value;renderGeoSettings()}
});
window.PUBLIC_APP_READY=true;
