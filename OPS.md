# wowforever.one — 运维手册

World of Warcraft: Forever 数据/工具站。英文，Astro 静态生成，Cloudflare Workers 托管。

---

## 两条管线

这个站和别的站不一样的地方：**内容不是手写的，是从游戏客户端算出来的。**

```
pipeline/build.mjs    数据管线   wago.tools → SQLite → data/site.db
pipeline/youtube.mjs  语料管线   YouTube 字幕 → data/transcripts/
```

### 数据管线

```bash
npm run data              # 全量：拉 37 张表 + 重建所有派生表（约 80 秒）
npm run data -- --force   # 强制重下 CSV
npm run data -- --build=1.60.1.70009   # 指定 build
npm run data -- --only=Item,Spell      # 只跑某几张表
```

产出：

| 文件 | 大小 | 进 git？ |
|---|---|---|
| `data/wow-forever.db` | 20 MB | ❌ 只在本地 |
| `data/site.db` | 312 KB | ✅ **仓库里提交的是这个** |
| `data/raw/<build>/` | 20 MB CSV | ❌ 缓存，可重下 |

**为什么有个 site.db**：站点只用到其中 17 张表（其余是物品/法术全量，只用来计数）。
瘦身后 312 KB 可以进 git，**CI 构建就不需要网络、不需要跑管线**。

### 语料管线

```bash
set -a; source ../game-name-radar/.env; set +a   # 要 YOUTUBE_API_KEY
node pipeline/youtube.mjs --per=5
node pipeline/youtube.mjs --topic=leveling
```

可中断续跑（已下的跳过）。产出 `data/transcripts/<id>.txt` + `out/corpus.md`。

---

## 建站

```bash
npm run build      # 读 data/site.db → dist/
npm run dev        # 本地开发
npm run preview    # 预览
```

部署 = **git commit + push**（Cloudflare Git 集成自动构建）。
详见 `~/Desktop/david/Ship/AGENTS.md` 开头那条教训：本地 `wrangler deploy` 会被下次 CI 覆盖。

### 走全量库构建

```bash
WOW_DB=data/wow-forever.db npm run build
```

---

## 每次游戏更新后要做什么

实测 beta 期 **1 天一个构建（约 4.4 次/周）**，上线后会降到补丁节奏。

```bash
npm run data                      # 1. 重跑管线（自动 resolve 最新 build）
git diff data/site.db             # 2. 看数据变了什么
npm run build && npm run preview  # 3. 本地验证
git add -A && git commit && git push
```

理想状态是把它挂 cron，但**提交前必须有人看一眼 diff** —— 见下面「数据诚实性」。

---

## 数据诚实性（重要）

这个站的可信度来自**不编数字**。管线里已经嵌了几条规则，别绕过它们：

| 规则 | 在哪 | 为什么 |
|---|---|---|
| tooltip 里 `$<法术ID>s%d` 是自引用 → `reliable=0` | `derive.sql` 的 `xp_spell` | `Well-Rested` 的值就这么丢了，真值不在客户端 |
| `(CN Only)` 标记 | `xp_spell.cn_only` | `Winds of Wisdom` 是国服专属，美服拿不到 |
| 响应体不像 CSV 表头就拒收 | `build.mjs` `fetchTable` | 实测 wago.tools 把 Cloudflare `520` 当 200 吐回来过 |
| 表头被吃掉的哨兵检查 | `build.mjs` `importAll` | `.import --skip 1` 会把第一行数据变成列名 |

**已知拿不到的数据**（别硬凑，写在页面上）：

- **任务**：`QuestV2` 在经典客户端血统里只有 3 列，`Quest.dbd` 定义根本不存在。文本在服务端。
- **NPC**：`Creature` 表只有 179 行，全是小动物。
- **传承树对应关系**：`TraitTree` 的 TitleText 全空，是正式服残留。
- **拍卖行**：要 Blizzard OAuth。

---

## 站点结构

```
src/
  data/db.ts              node:sqlite 读库（构建期，零依赖）
  content.config.ts       攻略的 frontmatter schema（description 硬限 165 字符）
  content/guides/*.md     12 篇攻略（内容层，不是代码层）
  layouts/Base.astro      meta / canonical / 面包屑
  components/             SiteHeader · SiteFooter
  pages/
    index.astro                         首页
    about.astro                         数据来源说明（E-E-A-T）
    changes.astro                       ★ vs 经典服的 diff
    tools/index.astro                   工具 hub
    tools/xp-calculator.astro           ★ XP 计算器（无主工具）
    race-class/index.astro              56 组合矩阵
    race-class/[combo].astro            56 个逐组合页
    classes/index.astro + [class].astro 9 个职业
    races/index.astro  + [race].astro   10 个种族
    guides/index.astro                  攻略 hub
    guides/[slug].astro                 攻略渲染（content collection）
    404.astro
```

