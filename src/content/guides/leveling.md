---
title: "Leveling: what Forever changed, and what 1–60 costs"
description: "Dungeon mob XP moved into dungeon quests, which rewrote the leveling route. The full 1–60 XP cost, every verified XP buff, and the hourly camp routine."
facts:
  - k: "XP for 1–60"
    v: "4,084,700"
  - k: "verified XP buffs"
    v: "4"
  - k: "best buff stack"
    v: "+155%"
  - k: "camp buff duration"
    v: "1 hr"
updated: 2026-09-28
build: "1.60.1.70009"
sources:
  - label: "Client data — LevelExperience table, build 1.60.1.70009 (matches Classic's curve exactly)"
  - label: "Client data — spell effects for XP-granting auras, build 1.60.1.70009"
  - label: "RampageWoW, Dalaran Gaming, ItalianSpartacus — beta leveling footage (~11,000 words)"
  - label: "Blizzard — Forever Deep Dive Panel Recap"
---

Forever moved where experience comes from. The change is big enough that old leveling advice now hurts
you.

## The one change that matters

**Blizzard gutted dungeon mob XP and moved it into dungeon quests.**

Trash in a dungeon pays almost nothing now. The quests inside pay a fortune. People put the ceiling at
**two levels per dungeon**.

Betas exaggerate. But the reports line up:

- One player's warrior gained **two levels from a single Ruins of Lordaeron quest run**
- Another levelled a Horde character from **14 to 20** across Ragefire Chasm, Ruins of Lordaeron and
  Wailing Caverns. That was the whole route.

So **you can't skip dungeons any more.** Classic speed levelers did, because grouping cost more than the
instance gave back. Now every dungeon has quests, and skipping one throws away the best XP in the game.

Your route changes shape too. Classic was zone-chaining. Forever is dungeon-threading — pick a few zones,
run the dungeons between them. [Dungeon levels and quest spots →](/guides/dungeons/)

## What 1–60 costs

The level curve is the same as Classic. Straight from the client:

| Milestone | XP to next | Cumulative |
|---|---|---|
| 1 → 2 | 400 | 400 |
| 10 → 11 | 7,600 | 35,200 |
| 20 → 21 | 23,200 | 190,400 |
| 30 → 31 | 47,400 | 546,400 |
| 40 → 41 | 90,700 | 1,245,100 |
| 50 → 51 | 147,500 | 2,453,600 |
| 59 → 60 | 209,800 | **4,084,700** |

**1 to 60 costs 4,084,700 experience.** Remember that number.

## Every XP buff, with real numbers

Four spells in the client carry an XP aura with a readable value. These are effect values, not estimates.
The tooltips confirm what they mean.

| Buff | Effect | Scope |
|---|---|---|
| **Discoverer's Delight** | **+50%** | All XP, plus bonus quest gold |
| **WoW Variety Show — The Winds of Inspiration!** | **+50%** | All XP |
| **Winds of Wisdom** | **+50%** | ⚠️ flagged **CN Only** in the client |
| **Well Fed XP Boost** | **+5%** | **Kills only** |

Best stack on a US or EU realm: **+105%**. Add Winds of Wisdom and it's **+155%**.

Buffs **add, they don't multiply.** Two +50% buffs give +100%, not +125%. A third 50% costs the same
detour as the first and adds the same 50 points. That's where the marginal buff stops being worth
chasing.

Run the maths and your route falls out. At 4,084,700 base XP:

| Your buffs | XP you actually earn |
|---|---|
| None | 4,084,700 |
| +100% | **2,042,350** |
| +155% | **1,602,000** |

Halving the grind beats any routing trick. It's why [camping](/guides/camping/) matters for leveling, not
just for flavour.

### One buff we left out

The client also ships **Well-Rested**, which claims an XP bonus. Its value points at another spell that
isn't shipped to players. The number isn't recoverable.

So it's excluded rather than guessed. The normal rested bonus is still worth about double XP while it
lasts.

## The hourly routine

Camp buffs last **one hour**. That gives leveling a rhythm Classic never had:

1. Find or start a camp near where you're questing
2. Drop the **Camp Tent** — Leatherworking, tier 1 — for rested XP
3. Sit for **one minute**. Collect every buff the camp has.
4. Quest for an hour. Rebuild.

The tent is the leveling pick, and the one people argue about. It **tops your rested XP up to 5% of a
level**. Already above that? It does nothing. Used every hour on cooldown, though, it's a steady drip of
double XP for sixty seconds of sitting.

Three other objects matter while leveling: **Fishbowl** (+8% stats, the biggest number on the list),
**Sharpening Wheel** (+Strength), **Incense Candle** (+Intellect) and **First Aid Kit** (+Stamina).

Which ones you get depends on who shows up at your camp. Not on what you picked.

## Class rankings moved

Old Classic tier lists are wrong now, for a dull structural reason. If most of your XP comes from dungeon
quests, the classes that clear dungeons efficiently win. Solo open-world grinders fall behind.

Two things every beta write-up agrees on:

- **Warlocks are strong.** Summoning makes you the convenience pick, and groups want you. Caveat: DoT
  builds underperform in dungeons, where mobs die too fast for dots to finish.
- **Dot-heavy builds lose value** in dungeon groups. Same reason.

## What's uncertain

- **"Nine new dungeons"** comes from creators, not from a Blizzard statement we can point at. The client
  carries 42 dungeon encounter maps. Separating the new ones is ongoing.
- **Dungeon quest XP values** aren't in the client. Quest rewards live server-side, so this is the same
  wall everyone hits.
- **"Two levels per dungeon"** is field reporting. It'll vary by level band, and it's the number most
  likely to get tuned before launch.

The XP curve and the buff percentages here are client-verified. They rebuild automatically when they
change.
