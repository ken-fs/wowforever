# wowforever.one — 运维手册

World of Warcraft: Forever 数据/工具站。英文，Astro 静态生成，Cloudflare Workers 托管。

---

## 两条管线

这个站和别的站不一样的地方：**内容不是手写的，是从游戏客户端算出来的。**

```
pipeline/build.mjs    数据管线   wago.tools → SQLite → data/site.db
pipeline/assets.mjs   素材管线   官方 CDN → src/assets/（营销图 + 职业图标）
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

### ⚠️⚠️ 改完管线必须提交 site.db

**CI 读的是仓库里那份 `data/site.db`，不会自己跑管线。** 所以：

```bash
# 改了 pipeline/derive.sql 或 pipeline/build.mjs 之后
node pipeline/build.mjs        # 重新生成 site.db
git add data/site.db           # ← 这一行漏了，CI 就还在用旧数据
git commit
```

踩过一次（2026-09-28）：只提交了 `derive.sql` 的天赋修复、忘了提交重新生成的 `site.db`，
线上跑了半小时的旧数据。**本地 `npm run build` 完全正常**（它读本地那份），
所以只有线上能看出来。

验证办法：`git status --short` 里出现 `M data/site.db` 就是漏提交了。

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
| 关系列空值一律用 `CAST(x AS INTEGER) != 0` 判 | 查数据时 | 见下方「⚠️ 类型陷阱」|

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


---

## 部署（已接好）

```
GitHub   github.com/ken-fs/wowforever          （公开，repo id 1391681630）
Workers  wowforever  ·  workers.dev: https://wowforever.493129720ljw.workers.dev
触发     push 到 main → Cloudflare Git 集成自动构建
zone     915927540a00804212ce71ffa276b1f5（wowforever.one）
```

⚠️ **本地 `npx wrangler deploy` 只是临时的**，会被下一次 CI push 覆盖。
最终部署永远走 `git push`。

### Cloudflare 构建配置（用 API 建的，备查）

```
POST /accounts/{acc}/builds/repos/connections
  { repo_id:"1391681630", repo_name:"wowforever", provider_type:"github",
    provider_account_id:"223587720", provider_account_name:"ken-fs" }

POST /accounts/{acc}/builds/workers
  { script_tag: "<Worker 的 script_tag hash，不是 Worker 名字>",
    git_repository: { ...同上, branch:"main" },
    previews_enabled: false,
    production_settings: { build_command:"npm run build", deploy_command:"npx wrangler deploy",
      root_directory:"/", build_caching_enabled:true, path_includes:["*"],
      build_token_uuid:"0c55960d-77b2-474d-8c0e-3e39adb5053c" } }

POST /accounts/{acc}/builds/triggers/{uuid}/builds   body: {"branch":"main"}
```

### ⚠️ 踩过的坑：`script_tag` 不是 Worker 名字

第一次建配置时填了 `"wowforever"`，构建报 **`unable to verify Worker`** 然后超时。
正确值要从 services API 取：

```js
GET /accounts/{acc}/workers/services
  → result[i].default_environment.script_tag   // 形如 e40eca233c8c466b963b55c59bf3901a
```

### ⚠️ 建 Worker：raw JS 上传是 service-worker 语法

`PUT /accounts/{acc}/workers/scripts/{name}` 用 `Content-Type: application/javascript` 可以绕开
multipart（MCP 层会把 multipart 的 CRLF 转义弄坏，报 `No such module`），
但**上传的内容必须是非模块语法**：

```js
// ✅ 能建成功
addEventListener('fetch', function(e){ e.respondWith(new Response('placeholder')); });