当前 **85 页 / 89 文件 / 772 KB**。CF Workers 静态上限 20,000 文件，还很远。

---

## 设计

纸质年鉴路线，**故意反着竞品来**（他们全是暗色霓虹）。

- token 在 `src/styles/global.css` 的 `@theme`
- 米白纸 `#f7f3e9` + 墨黑 `#1c1a16` + 赭金 `#9a6b12` + 锈红 `#a63d1c`
- 纸纹用内联 SVG feTurbulence，零请求
- 表格数字 `tabular-nums` + 等宽，方便纵向比对
- 遵守 `~/Desktop/david/Ship/DESIGN-RULES.md`（禁 Tailwind 默认色板、禁纯平背景、禁 emoji 图标）

---

## 踩过的坑

| 坑 | 症状 | 修法 |
|---|---|---|
| `sqlite3 .import --csv --skip 1` | 第一行数据变成列名 | 去掉 `--skip` |
| 视图版 `spell_named` | 每次查询重算 36k×42k JOIN，报告卡死 | 改物化 TABLE + 索引 |
| `DROP TABLE IF EXISTS` 删不掉同名 VIEW | 物化表建不出来，继续查旧视图又卡死 | 手动 `DROP VIEW` 一次（`derive.sql` 已不带） |
| `group_concat(DISTINCT a, ' ')` | SQLite 不支持双参数 DISTINCT | 子查询先 DISTINCT |
| 专业配方混入武器技能 | Axes/Swords/Bows 被当成专业 | 加 `SkillLine.CategoryID='11'` |
| Astro 打包后 `import.meta.url` | 指向 `dist/` 找不到 db | 改用 `process.cwd()` |
| `set:html` + `define:vars` 同用 | 脚本内容为空 | 拆成 JSON script + 普通 `is:inline` |
| yt-dlp 退出码非 0 | 第二种字幕语言 429，但第一种已落盘 | 不看退出码，只看磁盘 |

---

## 数据源速查

```
wago.tools DB2 CSV    https://wago.tools/db2/<Table>/csv?build=<build>     ← 主数据源
wago.tools builds     https://wago.tools/api/builds
wago.tools casc       https://wago.tools/api/casc/{fdid}                   ← 图标
Blizzard 版本端点      http://us.patch.battle.net:1119/wow_classic_beta/versions
Blizzard 论坛 API     us.forums.blizzard.com/en/wow/{search.json,c/wow-forever/346/l/latest.json}
r.jina.ai             绕过 Wowhead / Icy Veins 的 CloudFront 403
```

产品代号：Forever beta = `wow_classic_beta`（1.60.x）· 经典服 = `wow_classic_era`（1.15.x）
· 国服独有 = `wow_classic_titan`（3.80.x）· 正式服 = `wow`（12.x）


---

## 写攻略的规矩

攻略放在 `src/content/guides/*.md`，frontmatter 有 schema 硬校验：

```yaml
---
title: "..."              # 页面 H1
description: "..."        # ≤165 字符，超了直接 build 失败
facts:                    # 顶部那行"关键数字"，answer-first
  - k: "XP for 1–60"
    v: "4,084,700"
updated: 2026-09-27
build: "1.60.1.70009"
sources:                  # 必须列，页面底部会自动渲染
  - label: "Blizzard — ..."
    url: "https://..."
---
```

**三条硬规矩**（都是为了不变成 AI 垃圾站）：

1. **每条事实要么来自客户端数据，要么来自能点开的原始来源。** 创作者转述要标明是转述。
2. **拿不到的数就写"拿不到"**，别估。已经有几篇写了「What we can't tell you」小节。
3. **两个来源冲突就都引用**，不要取平均值糊过去。

### 语料怎么用

```bash
/tmp/read.sh <topic> "<关键词>" [条数]      # 按话题+关键词搜字幕，打印上下文
```

话题：`beginner leveling classchanges professions camping legacy gold dungeons
talents bis addons skyborne tips mistakes`

⚠️ 字幕是自动生成的，有错字（skyborn/skyborne、Ley/light 之类）。**引用前先核对**，
可疑的地方拿客户端数据交叉验证。

### 官方原文存哪

`data/sources/<newsId>.txt` —— 中英共用 news id，拉英文版即可：

```bash
curl -sL "https://worldofwarcraft.blizzard.com/en-us/news/<id>" -o /tmp/n.html
```

已存的 5 篇：`24303313` Deep Dive · `24303862` What's Next · `24304071` Found Photos
· `24301508` Pre-purchase · `24307383` **Legacy System**

---
