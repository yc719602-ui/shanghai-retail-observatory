/* Selectable product reports. All files are assembled in the visitor's browser. */
(() => {
  'use strict';

  const fields = [
    { id: 'store', label: '竞品门店', width: 37, selected: true, read: r => r.context.store.name },
    { id: 'ownStore', label: '对应本店', width: 35, read: r => r.ownStore?.name || '' },
    { id: 'district', label: '所属行政区', width: 16, read: r => r.context.store.district || '' },
    { id: 'name', label: '商品名称', width: 62, selected: true, read: r => r.product.name },
    { id: 'image', label: '商品主图', width: 12, selected: true },
    { id: 'screenshot', label: '原始截图', width: 14 },
    { id: 'category', label: '所属一级分类', width: 24, selected: true, read: r => r.primaryCategory },
    { id: 'categoryOrder', label: '一级分类序号', width: 16, read: r => r.categoryOrder ?? '' },
    { id: 'categoryPosition', label: '分类内记录序号', width: 19, read: r => r.categoryPosition ?? '' },
    { id: 'orderStatus', label: '顺序核对状态', width: 42, read: r => r.orderStatus },
    { id: 'allCategories', label: '全部出现分类', width: 40, read: r => r.categories.join(' / ') },
    { id: 'sales', label: '页面展示销量', width: 19, selected: true, read: r => r.product.displayedSales || '' },
    { id: 'price', label: '现价（元）', width: 14, selected: true, numeric: true, read: r => recordedPrice(r.product, 'price') },
    { id: 'priceRecordedDate', label: '价格录屏日期', width: 18, read: r => r.product.priceReview?.status !== 'notVerifiedInNewRecording' ? r.product.priceReview?.recordedDate || r.product.sourceMedia?.recordedDate || '' : r.product.sourceMedia?.recordedDate || '' },
    { id: 'priceVideoPosition', label: '价格录屏位置', width: 32, read: r => [r.product.priceReview?.sourceMedia?.videoName, r.product.priceReview?.sourceMedia?.videoTimeLabel].filter(Boolean).join(' ') },
    { id: 'priceQualifier', label: '价格标记', width: 13, read: r => r.product.priceQualifier || '' },
    { id: 'originalPrice', label: '原价（元）', width: 14, numeric: true, read: r => recordedPrice(r.product, 'originalPrice') },
    { id: 'specification', label: '已记录规格', width: 34, read: r => r.product.specification || '' },
    { id: 'promotion', label: '优惠条件', width: 38, read: r => r.product.promotion || '' },
    { id: 'status', label: '售卖状态', width: 16, read: r => ({ available: '可选购', soldout: '已售罄', off: '已下架' }[r.product.saleStatus] || r.product.saleStatus || '') },
    { id: 'capturedAt', label: '资料采集时间', width: 26, read: r => sourceTime(r) },
    { id: 'videoPosition', label: '录屏位置', width: 30, read: r => [r.product.sourceMedia?.videoLabel, r.product.sourceMedia?.videoTimeLabel].filter(Boolean).join(' ') },
    { id: 'unreadable', label: '未看清字段', width: 24, read: r => unreadableLabels(r.product).join('、') },
    { id: 'id', label: '商品记录编号', width: 35, read: r => r.product.id },
  ];
  const scopes = [
    ['ordinary', '普通商品（去重，组包另存，推荐和活动不另计）'],
    ['bundles', '仅组包 / 套餐'],
    ['all', '全部已收录记录（含组包，按记录编号去重）'],
    ['filtered', '当前商品筛选结果（全部分页，按商品去重）'],
  ];
  let busy = false;
  let rows = [];
  let currentStore = '';
  let filteredSnapshot = null;
  let filteredCategory = '';
  let filteredUnreadable = false;
  let sourceFolder = null;
  let sourceFiles = new Map();
  let lastExport = null;
  let preparedReport = null;
  const pendingSources = new Map();
  const dialog = document.createElement('dialog');
  dialog.id = 'reportExportDialog';
  dialog.className = 'modal report-export-dialog';
  dialog.setAttribute('aria-labelledby', 'reportExportTitle');
  document.body.appendChild(dialog);

  function deadline(promise, milliseconds) {
    let timer;
    return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('读取超时')), milliseconds); })])
      .finally(() => clearTimeout(timer));
  }

  // Script resources can be read from file:// without uploading or folder access.
  window.CompetitorReportReceiveScreenshot = (file, value) => pendingSources.get(file)?.resolve(value);
  let localIndexState = location.protocol === 'file:' ? 'loading' : 'unused';
  const localIndexReady = location.protocol === 'file:' ? new Promise(resolve => {
    const script = document.createElement('script');
    script.src = '报表截图/索引.js?v=20261106-report-sources-v1';
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      localIndexState = window.CompetitorReportScreenshotIndex ? 'ready' : 'missing';
      script.remove(); resolve();
      if (dialog.open) refreshPreview();
    };
    const timer = setTimeout(finish, 15000);
    script.onload = script.onerror = finish;
    document.head.appendChild(script);
  }) : Promise.resolve();

  function bundledSource(evidence) {
    const file = window.CompetitorReportScreenshotIndex?.[evidence.localPath];
    return typeof file === 'string' && /^报表截图\/[a-f0-9]{12,128}\.js$/.test(file) ? file : '';
  }

  async function bundledScreenshot(evidence) {
    await localIndexReady;
    const file = bundledSource(evidence);
    if (!file) return null;
    const script = document.createElement('script');
    const source = new Promise((resolve, reject) => {
      pendingSources.set(file, { resolve, reject });
      script.src = file;
      script.onerror = () => reject(new Error('配套截图文件缺失'));
      document.head.appendChild(script);
    });
    try {
      const uri = await deadline(source, 15000);
      if (!/^data:image\/(?:avif|png|jpeg|webp);base64,/.test(uri)) throw new Error('配套截图格式无效');
      return (await fetch(uri)).blob();
    } finally { script.remove(); pendingSources.delete(file); }
  }

  function recordedPrice(product, key) {
    if (!has(product[key])) return product.fieldStatus?.[key] === '未看清' ? '未看清' : '';
    const value = Number(product[key]);
    return Number.isFinite(value) ? value : String(product[key]);
  }

  function sourceTime(row) {
    const media = row.product.sourceMedia;
    const value = row.product.capturedAt || media?.recordedAt || media?.recordingStartedAt || row.context.observation?.capturedAt;
    return value ? exactDateText(value) : media?.recordedDate || '';
  }

  function fileStem(value) {
    return String(value || '').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').replace(/[.\s]+$/g, '').trim().slice(0, 70)
      .replace(/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, '_$1');
  }

  function clockSuffix() {
    return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Shanghai', hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      .format(new Date()).replace(/:/g, '-');
  }

  function reportSize(blob) {
    return blob.size >= 1048576 ? (blob.size / 1048576).toFixed(1) + ' MB' : Math.ceil(blob.size / 1024) + ' KB';
  }

  function clearPrepared() {
    if (preparedReport?.url) {
      const url = preparedReport.url;
      setTimeout(() => URL.revokeObjectURL(url), 300000);
    }
    preparedReport = null;
    const panel = dialog.querySelector('#reportReadyPanel');
    if (panel) panel.hidden = true;
  }

  function preparedDownloadName(fallback) {
    const stem = fileStem((dialog.querySelector('#reportFileName')?.value || '').replace(/\.(xlsx|zip)$/i, ''));
    return stem ? stem + '.' + preparedReport.format : fallback;
  }

  function showPreparedLink(filename) {
    if (!preparedReport) return;
    const link = dialog.querySelector('#reportReadyDownload');
    link.href = preparedReport.url;
    link.download = filename;
    link.title = filename;
    link.textContent = '下载已生成文件（' + reportSize(preparedReport.blob) + '）';
    dialog.querySelector('#reportReadyPanel').hidden = false;
  }

  function browserDownload(filename) {
    showPreparedLink(filename);
    const link = document.createElement('a');
    link.href = preparedReport.url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function saveFailureReason(error) {
    return ({ NoModificationAllowedError: '所选文件被占用或无法改写', NotAllowedError: '浏览器未允许写入所选位置',
      SecurityError: '浏览器不允许使用系统保存窗口', NotFoundError: '所选保存位置已不可用', QuotaExceededError: '所选位置没有足够空间' })[error.name] || '系统保存未完成';
  }

  function selectedFields() {
    const ids = new Set([...dialog.querySelectorAll('[name="reportField"]:checked')].map(input => input.value));
    return fields.filter(field => ids.has(field.id));
  }

  function contextFor(store) {
    const observation = latest(store.id);
    return {
      store,
      observation,
      products: currentRows('products', store.id, observation),
      categories: currentRows('categories', store.id, observation).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)),
    };
  }

  function positiveOrder(value) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
  }

  function categoryPositions(context) {
    return new Map(context.categories.map(category => {
      const positions = new Map();
      (category.listingSequence || []).forEach((entry, index) => {
        if (!positions.has(entry.productId)) positions.set(entry.productId, positiveOrder(entry.order) || index + 1);
      });
      return [category.id, positions];
    }));
  }

  function orderStatus(category, position) {
    if (!category) return '未关联一级分类，顺序待核对';
    if (position === null) return '未关联分类内位置，顺序待核对';
    if (category.replaySkippedByUser) return '排序未核对（' + category.name + '）';
    const status = category.orderEvidence?.status;
    const label = ({ reconstructed: '采集时分类顺序已核对', partial: '分类顺序仅部分核对', conflict: '分类顺序有冲突，待核对' })[status] || '分类顺序待核对';
    return label + (category.orderEvidence?.scope ? '；' + category.orderEvidence.scope : '');
  }

  function sortRows() {
    if (dialog.querySelector('#reportSort')?.value === 'recorded') return;
    rows.sort((a, b) => a.storeIndex - b.storeIndex || a.categoryIndex - b.categoryIndex
      || (a.categoryPosition ?? Infinity) - (b.categoryPosition ?? Infinity) || a.recordIndex - b.recordIndex);
  }

  function reportOrderNotes(reportRows) {
    const categorySorted = dialog.querySelector('#reportSort')?.value !== 'recorded';
    const format = dialog.querySelector('#reportFormat')?.value;
    const lines = [categorySorted ? '排序：按门店、平台左侧一级分类顺序、分类内已保存的位置排列；未确认位置排在该分类末尾。'
      : '排序：保留当前筛选结果顺序；非筛选范围保留数据保存顺序。',
      '商品仍按记录编号去重，只保留一行；按分类排序时，同一分类的重复展示保留最早已记录的位置，因此分类内序号可能不连续。',
      '所属一级分类为本次导出归组使用的一个分类；全部出现分类保留已采集的其他出现位置。筛选单个分类时，导出归组为所选分类。',
      '商品名称、价格、销量、主图和原始截图沿用原采集记录。分类内记录序号用于定位采集页面，不表示当前客户端的实时排名。',
      '类目顺序或商品位置未核对的情况列于下表。可勾选一级分类序号、分类内记录序号和顺序核对状态，逐条查看。'];
    lines.push(format === 'xlsx' ? '图片为WPS原生单元格图片，请使用WPS打开并双击预览。使用Microsoft Excel时，请在工作台选择Excel通用表格后导出。'
      : format === 'xlsx-generic' ? '图片为普通内嵌浮动图片，无文字或跳转链接。' : '图片按独立PNG文件保存，商品清单列出对应文件名。');
    const groups = new Map();
    for (const row of reportRows) {
      const key = row.context.store.id + ':' + row.categoryIndex;
      if (!groups.has(key)) groups.set(key, { row, count: 0, missing: 0 });
      const group = groups.get(key); group.count++; if (row.categoryPosition === null) group.missing++;
    }
    return { lines, groups: [...groups.values()].sort((a, b) => a.row.storeIndex - b.row.storeIndex || a.row.categoryIndex - b.row.categoryIndex) };
  }

  // Match the evidence button, with an explicit category for multi-store exports.
  function sourceEvidence(context, product, category, unreadable) {
    const placement = !unreadable && category ? product._sourceOccurrence || product.categoryPlacements?.[category] : null;
    const proof = placement?.fieldEvidence?.price || (product.priceReview?.sourceScreenshot ? product.priceReview : null) || placement?.fieldEvidence?.name || product.fieldReview;
    const filename = proof?.sourceScreenshot || placement?.sourceScreenshot || product.sourceScreenshot;
    const base = context.observation?.screenshotBasePath;
    const localPath = proof?.sourceScreenshotUrl || (base && filename ? base + '/' + filename : '');
    return { url: localPath ? safeLocalScreenshot(localPath) : '', localPath, filename };
  }

  function imageField(field) { return field.id === 'image' || field.id === 'screenshot'; }

  function imageSource(row, field) {
    return field.id === 'screenshot' ? row.evidence?.url || '' : safeImage(row.product.imageUrl);
  }

  function missingImage(row, field) {
    return field.id === 'screenshot' ? '原始截图未关联'
      : row.product.imageAvailability === 'notLoadedInRecording' ? '录屏主图未加载' : '主图未记录';
  }

  function localEvidenceSelected(chosen) {
    return location.protocol === 'file:' && chosen.some(field => field.id === 'screenshot') && rows.some(row => row.evidence.url && !bundledSource(row.evidence));
  }

  async function selectSourceFolder() {
    try {
      if (typeof window.showDirectoryPicker === 'function') {
        const candidate = await window.showDirectoryPicker({ id: 'competitor-source-screenshots', mode: 'read' });
        const old = sourceFolder;
        sourceFolder = candidate;
        const samples = rows.filter(row => row.evidence.url && !bundledSource(row.evidence)).slice(0, 3);
        try { for (const row of samples) await deadline(localScreenshotFile(row.evidence), 15000); }
        catch { sourceFolder = old; throw new Error('此文件夹没有对应截图。请选看板旁的“采集记录”文件夹，而不是原视频文件夹。'); }
        clearPrepared();
        lastExport = null;
        refreshPreview();
      } else dialog.querySelector('#reportSourceFiles').click();
    } catch (error) {
      if (error.name !== 'AbortError') feedback(error.message || '无法读取截图文件夹，请重新选择。', 'error');
    }
  }

  async function localScreenshotFile(evidence) {
    const parts = evidence.localPath.split('/');
    if (!parts.length || parts.some(part => !part || part === '.' || part === '..' || /[\\:]/.test(part))) throw new Error('截图路径无效');
    if (sourceFolder) {
      const start = parts.indexOf(sourceFolder.name);
      const relative = start >= 0 ? parts.slice(start + 1) : parts;
      let directory = sourceFolder;
      for (const part of relative.slice(0, -1)) directory = await directory.getDirectoryHandle(part);
      return (await directory.getFileHandle(relative.at(-1))).getFile();
    }
    for (const candidate of [parts.join('/'), parts.slice(1).join('/')]) {
      if (sourceFiles.has(candidate)) return sourceFiles.get(candidate);
    }
    throw new Error('所选文件夹中未找到对应截图');
  }

  function updateRows() {
    const storeIds = new Set([...dialog.querySelectorAll('[name="reportStore"]:checked')].map(input => input.value));
    const scopeName = dialog.querySelector('#reportScope').value;
    const filteredAllowed = filteredSnapshot && storeIds.size === 1 && storeIds.has(currentStore);
    const filteredOption = dialog.querySelector('#reportScope option[value="filtered"]');
    filteredOption.disabled = !filteredAllowed;
    if (scopeName === 'filtered' && !filteredAllowed) dialog.querySelector('#reportScope').value = 'ordinary';
    const scope = dialog.querySelector('#reportScope').value;
    rows = [];
    for (const store of data.stores.filter(store => storeIds.has(store.id))) {
      const context = contextFor(store);
      const counting = catalogCountingScope(context);
      const positions = categoryPositions(context);
      const candidates = scope === 'filtered' ? filteredSnapshot : counting.uniqueProducts;
      const unique = new Map();
      candidates.forEach(product => {
        const previous = unique.get(product.id);
        const firstCategoryOccurrence = scope === 'filtered' && filteredCategory && dialog.querySelector('#reportSort')?.value !== 'recorded'
          && (positiveOrder(product._sourceOccurrence?.order) ?? Infinity) < (positiveOrder(previous?._sourceOccurrence?.order) ?? Infinity);
        if (!previous || firstCategoryOccurrence) unique.set(product.id, product);
      });
      const ownStore = (data.ownStores || []).find(own => own.id === store.ownStoreMatch?.ownStoreId);
      for (const product of unique.values()) {
        if (scope === 'ordinary' && !counting.countedIds.has(product.id)) continue;
        if (scope === 'bundles' && !counting.bundleIds.has(product.id)) continue;
        const memberships = counting.members.get(product.id) || new Set();
        const categories = context.categories.filter(category => memberships.has(category.id));
        const primary = (scope === 'filtered' && filteredCategory ? categories.find(category => category.id === filteredCategory) : null)
          || categories.find(category => category.id === product.categoryId && !isPromotionEntry(category))
          || categories.find(category => !isPromotionEntry(category)) || categories[0];
        const position = primary ? positions.get(primary.id)?.get(product.id) ?? positiveOrder(product.categoryPlacements?.[primary.id]?.order) : null;
        rows.push({ product, context, ownStore, category: primary, primaryCategory: primary?.name || '', categories: categories.map(category => category.name),
          categoryOrder: positiveOrder(primary?.order), categoryPosition: position, categoryIndex: primary ? context.categories.indexOf(primary) : Infinity,
          storeIndex: data.stores.indexOf(store), recordIndex: rows.length, orderStatus: orderStatus(primary, position),
          evidence: sourceEvidence(context, product, scope === 'filtered' ? filteredCategory : '', scope === 'filtered' && filteredUnreadable) });
      }
    }
    sortRows();
  }

  function refreshPreview() {
    updateRows();
    const chosen = selectedFields();
    const images = rows.filter(row => Boolean(row.product.imageUrl)).length;
    dialog.querySelector('#reportSelectionCount').textContent = `${rows.length.toLocaleString('zh-CN')} 条商品记录 · ${chosen.length} 个字段`;
    const counts = [];
    if (chosen.some(field => field.id === 'image')) counts.push(`已记录主图 ${images.toLocaleString('zh-CN')} 张`);
    if (chosen.some(field => field.id === 'screenshot')) counts.push(`已关联原始截图 ${rows.filter(row => row.evidence.url).length.toLocaleString('zh-CN')} 条（同一画面可对应多个商品）`);
    dialog.querySelector('#reportImageCount').textContent = counts.length ? counts.join('；') + '。原记录缺失的字段会注明；读取失败将停止导出。' : '按勾选字段生成商品报表。';
    const wantsScreenshots = chosen.some(field => field.id === 'screenshot');
    const indexPending = location.protocol === 'file:' && wantsScreenshots && localIndexState === 'loading';
    const needsFolder = !indexPending && localEvidenceSelected(chosen);
    const missingSources = needsFolder ? rows.filter(row => row.evidence.url && !bundledSource(row.evidence)).length : 0;
    dialog.querySelector('#reportLocalSources').hidden = !needsFolder;
    dialog.querySelector('#reportSourceFolderStatus').textContent = sourceFolder ? '已校验：' + sourceFolder.name
      : sourceFiles.size ? '已选择本地截图文件夹' : missingSources + ' 条记录缺少导出配套截图。请选择看板旁的“采集记录”文件夹；原视频文件夹不包含这些截图。';
    if (wantsScreenshots && !indexPending && !needsFolder && location.protocol === 'file:') {
      dialog.querySelector('#reportImageCount').textContent += ' 配套原始截图已就绪，无需选择文件夹。';
    }
    const headings = chosen.map(field => '<th>' + esc(field.label) + '</th>').join('');
    const previewRows = rows.slice(0, 3).map(row => {
      const cells = chosen.map(field => {
        if (!imageField(field)) return '<td>' + esc(field.read(row)) + '</td>';
        const url = imageSource(row, field);
        const target = field.id === 'screenshot' && location.protocol === 'file:' ? row.evidence.localPath : url;
        return '<td>' + (url ? '<button type="button" class="report-preview-picture" data-action="image" data-url="' + esc(target) + '" data-label="' + esc(row.product.name + ' · ' + field.label)
          + '" aria-label="放大查看' + field.label + '" title="点击查看大图"><img src="' + esc(url) + '" alt="' + field.label + '"></button>' : missingImage(row, field)) + '</td>';
      }).join('');
      return '<tr>' + cells + '</tr>';
    }).join('');
    dialog.querySelector('#reportPreview').innerHTML = !chosen.length || !rows.length
      ? '<p class="report-empty">请选择门店、导出范围和至少一个字段。</p>'
      : '<table><thead><tr>' + headings + '</tr></thead><tbody>' + previewRows + '</tbody></table>';
    const missingFolder = needsFolder && !sourceFolder && !sourceFiles.size;
    dialog.querySelector('#reportStart').disabled = busy || !rows.length || !chosen.length || indexPending || missingFolder;
    dialog.querySelector('#reportBrowserStart').disabled = dialog.querySelector('#reportStart').disabled;
    if (!busy && !lastExport && !preparedReport) {
      if (indexPending) feedback('正在检查导出所需的原始截图，请稍候…', 'idle');
      else if (missingFolder) feedback('暂不能导出：' + missingSources + ' 条记录缺少配套截图，请在上方选择“采集记录”文件夹。', 'error');
      else if (!rows.length || !chosen.length) feedback('请选择门店和至少一个导出字段。', 'idle');
      else feedback('已准备好 ' + rows.length.toLocaleString('zh-CN') + ' 条记录' + (wantsScreenshots ? '及原始截图' : '') + '，点击下方按钮即可导出。', 'idle');
    }
  }

  function openExport() {
    if (busy) return;
    if (typeof data === 'undefined' || !data.stores?.length) {
      toast('当前还没有可导出的门店资料');
      return;
    }
    clearPrepared();
    currentStore = state.preview ? '' : state.storeId || '';
    filteredSnapshot = currentStore && state.route === 'detail' && state.tab === 'catalog'
      ? filteredProducts(getDetailContext()).map(product => ({ ...product })) : null;
    filteredCategory = state.category || '';
    filteredUnreadable = Boolean(state.reviewUnreadable);
    const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date());
    const picker = typeof window.showSaveFilePicker === 'function';
    const stores = [...data.stores].sort((a, b) => Number(b.id === currentStore) - Number(a.id === currentStore));
    dialog.innerHTML = '<div class="modal-header"><div><h2 id="reportExportTitle">导出商品报表</h2><p class="report-hint">勾选字段后，预览将随选择更新。</p></div>'
      + '<button class="icon-btn" data-action="close-dialog" data-dialog="reportExportDialog" aria-label="关闭">' + icon('close', 17) + '</button></div>'
      + '<div class="modal-body report-export-body"><section><div class="report-section-head"><h3>导出门店</h3><div><button class="report-text-button" data-report="all-stores">全选</button>'
      + '<button class="report-text-button" data-report="current-store"' + (!currentStore ? ' disabled' : '') + '>只选当前门店</button></div></div><div class="report-stores">'
      + stores.map(store => '<label class="report-store-option"><input type="checkbox" name="reportStore" value="' + esc(store.id) + '"'
        + (!currentStore || store.id === currentStore ? ' checked' : '') + '><span>' + esc(store.name) + '</span></label>').join('') + '</div></section>'
      + '<div class="report-setting-grid"><label class="field"><span>导出范围</span><select class="select" id="reportScope">'
      + scopes.map(([value, label]) => '<option value="' + value + '">' + label + '</option>').join('') + '</select></label>'
      + '<label class="field"><span>文件格式</span><select class="select" id="reportFormat"><option value="xlsx">WPS表格（单元格图片，双击预览）</option><option value="xlsx-generic">Excel通用表格（浮动小图）</option><option value="zip">图文压缩包（图片文件＋商品清单）</option></select></label></div>'
      + '<label class="field"><span>导出排序</span><select class="select" id="reportSort"><option value="category">平台一级分类顺序 → 分类内记录顺序</option><option value="recorded">保留当前筛选顺序 / 数据保存顺序</option></select></label>'
      + '<p class="report-hint">默认按左侧一级分类从上到下归组，类内按已保存的页面或录屏顺序排列；未关联位置的商品排在类目末尾，未核对的顺序会注明。去重后序号可能有间隔。Excel 的“排序说明”及压缩包的说明文件保留核对状态，不表示当前实时排名。</p>'
      + '<section><div class="report-section-head"><h3>选择导出字段</h3><div><button class="report-text-button" data-report="all-fields">全选</button><button class="report-text-button" data-report="clear-fields">清空</button></div></div><div class="report-fields">'
      + fields.map(field => '<label><input type="checkbox" name="reportField" value="' + field.id + '"' + (field.selected ? ' checked' : '') + '><span>' + esc(field.label) + '</span></label>').join('') + '</div></section>'
      + '<p class="report-hint">默认导出WPS原生单元格图片：主图和截图都只显示小图，在WPS中双击图片预览。没有跳转链接或额外文字，无需手动调整图片大小。使用Microsoft Excel时请选择“Excel通用表格”。压缩包保留完整截图。上方预览图片也可点击放大。</p>'
      + '<section id="reportLocalSources" hidden><button class="btn" data-report="source-folder">选择本地截图文件夹</button><input id="reportSourceFiles" type="file" webkitdirectory multiple hidden><p class="report-hint" id="reportSourceFolderStatus"></p></section>'
      + '<section class="report-preview-section"><div class="report-section-head"><h3 id="reportSelectionCount"></h3><span class="muted">预览前 3 条</span></div><p class="report-hint" id="reportImageCount"></p><div id="reportPreview" class="report-preview"></div></section>'
      + '<label class="field"><span>文件名称</span><input class="input" id="reportFileName" value="竞品商品报表_' + today + '_' + clockSuffix() + '" maxlength="70"></label>'
      + '<p class="report-hint">销量保留页面原文；采集时未取得的内容留空。普通商品范围沿用看板的去重统计口径。</p>'
      + '<p class="report-hint">' + (picker ? '可选择保存位置；如文件被WPS或Excel占用、或系统保存失败，可改用“普通下载”。生成好的文件会保留，重试无需重新生成。' : '此浏览器按下载设置保存文件。开启“每次下载询问保存位置”后，可选择电脑文件夹。') + '</p>'
      + '</div><div class="modal-footer report-export-footer"><div class="report-export-feedback" id="reportExportFeedback" data-state="idle"><div id="reportExportStatus" role="status" aria-live="polite">请选择导出内容，点击按钮后将在这里显示进度与保存结果。</div><progress id="reportExportProgress" max="100" value="0" hidden></progress><div id="reportReadyPanel" hidden><a id="reportReadyDownload">下载已生成文件</a></div></div><div class="report-export-actions"><button class="btn" data-action="close-dialog" data-dialog="reportExportDialog">关闭</button><div class="report-save-actions"><button class="btn" id="reportBrowserStart" data-report="browser-start">普通下载</button><button class="btn primary" id="reportStart" data-report="start">'
      + icon('download', 16) + (picker ? '选择保存位置并导出' : '下载报表') + '</button></div></div></div>';
    refreshPreview();
    if (lastExport) feedback(lastExport.message, lastExport.state);
    showDialog(dialog.id);
  }

  function feedback(message, state) {
    dialog.querySelector('#reportExportStatus').textContent = message;
    dialog.querySelector('#reportExportFeedback').dataset.state = state;
  }

  function progress(message, value) {
    feedback(message + (value < 100 ? ' · ' + Math.round(value) + '%' : ''), 'working');
    const bar = dialog.querySelector('#reportExportProgress');
    bar.hidden = false;
    bar.value = value;
  }

  function setBusy(value) {
    busy = value;
    dialog.querySelectorAll('input, select, [data-report]').forEach(control => { control.disabled = value; });
    dialog.querySelectorAll('[data-action="close-dialog"]').forEach(control => { control.disabled = value; });
    const button = dialog.querySelector('#reportStart');
    button.setAttribute('aria-busy', String(value));
    button.textContent = value ? '正在导出，请稍候…' : typeof window.showSaveFilePicker === 'function' ? '选择保存位置并导出' : '下载报表';
    dialog.querySelector('#reportReadyDownload').setAttribute('aria-disabled', String(value));
    if (!value) {
      dialog.querySelector('[data-report="current-store"]').disabled = !currentStore;
      refreshPreview();
    }
  }

  async function readImage(url, evidence) {
    if (!url || (!evidence && !safeImage(url))) return { error: '图片未记录' };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    let objectUrl;
    try {
      let blob;
      if (evidence && location.protocol === 'file:') blob = await bundledScreenshot(evidence) || await deadline(localScreenshotFile(evidence), 15000);
      else {
        const response = await fetch(url, { signal: controller.signal, credentials: 'same-origin' });
        if (!response.ok) throw new Error('图片读取失败');
        blob = await response.blob();
      }
      objectUrl = URL.createObjectURL(blob);
      const image = new Image();
      image.src = objectUrl;
      await deadline(image.decode(), 15000);
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext('2d').drawImage(image, 0, 0);
      const base64 = canvas.toDataURL('image/png');
      const binary = atob(base64.split(',')[1]);
      const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
      return { base64, bytes, width: canvas.width, height: canvas.height };
    } catch (error) {
      return { error: evidence ? '原始截图读取失败' : '主图读取失败', detail: error.message };
    } finally {
      clearTimeout(timer);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  }

  async function prepareImages(reportRows, chosen) {
    const pictureFields = chosen.filter(imageField);
    if (!pictureFields.length) return { images: {}, failures: 0, failureDetails: [] };
    const cache = new Map();
    const images = Object.fromEntries(pictureFields.map(field => [field.id, new Array(reportRows.length)]));
    const total = reportRows.length * pictureFields.length;
    let next = 0;
    let completed = 0;
    let failures = 0;
    const failureDetails = [];
    async function worker() {
      while (next < total) {
        const task = next++;
        const index = Math.floor(task / pictureFields.length);
        const field = pictureFields[task % pictureFields.length];
        const row = reportRows[index];
        const url = imageSource(row, field);
        const cacheKey = field.id === 'screenshot' && location.protocol === 'file:' ? bundledSource(row.evidence) || url : url;
        if (url && !cache.has(cacheKey)) cache.set(cacheKey, readImage(url, field.id === 'screenshot' ? row.evidence : null));
        const image = url ? await cache.get(cacheKey) : { error: missingImage(row, field) };
        images[field.id][index] = image;
        if (image.error && url) {
          failures++;
          if (failureDetails.length < 3) failureDetails.push(field.label + '：' + row.product.name + '（' + (image.detail || image.error) + '）');
        }
        completed++;
        if (completed % 10 === 0 || completed === total) {
          progress(`正在整理所选图片和截图 ${completed} / ${total}`, completed / total * 70);
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(4, total) }, worker));
    return { images, failures, failureDetails };
  }

  async function addWpsCellImages(buffer, assets) {
    if (!window.JSZip) throw new Error('图片打包组件尚未加载，请刷新工作台后重试。');
    const archive = await JSZip.loadAsync(buffer);
    const declaration = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    const relationNamespace = 'http://schemas.openxmlformats.org/package/2006/relationships';
    const imageRelationType = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image';
    const pictures = [];
    const relationships = [];
    assets.forEach((asset, index) => {
      const rid = 'rId' + (index + 1), filename = 'cellimage' + (index + 1) + '.png';
      archive.file('xl/media/' + filename, asset.image.bytes);
      relationships.push('<Relationship Id="' + rid + '" Type="' + imageRelationType + '" Target="media/' + filename + '"/>');
      pictures.push('<etc:cellImage><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="' + (index + 1) + '" name="' + asset.name + '" descr="' + esc(asset.description)
        + '"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr><xdr:blipFill><a:blip r:embed="' + rid
        + '"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + (asset.image.width * 9525)
        + '" cy="' + (asset.image.height * 9525) + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic></etc:cellImage>');
    });
    archive.file('xl/cellimages.xml', declaration + '<etc:cellImages xmlns:etc="http://www.wps.cn/officeDocument/2017/etCustomData" xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' + pictures.join('') + '</etc:cellImages>');
    archive.file('xl/_rels/cellimages.xml.rels', declaration + '<Relationships xmlns="' + relationNamespace + '">' + relationships.join('') + '</Relationships>');
    let rels = await archive.file('xl/_rels/workbook.xml.rels').async('string');
    const ids = [...rels.matchAll(/Id="rId(\d+)"/g)].map(match => Number(match[1]));
    const nextId = Math.max(0, ...ids) + 1;
    rels = rels.replace('</Relationships>', '<Relationship Id="rId' + nextId + '" Type="http://www.wps.cn/officeDocument/2020/cellImage" Target="cellimages.xml"/></Relationships>');
    archive.file('xl/_rels/workbook.xml.rels', rels);
    let types = await archive.file('[Content_Types].xml').async('string');
    if (!/Extension="png"/.test(types)) types = types.replace('<Override', '<Default Extension="png" ContentType="image/png"/><Override');
    archive.file('[Content_Types].xml', types.replace('</Types>', '<Override PartName="/xl/cellimages.xml" ContentType="application/vnd.wps-officedocument.cellimage+xml"/></Types>'));
    return archive.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', compression: 'DEFLATE', compressionOptions: { level: 6 } }, metadata => {
      progress('正在生成WPS单元格图片报表 ' + Math.round(metadata.percent) + '%', 82 + metadata.percent * 0.16);
    });
  }

  async function excelBlob(reportRows, chosen, images, wpsCellImages) {
    if (!window.ExcelJS) throw new Error('Excel组件尚未加载，请刷新工作台后重试。');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = '竞品观察台';
    workbook.created = new Date();
    workbook.calcProperties.fullCalcOnLoad = true;
    const sheet = workbook.addWorksheet('商品报表', { views: [{ state: 'frozen', ySplit: 1 }] });
    const explanation = workbook.addWorksheet('排序说明');
    sheet.columns = chosen.map(field => ({ header: field.label, key: field.id, width: field.width }));
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: reportRows.length + 1, column: chosen.length } };
    sheet.getRow(1).height = 27;
    sheet.getRow(1).eachCell(cell => {
      cell.font = { name: 'Microsoft YaHei', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF07867F' } };
      cell.alignment = { vertical: 'middle', wrapText: true };
    });
    const pictureFields = chosen.filter(imageField);
    const pictureIds = new Map();
    const cellAssets = [];
    for (let index = 0; index < reportRows.length; index++) {
      const reportRow = reportRows[index];
      const row = sheet.addRow(chosen.map(field => imageField(field) ? images[field.id][index]?.error || '' : field.read(reportRow)));
      row.height = pictureFields.length ? 36 : 48;
      row.eachCell({ includeEmpty: true }, (cell, column) => {
        cell.font = { name: 'Microsoft YaHei', size: 10, color: { argb: 'FF172B48' } };
        cell.alignment = { vertical: 'middle', wrapText: true };
        cell.border = { bottom: { style: 'hair', color: { argb: 'FFE7ECF2' } } };
        if (chosen[column - 1].numeric && typeof cell.value === 'number') cell.numFmt = '0.00';
      });
      for (const field of pictureFields) {
        const image = images[field.id][index];
        if (!image || image.error) continue;
        const imageColumn = chosen.indexOf(field);
        const source = imageSource(reportRow, field);
        if (wpsCellImages) {
          if (!pictureIds.has(source)) {
            const random = globalThis.crypto?.randomUUID?.().replace(/-/g, '').toUpperCase()
              || (Date.now().toString(16) + cellAssets.length.toString(16)).padEnd(32, '0');
            const name = 'ID_' + random;
            pictureIds.set(source, name);
            cellAssets.push({ name, image, description: reportRow.product.name + ' · ' + field.label });
          }
          const cell = row.getCell(imageColumn + 1), name = pictureIds.get(source);
          cell.value = { formula: '_xlfn.DISPIMG("' + name + '",1)', result: '=DISPIMG("' + name + '",1)' };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          continue;
        }
        if (!pictureIds.has(source)) pictureIds.set(source, workbook.addImage({ base64: image.base64, extension: 'png' }));
        const limit = 44;
        const scale = Math.min(limit / image.width, limit / image.height, 1);
        const width = chosen[imageColumn].width * 7 + 5;
        sheet.addImage(pictureIds.get(source), {
          tl: { col: imageColumn + Math.max(0.03, (width - image.width * scale) / (2 * width)), row: index + 1 + 0.055 },
          ext: { width: image.width * scale, height: image.height * scale },
          editAs: 'oneCell',
        });
      }
      if (index % 100 === 0) {
        progress(`正在整理Excel表格 ${index + 1} / ${reportRows.length}`, 70 + (index + 1) / reportRows.length * 11);
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    const notes = reportOrderNotes(reportRows);
    explanation.columns = [
      { width: 38 }, { width: 15 }, { width: 28 }, { width: 16 }, { width: 18 }, { width: 75 },
    ];
    for (const line of notes.lines) {
      const row = explanation.addRow([line]);
      explanation.mergeCells(row.number, 1, row.number, 6);
      row.height = 36;
      row.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    }
    explanation.addRow([]);
    const headings = explanation.addRow(['竞品门店', '一级分类序号', '所属一级分类', '本次导出记录数', '未关联类内位置数', '分类顺序核对状态']);
    headings.font = { bold: true };
    for (const group of notes.groups) {
      const r = group.row;
      const row = explanation.addRow([r.context.store.name, r.categoryOrder ?? '', r.primaryCategory, group.count, group.missing,
        orderStatus(r.category, group.count > group.missing ? 1 : null)]);
      row.height = 36;
      row.alignment = { vertical: 'middle', wrapText: true };
    }
    progress('正在生成Excel文件…', 82);
    const buffer = await workbook.xlsx.writeBuffer();
    return wpsCellImages && cellAssets.length ? addWpsCellImages(buffer, cellAssets)
      : new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  function csvCell(value) {
    let text = String(value ?? '');
    if (typeof value === 'string' && /^[\s]*[=+@-]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }

  async function zipBlob(reportRows, chosen, images) {
    if (!window.JSZip) throw new Error('压缩组件尚未加载，请刷新工作台后重试。');
    const archive = new JSZip();
    const lines = [chosen.map(field => csvCell(field.label)).join(',')];
    const savedPictures = new Map();
    for (let index = 0; index < reportRows.length; index++) {
      const reportRow = reportRows[index];
      const pictureFiles = {};
      for (const field of chosen.filter(imageField)) {
        const image = images[field.id][index];
        pictureFiles[field.id] = image?.error || '';
        if (!image || image.error) continue;
        const key = field.id + ':' + imageSource(reportRow, field);
        if (!savedPictures.has(key)) {
          const folder = field.id === 'screenshot' ? '原始截图/' : '商品主图/';
          const prefix = field.id === 'screenshot' ? fileStem(reportRow.context.store.name) + '_' : '';
          const file = folder + String(index + 1).padStart(5, '0') + '_' + prefix + fileStem(reportRow.product.name) + '.png';
          archive.file(file, image.bytes);
          savedPictures.set(key, file);
        }
        pictureFiles[field.id] = savedPictures.get(key);
      }
      lines.push(chosen.map(field => csvCell(imageField(field) ? pictureFiles[field.id] : field.read(reportRow))).join(','));
    }
    archive.file('商品清单.csv', '\ufeff' + lines.join('\r\n'));
    const notes = reportOrderNotes(reportRows);
    archive.file('排序说明.txt', '\ufeff' + notes.lines.join('\r\n') + '\r\n\r\n'
      + notes.groups.map(group => `${group.row.context.store.name} / ${group.row.categoryOrder ?? '—'} ${group.row.primaryCategory || '分类未记录'}：${group.count} 条；未关联类内位置 ${group.missing} 条；`
        + orderStatus(group.row.category, group.count > group.missing ? 1 : null)).join('\r\n'));
    progress('正在生成图文压缩包…', 82);
    return archive.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } }, metadata => {
      progress('正在打包 ' + Math.round(metadata.percent) + '%', 82 + metadata.percent * 0.16);
    });
  }

  async function downloadReport(saveMode = 'picker') {
    if (busy) return;
    refreshPreview();
    const chosen = selectedFields();
    const reportRows = rows.slice();
    if (!chosen.length || !reportRows.length) return;
    const formatChoice = dialog.querySelector('#reportFormat').value;
    const format = formatChoice === 'zip' ? 'zip' : 'xlsx';
    const stem = fileStem(dialog.querySelector('#reportFileName').value.replace(/\.(xlsx|zip)$/i, ''));
    if (!stem) {
      feedback('请填写有效的文件名称。', 'error');
      dialog.querySelector('#reportFileName').focus();
      return;
    }
    const filename = stem + '.' + format;
    const mime = format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/zip';
    let handle;
    let writer;
    let nativeWarning = '';
    let nativeSaved = false;
    let actualFilename = filename;
    lastExport = null;
    setBusy(true);
    try {
      progress('等待选择保存位置：' + filename, 0);
      // The picker must run directly in this user click, before any data/image work.
      if (saveMode === 'picker' && typeof window.showSaveFilePicker === 'function') {
        try {
          handle = await window.showSaveFilePicker({
            id: 'competitor-product-report', startIn: 'downloads', suggestedName: filename,
            types: [{ description: format === 'xlsx' ? 'Excel商品报表' : '商品图文压缩包', accept: { [mime]: ['.' + format] } }],
          });
        } catch (error) {
          if (error.name === 'AbortError') throw error;
          nativeWarning = saveFailureReason(error);
        }
      }
      if (!preparedReport) {
        progress('正在整理已选择的商品…', 1);
        const { images, failures, failureDetails } = await prepareImages(reportRows, chosen);
        if (failures) throw new Error(`${failures} 条图片或截图读取失败，已停止生成，未写入缺图报表。请检查配套截图是否齐全或网络是否正常，再重新导出。首条：${failureDetails[0]}`);
        const blob = format === 'xlsx' ? await excelBlob(reportRows, chosen, images, formatChoice === 'xlsx') : await zipBlob(reportRows, chosen, images);
        preparedReport = { blob, url: URL.createObjectURL(blob), format, recordCount: reportRows.length, fieldCount: chosen.length };
      }
      const blob = preparedReport.blob;
      showPreparedLink(filename);
      progress('正在保存文件…', 99);
      if (handle) {
        try {
          writer = await handle.createWritable();
          await writer.write(blob);
          await writer.close();
          writer = null;
          nativeSaved = true;
          actualFilename = handle.name || filename;
        } catch (error) {
          if (writer) { try { await writer.abort(); } catch {} writer = null; }
          nativeWarning = saveFailureReason(error);
        }
      }
      if (!nativeSaved) {
        if (nativeWarning) actualFilename = fileStem(stem + '_另存_' + clockSuffix()) + '.' + format;
        browserDownload(actualFilename);
      } else showPreparedLink(actualFilename);
      const result = (nativeWarning ? nativeWarning + '，已改用普通下载。' : '')
        + (nativeSaved ? '保存成功：' : '文件已生成：') + actualFilename + '（' + reportSize(blob) + '）。'
        + `已导出 ${reportRows.length.toLocaleString('zh-CN')} 条记录、${chosen.length} 个字段。`
        + (nativeSaved ? ' 已保存到你选择的位置。' : ' 已交给浏览器下载，请在下载列表确认；若未出现记录，点击下方“下载已生成文件”，无需重新生成。');
      progress(result, 100);
      feedback(result, 'success');
      lastExport = { message: result, state: 'success' };
      toast(result);
    } catch (error) {
      if (writer) { try { await writer.abort(); } catch {} }
      const message = error.name === 'AbortError' ? '已取消保存，没有完成下载。可继续调整导出内容。' : '导出未完成，' + (error.message || '请重试。');
      const state = error.name === 'AbortError' ? 'cancelled' : 'error';
      feedback(message, state);
      lastExport = { message, state };
      dialog.querySelector('#reportExportProgress').hidden = true;
    } finally {
      setBusy(false);
    }
  }

  window.CompetitorReportOpen = openExport;
  document.addEventListener('click', event => {
    if (event.target.closest('#reportReadyDownload')) {
      if (busy || !preparedReport) { event.preventDefault(); return; }
      const link = dialog.querySelector('#reportReadyDownload');
      const filename = link.download;
      const message = '已将生成好的文件交给浏览器下载：' + filename + '。请在浏览器下载列表查看是否保存完成。';
      feedback(message, 'success');
      lastExport = { message, state: 'success' };
      return;
    }
    const entry = event.target.closest('[data-action="report-export"]');
    if (entry) openExport();
    const button = event.target.closest('[data-report]');
    if (!button || button.disabled || busy) return;
    if (button.dataset.report === 'start') { downloadReport(); return; }
    if (button.dataset.report === 'browser-start') { downloadReport('browser'); return; }
    if (button.dataset.report === 'source-folder') { selectSourceFolder(); return; }
    clearPrepared();
    lastExport = null;
    if (button.dataset.report === 'all-stores') dialog.querySelectorAll('[name="reportStore"]').forEach(input => { input.checked = true; });
    if (button.dataset.report === 'current-store') dialog.querySelectorAll('[name="reportStore"]').forEach(input => { input.checked = input.value === currentStore; });
    if (['all-fields', 'clear-fields'].includes(button.dataset.report)) dialog.querySelectorAll('[name="reportField"]').forEach(input => { input.checked = button.dataset.report === 'all-fields'; });
    refreshPreview();
  });
  dialog.addEventListener('change', event => {
    if (event.target.id !== 'reportFileName') { clearPrepared(); lastExport = null; }
    else if (preparedReport) showPreparedLink(preparedDownloadName(dialog.querySelector('#reportReadyDownload').download));
    if (event.target.id === 'reportSourceFiles') {
      sourceFiles = new Map();
      for (const file of event.target.files) {
        const path = file.webkitRelativePath;
        if (!/\.(png|jpe?g|webp|avif)$/i.test(path)) continue;
        sourceFiles.set(path, file);
        const start = path.indexOf('采集记录/');
        if (start >= 0) sourceFiles.set(path.slice(start), file);
      }
    }
    refreshPreview();
  });
  dialog.addEventListener('close', () => {
    clearPrepared();
    if (!document.querySelector('dialog[open]')) document.body.style.overflow = '';
    if (dialog._returnFocus?.isConnected) dialog._returnFocus.focus({ preventScroll: true });
  });
  dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
})();
