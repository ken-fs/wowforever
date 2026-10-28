# 上线状态

> 2026-09-28 · **全部完成** · 无待办

## ✅ 站点

```
线上          https://wowforever.one          100 页
www           301 → apex
证书          Google Trust Services WE1
Worker        wowforever · hasAssets
构建          push 到 main → 自动构建（已验证多次）
部署标记      /.well-known/anvilwiki-deploy.txt = HEAD
```

## ✅ 收录

| 通道 | 状态 |
|---|---|
| **GSC** | 属性 `sc-domain:wowforever.one` 已验证，服务账号 `gsc-bot@ken-seo-tools` 已加 |
| **sitemap** | `sitemap-index.xml` 已提交，Google 已下载，**0 错误 0 警告** |
| **IndexNow** | 99 个 URL 提交，HTTP 200（Bing / Yandex / Naver / Seznam）|
| **robots.txt** | 允许全部 + 声明 sitemap |
| **Googlebot** | 实测可抓首页 / robots / sitemap（均 200）|

⚠️ **URL Inspection 现在显示 "URL is unknown to Google"** —— 这是新属性的正常状态，
sitemap 刚提交几十分钟，收录要几天。不是故障。

## ✅ 统计

```
GA4          G-ND17C7D4G4
注入方式     Cloudflare 构建变量 PUBLIC_GA_ID（不在代码里写死）
门控         src/components/CookieConsent.astro —— 同意前零加载
```

## ✅ 图标

```
favicon.ico          16/32/48 三档（主）
favicon.svg          矢量版
apple-touch-icon.png 180×180
icon-192/512.png     PWA
site.webmanifest     站点清单
```

设计：锈红圆角方 + 米白衬线 W。**刻意不用暴雪游戏图标** —— 那是品牌标识，
当本站 icon 会暗示官方关联。

## 日常运维

新 build 已由每日巡检 → autopilot → `scripts/sync-data.mjs` 自动同步、校验、构建、push，并在部署后推飞书。无需手动更新数据库。

手动诊断：`node scripts/sync-data.mjs`（只改本地，不提交）；`node scripts/sync-data.mjs --self-test`（校验规则自测）。新页面推 Bing：`npm run indexnow`。

巡检：`node ~/Desktop/david/Ship/scripts/site-hygiene.mjs wowforever`（每天 10:00 自动；单站模式只检查，不触发同步）
