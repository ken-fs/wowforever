---
title: "Talents: what got rebuilt, and the quality-of-life that came with it"
description: "Blessings run an hour, Blessing of Kings and Consecration are baseline, and several trees were reworked. What the client's 432 talent points actually changed."
facts:
  - k: "talent points"
    v: "432"
  - k: "trees"
    v: "27"
  - k: "blessing duration"
    v: "1 hr"
  - k: "Legacy: talent unlock"
    v: "5 lv earlier"
updated: 2026-09-27
build: "1.60.1.70009"
sources:
  - label: "Client data — Talent / TalentTab / Spell tables, build 1.60.1.70009 (432 points across 27 trees)"
  - label: "Creator talent breakdowns per class (~30,000 words)"
  - label: "Blizzard — Forever Deep Dive Panel Recap"
---

Forever's talent changes follow two patterns: **abilities that were talent tax become baseline**, and
**trees get new capstones that create two-way interactions** rather than flat damage increases.

The client holds **432 talent points across 27 trees** — nine classes, three each. That's the data
behind the class pages here.

## The buff tax is gone

The clearest change is Paladin, and it's the one Classic players will notice immediately:

- **Blessing of Kings** and **Consecration** are **baseline**. No points required.
- **Blessings last one hour** instead of five or fifteen minutes.

That second line removes one of the most tedious rituals in Classic — rebuffing a raid every fifteen
minutes. If the same treatment is applied elsewhere, it's the largest quality-of-life change in the
expansion and it costs nothing in power.

The broader pattern shows up in **Legacy's Reagent Economy perk** too: class abilities stop requiring
purchasable reagents, and tier 1 camping features cost no materials. Rogue Vanish powder is the
example creators keep citing.

## Trees with real rebuilding

### Rogue — Subtlety

The most extensively reworked tree in the beta:

- **Removed:** Improved Sap, Sleight of Hand, Deadliness
- **Added:** five new talents in their place
- **Dirty Tricks** — cuts the energy cost of Sap and Blind by **25%**
- **Improved Distract** — larger radius, and distracted enemies have stealth detection as if one level
  lower
- **Improved Backstab replaced** by **Puncturing Wounds**
- Precision and Deflection cost **fewer points** to max
- **Rupture ticks reduce the energy cost** of your next Hemorrhage or Backstab, stacking up to **five
  times**
- **Hemorrhage increases Rupture damage**, turning bleed maintenance into a loop rather than a chore

Assassination leans much harder into poison damage and gains **Mutilate**. And at the class level,
**Rogues can wield axes now** — which puts them in direct competition with Fury Warriors for drops.

### Warrior — Arms

Arms loses the old weapon-specialisation system, replaced with something that gives more freedom in
weapon choice — creators compare it to the Rogue tree's new **Hack and Slash** talent.

**Bloodthrill** creates a Rend → Overpower interaction with an extra proc to play around, which turns
two buttons that didn't talk to each other into a pair.

Protection swapped **Bastion** and **Focused Rage**, putting Focused Rage earlier so the spec smooths
out instead of spiking.

### Hunter — Survival

Two new capstones that reference each other:

- **Improved Prey** (21-point capstone) — melee hits have a **10% chance** to proc a **free Mongoose Bite**
- **Lacerating Strikes** — Mongoose Bite applies a bleed

Combined with **Summon Hawks** as a new shot, Survival now has a melee loop with its own feedback cycle
rather than being the spec nobody picks.

### Mage — Arcane

**Arcane Blast** drives a stacking decision:

| Effect | Value |
|---|---|
| Damage bonus to your other spells, per stack | **+10%** |
| Mana cost increase to Arcane Blast, per stack | **+175%** |
| Maximum stacks | **4** |
| Duration | **8 seconds** |

The choice is how many stacks you can afford before you spend them. Four stacks is a huge Arcane
Missiles; three might be correct when your mana is tight.

**Frostfire Bolt** also becomes baseline for every Mage, opening cross-tree fire/frost builds.

### Druid — Feral

Dodge and Swipe tuning, most notably **Swipe costing 2 less rage and dealing 40% more damage**. The
Feral kit has a documented design problem that the community argues isn't only about numbers, and there's
a long beta thread making that case.

## The Legacy shortcut

The **Talented** perk in Legacy's Adventure tree lets characters **unlock talent points up to five levels
earlier than normal**. A level 40 talent becomes available at 35.

For anyone levelling an alt, that's the perk that changes the shape of the whole 1–60 run rather than
adding a stat.

## How to use this

**Talent layouts move between builds.** Forever's beta was taking a new build roughly every day during
this period. A tree map that was accurate last week may not be this week.

That's why the [class pages](/classes/) regenerate from the client rather than from a written guide —
they show the current build's trees, tier by tier, with the actual talent names.

## What's still missing

- **Point costs per talent.** The client gives us talent positions, tiers and linked spells, but the
  cost structure isn't in the data yet, so no build planner has been built on top of it.
- **Spec-specific pruning.** 432 points across 27 trees includes entries that don't matter for a given
  spec. Separating those is ongoing.
- A **talent calculator** is the obvious next tool here, but building one that's actually better than
  the ten that already exist needs the cost data first.
