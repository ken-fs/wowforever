# wowforever.one

World of Warcraft: Forever 的数据 + 工具站。英文。

**每一条数字都从游戏客户端读出来**，不是从别的站抄的。每次暴雪推新 build，页面自动重建。

## 页数

```
97 页 = 56 种族×职业组合 + 12 篇系统攻略 + 10 种族 + 9 职业
      + XP 计算器 + 种族职业矩阵 + diff 页 + 首页/关于/404
```

## 两条管线

| 管线 | 命令 | 干什么 |
|---|---|---|
| 数据 | `npm run data` | wago.tools → SQLite → `data/site.db`（约 80 秒） |
| 语料 | `node pipeline/youtube.mjs` | YouTube 字幕 → `data/transcripts/` |

`data/site.db`（312 KB）**入库**，所以 CI 构建不需要网络、不需要跑管线。
完整库 `data/wow-forever.db`（20 MB）不入库。

## 开发

```bash
npm install
npm run build      # → dist/
npm run dev        # 本地开发
```

## 部署

push 到 `main` → Cloudflare Git 集成自动构建。

⚠️ 本地 `npx wrangler deploy` 只是临时的，会被下一次 CI push 覆盖。
详见 [`OPS.md`](./OPS.md)。

## 数据诚实性

这个站的可信度靠**不编数字**：

- 拿不到的数据写在页面上（任务、NPC、传承树对应关系都在服务端）
- tooltip 是自引用占位符的（`Well-Rested`）直接跳过，不猜
- 两个来源冲突就都引用，不取平均
- 需要 stat weights 的结论（BiS 榜）不做，因为那是观点不是数据

## 文档

- [`OPS.md`](./OPS.md) — 运维手册、踩过的坑、数据源速查
- [`PLAN.md`](./PLAN.md) — 建站方案与判决
- [`COMPETITORS.md`](./COMPETITORS.md) — 竞品调查
- [`FEATURES-AND-VOLUME.md`](./FEATURES-AND-VOLUME.md) — 功能清单与搜索量估算

## 法务

非官方粉丝资源。World of Warcraft 及相关素材是 Blizzard Entertainment, Inc. 的商标。
本站与 Blizzard 无关联、未获其背书。