// ❌ "Uncaught SyntaxError: Unexpected token 'export'"
export default { async fetch() { ... } };
```

这只是 bootstrap 用的占位符，CI 第一次构建就会用真正的 assets 覆盖掉。

### wrangler OAuth token

本机 wrangler 的 OAuth token 会过期（约 24h）。过期后 `npx wrangler deploy` 报
`Invalid access token [code: 9109]`。**这不影响 CI**（CI 用 build token，不是你的 OAuth）。
需要本地部署时跑一次 `npx wrangler login`。

或者用 MCP：`cloudflare_execute` 的 token 权限比 wrangler 高，能建 zone（wrangler 只有 `zone:read`）。


---

## 美术素材（官方来源，别用竞品截图）

```bash
node pipeline/assets.mjs          # 拉全部（33 张营销图 + 9 个职业图标）
node pipeline/assets.mjs --force  # 重下
```

| 来源 | 是什么 | 怎么拿 |
|---|---|---|
| `blz-contentstack-images.akamaized.net` | Blizzard 官网 Forever 落地页的营销图：主视觉、天裔原画、**7 张区域图**、产品图、特性图 | 抓落地页 HTML 里的 URL，去掉 `-sm/-md/-lg` 后缀拿全分辨率 |
| `render.worldofwarcraft.com/us/icons/56/<name>.jpg` | **游戏图标官方渲染 CDN**（56×56 JPEG） | `fdid` → `wago.tools/api/info/{fdid}` 拿文件名 → 拼 CDN |

**为什么不用 Wowhead / 竞品的图**：那是别人的截图，DMCA 风险比"没图"严重得多。
上面这两个都是开发商自己发布/渲染的素材，粉丝站配免责声明使用是行业惯例
（和 Roblox 站用 `thumbnails.roblox.com` 一个道理）。

### ⚠️ 坑：wago.tools 给的是 BLP2，不是 PNG

`wago.tools/api/casc/{fdid}` 返回 **BLP2**（暴雪贴图格式，DXT 压缩），直接当图片用不了。
**不要写 BLP 解码器** —— 走 `/api/info/{fdid}` 拿文件名，再去 `render.worldofwarcraft.com` 拿 JPEG。
实测 5/5 成功，每张约 2.4KB。

### 页面怎么用

素材通过 `src/data/assets.ts` 暴露（`import.meta.glob` 收集 + 具名导出）：

```astro
import { Image } from "astro:assets";
import { hero, classIcon, guideImage } from "../data/assets.ts";

<Image src={hero} alt="..." widths={[420, 720]} format="webp" loading="eager" fetchpriority="high" />
```

**装饰性图标一律 `alt=""`**（旁边的文字已经说了是什么），**图库图必须有描述性 alt**（图片搜索靠它）。

### 署名义务

页脚已写「Artwork © Blizzard Entertainment, reproduced from Blizzard's own press and marketing assets.」
**别删这行**。


---

## 图标与统计

### favicon

```bash
# 改设计后重新生成（源在 public/favicon.svg）
cd ~/Desktop/david/Ship/wow-forever
for s in 16 32 48; do rsvg-convert -w $s -h $s public/favicon.svg -o /tmp/f$s.png; done
magick /tmp/f16.png /tmp/f32.png /tmp/f48.png public/favicon.ico
for s in 180 192 512; do rsvg-convert -w $s -h $s public/favicon.svg -o public/$( [ $s = 180 ] && echo apple-touch-icon.png || echo icon-$s.png ); done
```

设计是「锈红圆角方 + 米白衬线 W」—— 域名的首字母，和页头衬线字对得上。

⚠️ **不用暴雪的官方游戏图标当 favicon**：那是品牌标识，会暗示官方关联。
仓库里 `src/assets/official/icon_512x512.png` 是官方素材，可以放在**页面里**配署名使用，
但不该当作本站的身份标识。

⚠️ **光栅 .ico 才是主 favicon**：`favicon.svg` 里的 `<text>` 依赖客户端有那个字体，
不同系统渲染不一致。多个尺寸的 `.ico` 保证各处一致。

### Google Analytics（同意门控）

```
GA4 属性   G-ND17C7D4G4
注入点     Cloudflare 构建变量 PUBLIC_GA_ID（不是写死在代码里）
门控       src/components/CookieConsent.astro
```

**GA 不会无条件加载。** 流程：

```
Base.astro 定义 window.__wowLoadTrackers()，但没人调用它
   ↓
CookieConsent 读 localStorage 的 wowforever-consent
   ├─ 没选择      → 显示同意条，什么都不加载
   ├─ accepted    → 调用 __wowLoadTrackers()
   └─ declined    → 永不加载
