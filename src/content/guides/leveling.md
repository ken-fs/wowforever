---
title: "Leveling 1–60: what Forever actually changed, and the XP math behind it"
description: "Dungeon mob XP moved into dungeon quests, which rewrote the leveling route. The full 1–60 XP cost, every verified XP buff, and the hourly camping routine."
facts:
  - k: "XP for 1–60"
    v: "4,084,700"
  - k: "verified XP buffs"
    v: "4"
  - k: "best buff stack"
    v: "+155%"
  - k: "camp buff duration"
    v: "1 hr"
updated: 2026-09-27
build: "1.60.1.70009"
sources:
  - label: "Client data — LevelExperience table (build 1.60.1.70009), matching Classic's curve exactly"
  - label: "Client data — spell effects for XP-granting auras (build 1.60.1.70009)"
  - label: "RampageWoW, Dalaran Gaming, ItalianSpartacus — beta leveling footage (~11,000 words)"
  - label: "Blizzard — Forever Deep Dive Panel Recap"
---

Forever rewrote where experience comes from, and the change is large enough that pre-Forever leveling
advice actively hurts you.

## The one change that matters

**Dungeon mob experience was gutted and moved into dungeon quests.**

Killing trash in a dungeon now pays close to nothing. The quests inside pay enormously — enough that
the practical ceiling is described as **up to two levels per dungeon**.

Betas have a way of exaggerating, but the numbers people are reporting are consistent:

- One player's warrior gained **two levels from a single Ruins of Lordaeron quest run**
- Another took a Horde character from **14 to 20 across Ragefire Chasm, Ruins of Lordaeron and Wailing
  Caverns** and called that the whole route

The consequence for routing: Classic speed levelers skipped dungeons because the setup cost beat the
payoff. **You can't skip them now.** Every dungeon ships with quests, and skipping one means leaving
the best experience in the game on the table.

The side effect is that routing changed shape. In Classic you chained zones. In Forever you pick a
handful of zones and thread dungeon runs through them.

## The XP cost, from the client

The level curve is unchanged from Classic. These are the client's own numbers:

| Milestone | XP to next level | Cumulative |
|---|---|---|
| 1 → 2 | 400 | 400 |
| 10 → 11 | 7,600 | 35,200 |
| 20 → 21 | 23,200 | 190,400 |
| 30 → 31 | 47,400 | 546,400 |
| 40 → 41 | 90,700 | 1,245,100 |
| 50 → 51 | 147,500 | 2,453,600 |
| 59 → 60 | 209,800 | **4,084,700** |

That last number is the one to remember: **1 to 60 costs 4,084,700 base experience.**

## Every XP buff, with real percentages

Four spells in the client carry the XP-granting aura with a readable value. These aren't estimates —
they're the effect values, and the tooltip text confirms what they mean.

| Buff | Effect | Scope |
|---|---|---|
| **Discoverer's Delight** | **+50%** XP | All experience, plus bonus quest gold |
| **WoW Variety Show — The Winds of Inspiration!** | **+50%** XP | All experience |
| **Winds of Wisdom** | **+50%** XP | ⚠️ flagged **CN Only** in the client |
| **Well Fed XP Boost** | **+5%** | **Kill experience only** |

Best case stack on a US or EU realm: **+105%** from Discoverer's Delight + Variety Show + food, or
**+155%** if Winds of Wisdom ever applies outside China.

Buffs **add, they don't multiply.** Two +50% buffs give +100%, not +125%. Chasing a third 50% costs the
same as the first and adds the same 50 points — which is exactly why the marginal buff stops being worth
the detour.

Work the arithmetic and the shape of a good route falls out. At 4,084,700 base XP:

- No buffs: 4,084,700 XP of actual killing and questing
- +100%: **2,042,350**
- +155%: **1,602,000**

Halving the grind is worth more than any routing trick, and it's why the camping system below matters
for leveling rather than just for flavour.

### What we deliberately left out

The client also ships a spell called **Well-Rested** that claims an experience bonus. Its value is stored
as a reference to another spell that isn't shipped to players, so the number isn't recoverable. Rather
than print a guess, it's excluded. The well-known rested bonus is still worth roughly double experience
on its own while it lasts.

## The hourly routine

Camping buffs last **one hour**. That makes a rhythm out of leveling that Classic never had:

1. Find or start a camp near where you're questing
2. Get the **Camp Tent** down — Leatherworking, tier 1 — for rested XP
3. Sit for **one minute** and collect every buff stack the camp has
4. Quest for the hour, then rebuild

The tent is the leveling pick, and it's the one people argue about. It **tops your rested experience up
to 5% of a level** and does nothing at all if you're already above that. Used on cooldown every hour,
though, it's a steady trickle of doubled experience that costs you sixty seconds.

Three other camp objects matter while leveling: **Fishbowl** (+8% stats, the largest single buff on the
list), **Sharpening Wheel** (+Strength), **Incense Candle** (+Intellect), and **First Aid Kit** (+Stamina).
Which of those you get depends on which professions show up at your camp — not on what you picked.

## Class rankings moved

Old Classic leveling tier lists are now wrong, for a boring structural reason: if a large share of your
experience comes from dungeon quests, the classes that clear dungeon content efficiently pull ahead of
the classes that were good at solo grinding open-world mobs.

Two things are consistent across every beta write-up:

- **Warlocks are strong** — summoning makes you the convenience pick, and groups want you for it. The
  caveat is that damage-over-time builds underperform inside dungeons where mobs die fast.
- **Dot-heavy builds generally lose value** in dungeon groups, because the fights are too short for
  the dots to finish.

## What's uncertain

- **"Nine new dungeons"** comes from creator coverage, not from a Blizzard statement we can point at.
  The client carries 42 dungeon encounter maps; the *new* subset hasn't been separated out yet.
- **Exact dungeon quest XP values** aren't in the client data — quest text and rewards live
  server-side, so dealing with them properly is the same problem everyone else has.
- **"Two levels per dungeon"** is field reporting. It'll vary by level band, and it's the number most
  likely to be tuned before launch.

The XP curve and the buff percentages on this page are client-verified and will be rebuilt automatically
when they change.
