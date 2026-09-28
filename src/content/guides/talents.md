---
title: "Talents: what got rebuilt"
description: "Blessings run an hour, Blessing of Kings is baseline, and several trees were reworked. What the client's 432 talent points actually changed."
facts:
  - k: "talent points"
    v: "432"
  - k: "trees"
    v: "27"
  - k: "blessing duration"
    v: "1 hr"
  - k: "Legacy: talent unlock"
    v: "5 lv earlier"
updated: 2026-09-28
build: "1.60.1.70009"
sources:
  - label: "Client data — Talent / TalentTab / Spell tables, build 1.60.1.70009"
  - label: "Creator talent breakdowns per class (~30,000 words)"
  - label: "Blizzard — Forever Deep Dive Panel Recap"
---

Two patterns run through Forever's talent changes.

One: abilities that used to be a talent tax are now baseline. Two: trees get capstones that feed back
into each other, instead of just adding damage.

The client holds **432 talent points across 27 trees**. Nine classes, three each.

## The buff tax is gone

Paladin is the clearest example, and Classic players will spot it in ten seconds.

- **Blessing of Kings** and **Consecration** are **baseline**. No points.
- **Blessings last an hour.** Not five minutes. Not fifteen.

That second line kills one of Classic's dullest rituals: rebuffing the raid every fifteen minutes. If it
applies elsewhere, it's the biggest quality-of-life change in the expansion, and it costs you nothing in
power.

Same pattern shows up in Legacy's **Reagent Economy** perk. Class abilities stop needing purchasable
reagents, and tier 1 camping features cost no materials. Rogue Vanish powder is the example creators
keep bringing up.

## Trees that got rebuilt

### Rogue — Subtlety

The biggest rework in the beta.

- **Out:** Improved Sap, Sleight of Hand, Deadliness
- **In:** five new talents
- **Dirty Tricks** cuts the energy cost of Sap and Blind by **25%**
- **Improved Distract** has a bigger radius, and distracted enemies have stealth detection as if one
  level lower
- **Improved Backstab** is replaced by **Puncturing Wounds**
- Precision and Deflection cost **fewer points** to max
- **Rupture ticks cut the energy cost** of your next Hemorrhage or Backstab. Stacks **five times**.
- **Hemorrhage raises Rupture damage.** So keeping a bleed up is a loop now, not a chore.

Assassination leans into poisons and picks up **Mutilate**. And the whole class can **wield axes** now,
which puts Rogues and Fury Warriors on the same loot table.

### Warrior — Arms

Arms drops the old weapon-specialisation system. You get more freedom in what you carry. Creators compare
it to the Rogue tree's new **Hack and Slash** talent.

**Bloodthrill** makes Rend feed Overpower, with an extra proc to play around. Two buttons that ignored
each other now work as a pair.

Protection swapped **Bastion** and **Focused Rage**, so Focused Rage comes earlier and the spec smooths
out.

### Hunter — Survival

Two capstones that reference each other:

- **Improved Prey** (21-point capstone). Melee hits have a **10% chance** to give you a **free Mongoose
  Bite**.
- **Lacerating Strikes.** Mongoose Bite applies a bleed.

Add **Summon Hawks** as a new shot, and Survival has a melee loop with its own rhythm. It isn't the spec
nobody picks any more.

### Mage — Arcane

**Arcane Blast** is a stacking gamble:

| Effect | Value |
|---|---|
| Damage to your other spells, per stack | **+10%** |
| Mana cost increase, per stack | **+175%** |
| Max stacks | **4** |
| Duration | **8 seconds** |

The question is how many stacks you can afford. Four gives you a monster Arcane Missiles. Three might be
right when your mana is tight.

**Frostfire Bolt** is baseline for every Mage too. Fire/frost cross-builds open up.

### Druid — Feral

Dodge and Swipe tuning. The headline: **Swipe costs 2 less rage and hits 40% harder.**

Feral has a design problem the community says isn't about numbers. There's a long beta thread arguing it.

## The Legacy shortcut

The **Talented** perk in Legacy's Adventure tree unlocks talent points **five levels early**. A level 40
talent arrives at 35.

For anyone levelling an alt, that's the perk that changes the whole 1–60 run rather than adding a stat.
[Other Legacy perks →](/guides/legacy-system/)

## Don't plan around a tree map

**Talent layouts move between builds.** The beta was taking a new build roughly every day while this was
written. Last week's tree may be wrong this week.

That's why [class pages](/classes/) rebuild from the client. They show the current build, tier by tier,
with real talent names.

## What's still missing

- **Point costs per talent.** The client gives positions, tiers and linked spells. Not costs. So no build
  planner has been built on top.
- **Spec pruning.** 432 points across 27 trees includes entries that don't matter for a given spec.
  Separating those is ongoing work.
- A **talent calculator** is the obvious next tool. Beating the ten that already exist needs the cost
  data first.
