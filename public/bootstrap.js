'use strict';
window.PUBLIC_MATCH_LOADING = {};
window.PUBLIC_MATCH_ERRORS = {};
window.PUBLIC_STORE_READY = {};
window.PUBLIC_STORE_ERRORS = {};
const publicStoreTasks = new Map();
const publicScriptTasks = new Map();
const PUBLIC_STARTUP_VERSION = '20261106-fast-start-v1';

async function publicFetch(url, parse = 'json') {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const target = new URL(url, location.href);
      target.searchParams.set('v', PUBLIC_STARTUP_VERSION);
      const response = await fetch(target.href, { signal: controller.signal, cache: attempt ? 'reload' : 'default' });
      if (!response.ok) throw Error('资料暂时未能取得，请重试。');
      return await (parse === 'bytes' ? response.arrayBuffer() : response.json());
    } catch (error) {
      lastError = error.name === 'AbortError' ? Error('网络读取超时，请重试。') : error;
    } finally { clearTimeout(timer); }
  }
  throw lastError;
}

async function publicJsonParts(parts) {
  const strings = await Promise.all(parts.map(async url => {
    const bytes = new Uint8Array(await publicFetch(url, 'bytes'));
    if (bytes[0] === 31 && bytes[1] === 139) {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      return new Response(stream).text();
    }
    return new TextDecoder().decode(bytes);
  }));
  return JSON.parse(strings.join(''));
}

function publicLoadStore(id) {
  if (window.PUBLIC_STORE_READY[id]) return Promise.resolve();
  if (publicStoreTasks.has(id)) return publicStoreTasks.get(id);
  if (window.PUBLIC_STORE_ERRORS[id]) return Promise.reject(Error(window.PUBLIC_STORE_ERRORS[id]));
  const url = window.PUBLIC_MANIFEST.storePacks[id];
  if (!url) return Promise.reject(Error('这家门店的资料尚未发布。'));
  const task = publicFetch(url).then(pack => {
    if (pack.storeId !== id || !Array.isArray(pack.products) || !Array.isArray(pack.categories)) throw Error('门店资料未能完整读取，请重试。');
    data.products = data.products.filter(p => p.storeId !== id).concat(pack.products);
    data.categories = data.categories.filter(c => c.storeId !== id).concat(pack.categories);
    window.PUBLIC_STORE_READY[id] = true;
    delete window.PUBLIC_STORE_ERRORS[id];
  }).catch(error => {
    window.PUBLIC_STORE_ERRORS[id] = error.message;
    throw error;
  }).finally(() => {
    publicStoreTasks.delete(id);
    if (state.route === 'detail' && state.storeId === id) render();
  });
  publicStoreTasks.set(id, task);
  return task;
}

function publicStoreLoadingMarkup(id) {
  const store = data.stores.find(s => s.id === id);
  const error = window.PUBLIC_STORE_ERRORS[id];
  return '<section class="panel" style="padding:30px" role="status"><h2>' + esc(store?.name || '门店商品资料') + '</h2><p style="margin:14px 0">' + (error ? esc(error) : '正在加载这家门店的商品，请稍候。') + '</p>' + (error ? '<button class="btn primary" data-public-action="retry-store" data-store="' + esc(id) + '">重新加载</button> ' : '') + '<button class="btn" data-action="go-stores">返回门店列表</button></section>';
}

async function publicLoadMatching(id) {
  if (!window.PUBLIC_MANIFEST.matching[id] || window.PUBLIC_MATCH_LOADING[id] || window.PUBLIC_MATCH_ERRORS[id]) return;
  window.PUBLIC_MATCH_LOADING[id] = true;
  try {
    ADDITIONAL_MATCHING_DATA[id] = await publicJsonParts(window.PUBLIC_MANIFEST.matching[id]);
  } catch (error) { window.PUBLIC_MATCH_ERRORS[id] = error.message; }
  finally {
    window.PUBLIC_MATCH_LOADING[id] = false;
    if (state.storeId === id && state.tab === 'matching') render();
  }
}

function publicLoadScript(url, timeout = 20000) {
  if (publicScriptTasks.has(url)) return publicScriptTasks.get(url);
  const task = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timer = setTimeout(() => { script.remove(); reject(Error('组件加载超时，请重试。')); }, timeout);
    script.src = url;
    script.onload = () => { clearTimeout(timer); resolve(); };
    script.onerror = () => { clearTimeout(timer); script.remove(); reject(Error('组件暂时未能加载，请重试。')); };
    document.body.appendChild(script);
  }).catch(error => { publicScriptTasks.delete(url); throw error; });
  publicScriptTasks.set(url, task);
  return task;
}

let publicReportBusy = false;
async function publicOpenReport(button) {
  if (publicReportBusy) return;
  publicReportBusy = true;
  const label = button.textContent;
  button.disabled = true;
  button.textContent = '正在准备报表…';
  try {
    for (const store of data.stores) delete window.PUBLIC_STORE_ERRORS[store.id];
    await Promise.all(data.stores.map(store => publicLoadStore(store.id)));
    await Promise.all([
      publicLoadScript('/vendor/exceljs-4.4.0.min.js'),
      publicLoadScript('/vendor/jszip-3.10.1.min.js'),
    ]);
    await publicLoadScript('/report-export.js?v=' + PUBLIC_STARTUP_VERSION);
    window.CompetitorReportOpen();
  } catch (error) { toast(error.message || '报表资料暂未加载完成，请重试。'); }
  finally { publicReportBusy = false; button.disabled = false; button.textContent = label; }
}

document.addEventListener('click', event => {
  const retry = event.target.closest('[data-public-action]');
  if (retry) {
    if (retry.dataset.publicAction === 'reload-page') location.reload();
    if (retry.dataset.publicAction === 'retry-store') {
      delete window.PUBLIC_STORE_ERRORS[retry.dataset.store];
      render();
    }
    if (retry.dataset.publicAction === 'retry-matching') {
      delete window.PUBLIC_MATCH_ERRORS[state.storeId];
      render();
    }
  }
  const entry = event.target.closest('[data-action="report-export"]');
  if (entry) {
    event.preventDefault(); event.stopImmediatePropagation();
    if (window.PUBLIC_APP_READY) publicOpenReport(entry);
  }
}, true);

function publicStartupFailure() {
  document.querySelector('#main').innerHTML = '<section class="panel" style="padding:30px" role="alert"><h2>资料暂未加载完成</h2><p style="margin:14px 0">网络读取较慢或页面组件加载失败，请重新加载。不会影响已保存的门店资料。</p><button class="btn primary" data-public-action="reload-page">重新加载</button></section>';
}

(async () => {
  try {
    const startup = JSON.parse(document.querySelector('#public-startup-data').textContent);
    window.PUBLIC_MANIFEST = startup.manifest;
    window.PUBLIC_SEED = startup.seed;
    await publicLoadScript('/app.js?v=' + PUBLIC_STARTUP_VERSION);
    if (!window.PUBLIC_APP_READY) throw Error('页面未完成初始化');
  } catch { publicStartupFailure(); }
})();
