# WoW 竞品调查（2026-09-27）

> 目的：校准我们的页数、内容质量和打法。全部数字为本次实测（sitemap / wayback / 抓页）。

---

## 1. 分层：谁在什么位置

| 层 | 站点 | 年龄 | 页数 | 打不打 |
|---|---|---|---|---|
| **老牌内容站** | warcrafttavern.com | **22 年**（2004-07） | ~20,370 | ❌ 不碰 |
| | wowhead.com | **21 年**（2005-12） | 巨大（`/forever/items` 单页 22,396 条） | ❌ 不碰 |
| | mmo-champion.com | **19 年**（2007-03） | — | ❌ |
| | icy-veins.com | 老 | **20,268**（12 个游戏，`/wow` 4,094） | ❌ |
| **中代工具站** | wow.gg | **13 年**（2013-07） | 6,762（**其中 4,397 是俄语**） | ⚠️ 靠工具切口 |
| | method.gg | **10 年**（2016-07） | — | ⚠️ |
| | **sixtyupgrades.com** | **7 年**（2019-08） | **40** | ⚠️ 装备规划器已被占 |
| | zockify.com | 4 年（2022-06） | — | ⚠️ |
| | wowprofs.com | — | **20** | ⚠️ 专业工具 |
| **同期新站** | **wowforevertalent.com** | **12 天**（2026-09-15） | **159 英文**（576 含 9 语言） | ✅ **对标** |
| | **foreverchanges.pro** | **14 天**（2026-09-13） | **250 英文**（1,251 含 5 语言） | ✅ 对标（质量有水分） |

**读法**：年龄就是护城河。19-22 年的站打不了；4-7 年的工具站靠**单一功能**占位（页数 20-40）；
唯一能对标的是**同期 12-14 天**这两家。

> ⭐ **这直接校准了页数**：现在能排上首页的新站，真英文页就是 **159-250**。
> 我最初估的 7,700 页是拿 20 年老站的规模套新域名，错了。**200 页是对的。**

---

## 2. 同期对手拆解（我们的直接对标）

### wowforevertalent.com —— 唯一认真的对手

```
159 英文页 = 61 quests + 31 dungeons + 13 professions + 10 abilities
           + 10 builds + 10 pvp + 9 classes + 4 items + 9 语言
导航：Calculator / Abilities / Quests / Class changes / Racials / Legacy perks
      / Dungeons / Map / Items / Professions / PvP / Builds / Updates
标注："FOREVER BETA DATA · Data updated daily"
变现：AdSense + Ko-fi
```

**它的质量实测**：`/dungeons/ragefire-chasm/` → 11,337 字符正文，标题 "Ragefire Chasm | WoW Forever Quests and Drops"。
**是真内容，不是壳。**

**它的护城河（重要）**：`/quests/` 页自己写明 ——

> "Search **recorded** WoW Forever quests... **This is a pickup index, not a full quest database.**"

实测证明：任务 ID 在 `QuestV2` 里（我们有），**任务名在 20MB DB2 里 grep 完全不存在**。
→ **它们是玩 beta 时手工录的**，12 天 61 页 ≈ **5 页/天**。
→ 抄不了；但反过来，**那个位置谁也占不快**。

### foreverchanges.pro —— 有水分

```
250 英文页 = 91 map + 36 dungeons + 32 bis + 21 items + 14 professions
           + 10 talents + 9 class + 9 gear-planner + 9 spellbook + 5 语言
跟踪 beta build 1.60.1.70009 · 变现：Ko-fi
```

⚠️ **实测 `/map/dun-morogh` 直接 404。** sitemap 里挂着死链 → 赶工痕迹，250 页是虚的。
（对我们是好消息：对手质量不实。）

### wow.gg —— 规模虚增

sitemap 7,080 条，拆开是 **4,397 俄语 + 2,683 英文/其他**。13 年老站，但 Forever 覆盖靠翻译堆量。

---

## 3. 空白点（没人做）

| 缺口 | 证据 | 我们能做吗 |
|---|---|---|
| **56 种族×职业组合矩阵** | 两家都只有 `/racials` **1 个页**，没有逐组合页 | ✅ 数据干净（CharBaseInfo 56 行） |
| **XP 计算器** | 两家的导航里都没有 | ✅ 42 个 XP 法术可读（aura 200 = MOD_XP_PCT）+ QuestXP 100 行 |
| **「插件受限 → 网页替代」** | 官方确认沿用正式服 addon/API 限制；`wow forever addons` SERP 无站点拥有 | ⚠️ 需要人工核实哪些插件能用 |
| 任务页 | wowforevertalent 在做但只做到 61 页 | ❌ 要玩，做不了 |

**会撞车的**：dungeons（他们 31 / 36 页，我们已经排在计划里 20 页）→ 要么做深，要么少做。

---

## 4. 变现天花板

```
wowforevertalent.com   AdSense + Ko-fi
foreverchanges.pro     Ko-fi
wowprofs.com           AdSense
sixtyupgrades.com      无检测到
zockify.com            无检测到
```

**没有任何一家做订阅制或明显的联盟营销。** 这个赛道的广告变现天花板不高——
真正有钱的是代练站（lfcarry / mythic-store / boostroom 占着每个查询的 #3-#9），
他们靠内容换流量、导去卖服务。

> 如果要赚这个赛道的钱，最终要接代练/金币联盟，不能只靠 AdSense。

---

## 5. 结论：我们该怎么做

**1. 页数 = 200（已修正）。** 对标同期的 159-250，不是老站的 20,000。

**2. 质量要压过 wowforevertalent。** 它的弱点是 **9 语言 × 159 页 = 摊薄**。
   我们只做英文、把它每块的深度都做厚一点，就有优势。

**3. 两个必做的空白**：
   - 56 个 `race-class` 组合页（数据干净、无人做、能内链）
   - XP 计算器（无主工具）

**4. 任务页不做。** 那是人工护城河，我们进不去——但也不必进，它只值 61 页。

**5. dungeons 要差异化。** 他们已经铺了 31/36 页，我们照抄会撞车。
   要么做深（每个副本的完整掉落表 + 任务 + 等级区间），要么只做 5-8 个热门本。

**6. 变现第一天就规划。** AdSense 只能保底；要接代练/金币联盟才可能像样。