```

**为什么不能直接贴 GA snippet**：只要有一个 EU 访客，未取得同意就加载就是违反
GDPR/ePrivacy，Google 自己的条款也这么要求。你 AGENTS.md 里记过这个坑。

**没设 PUBLIC_GA_ID 时页面零 JS** —— 门控块整体包在条件里，不是只把 div 藏起来。

验证（本地）：
```bash
PUBLIC_GA_ID=G-ND17C7D4G4 npx astro build
node ../scripts/browser/browser.mjs eval "http://localhost:4399/" "
  JSON.stringify({条可见:!document.getElementById('cookie-consent')?.hidden,
                  gtag:typeof window.gtag})"
# 期望：{条可见:true, gtag:undefined}
```


---

## 动效

全在 `src/styles/global.css` 末尾，**纯 CSS，零 JS**。

参考 `aniimo.wiki` 的力度（300ms、微位移、边框变色），没做花哨的：
实测那站是 71 处 transition + 85 处 hover + `backdrop-blur-sm`，没有动画库。

| 类 | 效果 | 用在哪 |
|---|---|---|
| `.glass` | 半透明 + `backdrop-filter: blur(14px) saturate(1.4)` | 吸顶导航 |
| `.card` | hover：`translateY(-2px)` + 锈红边框 + 双层阴影 | 首页工具卡 / 攻略索引 / changes |
| `.zoom-frame` | 卡片 hover 时内部图 `scale(1.04)` | 攻略索引 / 图库 |
| `.arrow-link` | 箭头 `translateX(0.28rem)` | 7 处「→」链接 |
| `.nav-link` | 下划线从中间展开（`scaleX`） | 导航 |
| `table.data tr` | hover 时首列滑出锈红标线（`scaleY`） | 数据表 |

**三条约束**：

1. **缓动不用 `ease`/`ease-in-out`** —— DESIGN-RULES 禁线性动画，统一用
   `--ease-out-quint` 和 `--ease-spring`。
2. **过渡不写 `all`** —— 只列 `color/background-color/border-color/box-shadow/transform`，
   写 `all` 会把布局属性也带上，hover 时触发重排。
3. **`prefers-reduced-motion: reduce` 全关** —— 系统开了减少动态效果就禁用位移和缩放。

⚠️ **毛玻璃铺在纯色纸面上是看不见的**（没东西可模糊），必须有内容从底下滚过才有意义。
所以只用在吸顶导航上。别往卡片上加 —— 纸面是平的，加了只是变灰。


---

## ⚠️ 类型陷阱：`.import --csv` 的列是 `ANY` 类型

**踩过一次，而且差点得出错误结论。**

`.import --csv` 不动列类型，全部是 `ANY`。CSV 里写 `0` 的列，SQLite 可能存成**整数 0**，
也可能存成**字符串 `'0'`**，取决于该列当行的其他值。

于是这个判空写法**静默出错**：

```sql
-- ❌ 数字列会恒为真
WHERE COALESCE(SpellID,'') NOT IN ('','0')
```

因为 SQLite 的类型排序是 `NULL < INTEGER < TEXT`，**整数 0 永远小于字符串 `'0'`**，
所以 `0 NOT IN ('','0')` 求值为「真」。实测 432 行全零的列，这条会数出 432 个「非零」。

**正确写法**：

```sql
-- ✅ 显式转整数
WHERE CAST(SpellID AS INTEGER) != 0
```

排查手段：`SELECT typeof(列名), hex(列名) FROM 表 LIMIT 1` —— 别信屏幕上看到的 `0`。

### 顺带：Forever 客户端挪过几个关系列

三处都验证过，**原始 CSV 里就是空/0**，不是导入问题：

| 表.列 | 状态 | 真值在哪 |
|---|---|---|
| `Talent.ClassID` | 整列 0 | `TalentTab.ClassMask` 位掩码，`1 << (ChrClasses.ID - 1)` |
| `Talent.SpellID` | 整列 0 | `Talent.SpellRank_0`（415/432 能解析出名字）|
| `QuestV2` | 只有 3 列 | 任务文本在服务端，客户端根本没有 |

**教训**：拿到暴雪的表先别信列名，抽几个非零样本验证一遍再写 JOIN。


---

## 每日巡检覆盖了什么

`node ~/Desktop/david/Ship/scripts/site-hygiene.mjs wowforever`（每天 10:00 自动）

```
✓ 部署标记    /.well-known/anvilwiki-deploy.txt == 本地 HEAD
✓ sitemap     99 条 URL 全部指向本站
✓ 关键页      首页 / 计算器 / 矩阵 / 攻略 / 视频 / robots
✓ 数据新鲜度  站点 build vs 暴雪当前 build
✓ 图片存活    从线上页现抽 content-hash 图 HEAD 一遍
✓ GA 门控     确认没有无条件加载的 gtag
✓ 官方新文章  官网 news id 增量，过滤出 Forever 相关的
```

### 「内容更新」有两个来源，别只盯一个

| 来源 | 是什么 | 检查 |
|---|---|---|
| **游戏 build** | 客户端数据变了（新天赋/新物品/数值调整）| 数据新鲜度 |
| **官方文章** | 深度解析、开发者说明 —— **攻略素材的来源** | 官方新文章 |

两个都是 **🔔 而非 ✗**：它们是「有新东西可写」的信号，不是站出故障。

**官方新文章为什么不抓全部**：官网上大部分新文章是正式服（至暗之夜）的，对本站没用。
所以只对**新出现的 id** 抓标题做关键词过滤（`forever|无限|legacy|传承|blizzcon`），
老 id 不重复请求。增量存 `Ship/out/game-state.json`。

⚠️ **首次运行只记基线**，不报新增 —— 否则第一天会把 400 多篇全报一遍。
状态文件被删掉时会退回基线模式，是安全的。

### 「运营内容」这层是干什么的

前四项回答「**站挂了没有**」。后两项回答另一个问题：**站活着，但在悄悄说错话**。
这类故障不会让任何页面变红：

| 故障 | 后果 | 谁发现 |
|---|---|---|
| 管线停了 | 站上写着「每个补丁自动重建」，实际数据停在两周前 | 数据新鲜度 |
| 图片 404 | 卡片空一块，肉眼要逐页看 | 图片存活 |
| 门控被拆 | 有人手贴 GA snippet 绕过了同意条，EU 访客直接违规 | GA 门控 |

### ⚠️ 数据过期报 🔔 不报 ✗

和 Roblox badge 检查同一个道理：**新 build 是「该重跑 `npm run data` 了」的信号，
不是站出了故障**。计入 fails 会让巡检天天报红（beta 期一天一个构建），
反而把真故障淹掉。

看到 🔔 时的动作：

```bash
cd ~/Desktop/david/Ship/wow-forever
npm run data
git status --short          # ⚠️ 必须看到 M data/site.db
git add -A && git commit && git push
```

### ⚠️ 图片检查必须先验页面本身

负向测试抓到的：404 页上也有一张 `_astro` 图（恰好返回 200），
只检查图片会把挂掉的页面判成正常。所以 `checkImages` 先看页面 status。


---

## 数据列陷阱清单（持续更新）

拿到暴雪的表**先别信列名**，抽几个非零样本验证再写 JOIN。已踩过的：

| 表.列 | 看着像 | 实际 | 真值在哪 |
|---|---|---|---|
| `Talent.ClassID` | 职业 | 整列 0 | `TalentTab.ClassMask` 位掩码 |
| `Talent.SpellID` | 法术 | 整列 0 | `Talent.SpellRank_0` |
| `SkillLineAbility.MinSkillLineRank` | 需求等级 | 7809/7826 行是 1 | `TrivialSkillLineRankHigh`（变灰等级）|
| `QuestV2` | 任务表 | 只有 3 列 | 服务端，客户端没有 |

**两个通用排查手段**：

```sql
SELECT typeof(列), hex(列) FROM 表 LIMIT 1;         -- 别信屏幕上看到的 0
SELECT COUNT(*) FROM 表 WHERE CAST(列 AS INTEGER) != 0;  -- 别用字符串比较
```

### ⚠️ 专业分类不只 CategoryID=11

`SkillLine.CategoryID`：
- `11` = 9 个制造专业（锻造/制皮/裁缝/工程/附魔/炼金/采矿/草药/剥皮）
- **`9` = 次要技能，但 Cooking / First Aid / Fishing 也是真专业**

只写 `CategoryID='11'` 会漏掉这三个 —— 而**营火系统的主角就是烹饪**，钓鱼还有 Fishbowl。
所以过滤条件要写成：

```sql
AND (sl.CategoryID = '11' OR sl.DisplayName_lang IN ('Cooking','First Aid','Fishing'))
```

### ⚠️ 新增派生表后必须加进 SITE_TABLES

`data/site.db` 是**白名单导出**。新表没加进去的话：
本地 `npm run build` 可能正常（取决于 site.db 是否已重建），**CI 直接报 `no such table`**。

踩过三次：`recipe_reagent` · `reagent_name` · `camping_spell`。

### 营地道具 ↔ 配方：名字对不上是**正常的**

`pipeline/camp-objects.json` 是手工对照表。原因：

- 攻略里的道具名来自**创作者转述**（页面已标来源），不是客户端原文
  - 攻略写 "Camping Chair"，客户端叫 "Camp Chair"
- 客户端**根本没有**部分道具的配方：Fishbowl / Cookie's Feast / Enchanted Loot /
  First Aid Kit / Basic Campfire Kit / 各种 tier-3 工作台
- 按 `LIKE '%camp%'` 自动匹配只能捞到 4/16 —— Sharpening Wheel 之类都不含 camp

对照表里 `recipe: null` 就是「客户端没有」，页面如实写
"no recipe in the client"，**不猜**。

**顺带验到一次交叉印证**：`Mana Well = Peacebloom ×1 + Empty Vial ×1`，
和语料里创作者原话 "it just takes a peace bloom and an empty vial" 完全对上。


---

## 广告位（Adsterra）

```
开关      Cloudflare 构建变量 PUBLIC_ADSTERRA=1
组件      src/components/AdsterraSlot.astro（单元）+ AdBreak.astro（728/320 配对）
素材      public/ads/<name>.html —— Adsterra 后台 "GET CODE" 原样，勿手改
```

| 单元 | 尺寸 | 出现 |
|---|---|---|
| `leaderboard-728x90` | 728×90 | 宽屏 |
| `banner-320x50` | 320×50 | 窄屏 |

放在：首页 · 攻略页 · 专业页 · 专业 hub · 职业页。
**不放** `/about/` `/privacy/` `/404` `/screenshots/` `/videos/`。

### ⚠️ 为什么必须 iframe 隔离

Adsterra 的 banner 脚本**都往共享全局 `window.atOptions` 写自己的配置**。
同一页内联两个单元 → 后一个覆盖前一个，两个位渲染成同一个广告。
所以每个单元放独立 HTML，组件挂 iframe。

sandbox 省略 `allow-top-navigation`（部分移动端素材会试图把整页导航走）。
⚠️ 但 `allow-scripts` + `allow-same-origin` 同时存在时，
**sandbox 是布局隔离 + 导航摩擦，不是安全边界** —— 真隔离需要独立 origin。

### ⚠️ 同意门控

和 GA 同一套：iframe 先不挂 `src`，真 URL 放 `data-src`。
拿到 localStorage 的 `wowforever-consent === 'accepted'`
或收到 `wow:consent-accepted` 事件后才提升。

```
同意前  2 个 iframe，0 个有 src
点 Allow 后  2 个都被提升
```

验证命令：
```bash
node ../scripts/browser/browser.mjs eval "http://localhost:4399/" "
JSON.stringify({iframe:document.querySelectorAll('iframe').length,
  已加载:[...document.querySelectorAll('iframe')].filter(f=>f.getAttribute('src')).length})"
# 期望 {iframe:2, 已加载:0}（点 Allow 前）
```

### ⚠️ 两个尺寸都要判可见性

`hideOnMobile` 只管"窄屏隐藏"。**320 那个必须同时设 `hideOnDesktop`**，
否则宽屏会**两个都显示**（一个页面出两个广告）。踩过。

```astro
<AdsterraSlot name="leaderboard-728x90" hideOnMobile />   <!-- 宽屏 -->
<AdsterraSlot name="banner-320x50" hideOnDesktop />       <!-- 窄屏 -->
```

实测断点行为：390px → 320 那个；768/1280px → 728 那个。

### 本机测不到广告内容

`bauval.org` 对本机 IP 返 **403**（广告网络屏蔽机房 IP）。
浏览器里看得到请求确实发出去了、无 console 报错即可 ——
真实用户 IP 会正常出图。**别把这个 403 当成站上有 bug。**
