# 上海即时零售竞品观察台

本目录用于将现有公开只读工作台部署为独立静态站点。网页文件、商品数据和图片都在 `public/` 内，数据由已经公开的工作台发布目录复制，未包含本地数据库、手机连接信息或服务器密钥。

使用 Render Static Site：构建命令 `node scripts/prepare-startup.mjs && node scripts/verify.mjs`，发布目录 `public`。无需安装项目依赖。采用静态站点服务，不创建数据库或收费计算实例；平台流量等免费配额仍以账号显示为准。

资料修改后重新发布。原有页面使用网址 `#store=...` 片段定位门店，迁移后不改变这个用法。部署完成后需要验证普通直连访问、商品与匹对数据、图片放大、报表导出，并由同事在公司 Wi-Fi 上实际打开新地址。

公网网址：https://shanghai-retail-observatory.onrender.com 。首页内置门店基础资料，不等待全部商品或报表库下载。打开门店后才加载对应的商品与完整分类资料；导出报表时加载完整商品与报表组件。超时可重试，原始采集和匹对结论不变。修改快照后先运行 prepare-startup.mjs，再运行 verify.mjs 和 test-startup.mjs，通过后提交推送 main。
