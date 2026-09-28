# 上线状态

> 2026-09-28 · **已上线** · 只剩 GSC 一步

## ✅ 全部完成

```
线上          https://wowforever.one           ← 8/8 页浏览器验收干净
www           301 → apex（路径保留）
证书          Google Trust Services WE1（Cloudflare 自动签发）
GitHub        github.com/ken-fs/wowforever
Worker        wowforever  ·  96 条 sitemap URL · 非本域 0 条
构建          push 到 main → 自动构建（已实测两次）
zone          915927540a00804212ce71ffa276b1f5 · active
NS            daisy/lochlan.ns.cloudflare.com（已从 Spaceship 改掉）
IndexNow      96 个 URL 已提交（Bing/Yandex，HTTP 202）
验收工具      已加进 scripts/gsc-lib.mjs + verify-baseline.json
```

## ⛔ 只剩这一步：GSC 属性

卡点：**Site Verification API 没在你那个 GCP 项目里启用**，所以我拿不到验证 TXT。

服务账号 `gsc-bot@ken-seo-tools.iam.gserviceaccount.com` 的凭据是好的
（webmasters 和 siteverification 两个 scope 都能签出 token），只差 API 没开。

### 选项 A（推荐，点一下就行，之后我全自动）

打开这个链接，点 **启用**：

https://console.developers.google.com/apis/api/siteverification.googleapis.com/overview?project=163174629679

启用后跟我说一声，我自动做完剩下的：
取 TXT → 用 MCP 写进 Cloudflare DNS → 调 API 验证 → 加属性 → 提交 sitemap。

### 选项 B（手动，2 分钟）

1. [GSC](https://search.google.com/search-console) → 添加资源 → **网域** → `wowforever.one`
2. 复制它给的 TXT 值，发给我（我用 MCP 写进 DNS），或者你自己去
   Cloudflare → wowforever.one → DNS → 加 TXT
3. 回 GSC 点验证
4. GSC → 设置 → 用户和权限 → 加 `gsc-bot@ken-seo-tools.iam.gserviceaccount.com` 为 **Owner**
5. 跟我说一声，我跑 `node scripts/gsc.mjs sitemaps` 提交 sitemap

## 还没做的（可选）

| 项 | 说明 |
|---|---|
| GA4 属性 | 建好后把 ID 填进 Cloudflare 构建变量；同时补 `gsc-lib.mjs` 的 `ga` 字段 |
| Cloudflare 构建变量 | `SITE_URL` 不用（astro.config.mjs 已写死 `https://wowforever.one`）|
| AdSense | 站上还没放广告位 |

## 日常运维

```bash
cd ~/Desktop/david/Ship/wow-forever

npm run data        # 游戏出新 build 后重跑（beta 期约 4.4 次/周）
git diff data/site.db   # 看数据变了什么 ← 别跳过这步
npm run build && npm run preview
git add -A && git commit && git push     # 部署 = push

npm run indexnow    # 新页面推给 Bing
```
