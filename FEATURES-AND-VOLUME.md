# 功能清单 + 搜索量估算

> 2026-09-27 · 全部数字来自本次实测（Trends / wago.tools / SERP / 竞品 sitemap）

---

## 一、搜索量

### 1.1 先说结论

```
精确月度搜索量：拿不到。
  SerpApi / SearchApi 都不提供 Keyword Planner 数据；DataForSEO 要充 $50。
  （想拿精确值的最省路径：DataForSEO 试用 $1，或上线后看 GSC 曝光）

但相对量级可以锚定，而且足够做决策。
```

### 1.2 锚定结果（US，近 1 个月，归一化 minecraft=100）

```
minecraft       mean 59.0   max 100
fortnite        mean 29.5   max  42
wow forever     mean  8.2   max  26     ← 我们
new world       mean  7.2   max  10
wow classic     mean  3.2   max   6
```

**读法**：
- `wow forever` 现在是 **fortnite 的 28%、minecraft 的 14%**
- **已经超过 `wow classic`**（2.6 倍）和 `new world`（Amazon 的 MMO）
- 这是**上线前**的数据，11-04 会再跳一档

### 1.3 绝对量级（估算，标明假设）

| 假设 minecraft US = | 推得 wow forever US |
|---|---|
| 2M/月（保守） | **≈ 28 万/月** |
| 4M/月（中性） | **≈ 56 万/月** |
| 6M/月（乐观） | **≈ 83 万/月** |

⚠️ **这是估算不是测量**。Trends 归一化在低量级词上噪声大；而且上表是**峰值期**（官宣 + beta），
上线后会先冲高再回落到一个稳定水位。

**全球**：英文市场约占 40-50%，再加其他语言区 → 全球量级大概是 US 的 2-3 倍。

### 1.4 但——可捕获的量远小于市场量

```
市场量
  ├─ Wowhead 吸走    ：每天 15-20 篇 + 22,396 条物品页 + DA 90   ← 拿走大半
  ├─ 10 个工具站分   ：天赋/装备/升级/传承计算器
  ├─ 代练站分        ：每个查询 #3-#9 全是 lfcarry/mythic-store/boostroom
  └─ 剩下的          ：才是 200 页新站的池子
```

**现实预期**：跑顺后 ≈ dungeonlootr 量级（几百-几千点击/月）。
不是「几十万搜索量分一杯羹」的算法。

---

## 二、维护节奏（先看这个，它决定架构）

实测 `wow_classic_beta` 的构建历史：

```
1.60.1.70009  2026-09-24
1.60.1.69977  2026-09-23
1.60.1.69913  2026-09-18
1.60.1.69893  2026-09-16
1.60.1.69876  2026-09-16
→ 8 天 5 个构建 = 约 4.4 次/周，中位间隔 1 天
```

**beta 期一天一个版本。** 上线后会降到补丁节奏（数周一次）+ 热修。

→ **所以维护必须自动化，否则人工跟不上。** 这正好是数据管线的设计目的。

---

## 三、功能清单

### Tier 1 · 两个无主工具（先做，这是差异化）

#### ① 升级 XP 计算器 `/tools/xp-calculator/`

| | |
|---|---|
| 目标查询 | `wow forever xp calculator` · `how to level fast` · `xp buffs` · `leveling calculator` |
| 数据来源 | **42 个 XP 法术**（实测可读：`Winds of Wisdom` aura 200 = `MOD_XP_PCT`，base 50）<br>`QuestXP` 100 行（ID=等级，Difficulty_0..9）<br>经典服升级曲线（公开常量，从 wiki 拿） |
| 功能 | 选等级 → 勾选 buff（Winds of Wisdom +50% / Well Fed / Well Rested / Camp Benefits）→ 算出到 60 级要多久 |
| 竞品 | **无**。实测 wowforevertalent 和 foreverchanges 的导航里都没有 |
| 维护 | buff 数值随 build 变 → 自动重跑即可 |

#### ② 种族×职业矩阵 `/race-class/`

| | |
|---|---|
| 目标查询 | `wow forever race class combinations` · `skyborne classes` · `undead paladin` |
| 数据来源 | `CharBaseInfo` **56 行** + `ChrRaces` + `ChrClasses` |
| 功能 | 56 个逐组合页 + 可筛选矩阵 |
| 竞品 | **无**。两家都只有 `/racials` 单个页 |
| 维护 | 几乎零（只有加新组合时才变） |
| 已挖到的事实 | 天裔是两支（High Order / Windshaper）· 圣骑士只有 3 种族 · 德鲁伊含天裔 |

### Tier 2 · 数据表（**Wowhead 写成文章，我们做成表**）

| # | 页 | 数据 | 为什么我们格式更好 |
|---|---|---|---|
| ③ | 露营增益总表 | 露营法术 + 数值（**专业对应关系需人工补**） | Wowhead 写成 "Camping Overview" 文章；玩家要的是可筛选表 |
| ④ | 烹饪/食物 XP 加成表 | Spell 筛选 | Wowhead 有一篇 "All Cooking Food that Gives XP Buffs"，但不可筛选 |
| ⑤ | 职业改动对照表 | **build diff**（本次已跑通 diff 方法：612 条物品差异） | "相对经典服改了什么" 是最高意图的问题，且需要真干活 |
| ⑥ | T1 套装一览 | `ItemSet` 536 行（需筛真套装） | 套装是 BiS 讨论的入口 |

### Tier 3 · 占位（用户预期有，但不指望它排名）

| # | 页 | 数据 | 说明 |
|---|---|---|---|
| ⑦ | 天赋计算器 | `Talent` **432 点** / 27 树 | 10 家在抢，Wowhead 是 #1。但不做显得站不完整 |
| ⑧ | 配方查询 | `SkillLineAbility` **2,436 条**（已过滤武器技能） | 竞争对手只有 13-14 页 |

### 不做

| 不做 | 为什么 |
|---|---|
| 物品页 / 法术页（8,559 / 31,703） | 打不过 Wowhead 的 22,396 条；且触发 index bloat |
| 任务页 | 任务名在服务端，只能玩出来录（对手 12 天录了 61 个） |
| 新闻 | Wowhead 每天 15-20 篇 |
| 装备规划器 | sixtyupgrades（7 年老兵，40 页）已占位 |

---

## 四、维护模型（这是真正的护城河）

```
cron：每天查 http://us.patch.battle.net:1119/wow_classic_beta/versions
   │
   └─ 有新 build（beta 期 ~4.4 次/周）
        ↓
      ① 重下 CSV → 重建 SQLite        node pipeline/build.mjs    （一条命令，80 秒）
        ↓
      ② diff 新 build vs 旧 build → 产出「本次改了什么」清单
        ↓
      ③ 数据表页自动更新（数字/列表/图标）
        ↓
      ④ 对需要写文案的改动生成人工待办
```

**为什么这是护城河**：对手（wowforevertalent / foreverchanges）也标 "Data updated daily"，
但**没人把「build diff」做成产品**。而玩家最想知道的恰恰是「这次改了什么」。

一次投入，之后每次补丁都自动跟上。
