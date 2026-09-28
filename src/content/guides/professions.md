---
title: "Professions: passive bonuses, camping objects, and the recipe economy"
description: "Forever gives every profession a passive character bonus on top of its camp object. What each grants, and how to pick."
facts:
  - k: "recipes in the client"
    v: "2,436"
  - k: "camp objects"
    v: "12"
  - k: "profession slots"
    v: "2"
updated: 2026-09-27
build: "1.60.1.70009"
sources:
  - label: "Client data — SkillLineAbility / SpellReagents tables, build 1.60.1.70009 (2,436 recipes after filtering out weapon skills)"
  - label: "Blizzard — Forever Deep Dive Panel Recap (profession bonuses, trade factions)"
  - label: "Creator coverage: profession tier lists and beta crafting footage (~26,000 words)"
---

Classic professions were a way to spend time for gear you could almost always buy. Forever attaches two
things to them that Classic never had: **a passive bonus that applies to your character at all times**,
and **a camp object that gives your group a buff**. Picking a profession is now a character-building
decision, not just a crafting one.

## The two-structure model

Every profession does two jobs in Forever:

1. **A passive bonus** — always on, no action required
2. **A camp object** — three tiers, placed at a campfire for area buffs

The second one is covered in full in the [camping guide](/guides/camping/). This page is about the
first, and about what you can actually make.

## What each profession grants

| Profession | Passive / notable | Camp object buff |
|---|---|---|
| **Mining** | **+5% total health** | Blessing of Might (melee attack power) |
| **Blacksmithing** | Belt buckle — an extra socket-like upgrade | Strength (Sharpening Wheel) |
| **Alchemy** | **Mixology** — flasks and elixirs last longer; the Alchemist's Trinket | Mana regeneration |
| **Engineering** | Rocket boots, grenades, and level-scaled summons | Repair and reagent bots |
| **Tailoring** | **Cloth Embroidery** cloak enchant across **5 tiers**, plus extra cloth from humanoids | Spirit |
| **Leatherworking** | … | Camp Tent — rested XP |
| **Enchanting** | Enchanting, obviously | Armor, all stats and resistances |
| **Herbalism** | … | Intellect |
| **Skinning** | … | +2% crit |
| **Cooking** | Feasts, plus food buffs that camping extends | The campfire itself |
| **Fishing** | … | **+8% stats** |
| **First Aid** | Bandages, potions, antivenoms | Power Word: Fortitude (Stamina) |

**Mining's +5% total health** is the one that gets called out most. It's flat, it's always on, and it
scales as your gear does — genuinely relevant for PvP.

**Tailoring's Cloth Embroidery** is the other one to look at closely, because it breaks the normal rule.
Its cloak enchant comes in five tiers and offers spell power, attack power **or** stamina. That's a
real stat budget that doesn't compete with anything else you're wearing.

## The recipe economy is now interlocked

Forever adds materials that only exist to feed other professions, which Classic never did much of:

- **Cerulean Dye** — fermented by alchemists, consumed by tailors
- **Sulfuric Acid** — an alchemist product
- **Frilled Lyken** — a drop that comes from gathering herbs

The practical effect: a solo player can't be self-sufficient the way they were in Classic. If a tailoring
pattern needs an alchemist's fermentation, you need an alchemist — a guildmate, a customer, or a second
character.

Blizzard reinforced this with two new trade factions, the **Azeroth Commerce Authority** (Alliance) and
**Durotar Supply and Logistics** (Horde), which are a major source of new tradeskill activity. Their
turn-ins pay **50 coins on the first hand-in**, enough to buy a recipe outright — which means your first
profession decision is also your first choice about which recipe gap to close.

## Gathering is more flexible than it used to be

Two changes that matter more than they look:

- **You can train gathering professions in the starting zone**, immediately, without running to a city
- **Herbalism and mining can both be active at once.** In Classic you could only track one node type on
  the minimap at a time, which made running both a chore. That restriction is gone.

Running two gathering professions is now described as the obvious money play, and it's a real change
rather than a convenience.

## Picking, in one paragraph

If you want raw character power: **Mining** for the health, or **Tailoring** for the cloak enchant.
If you want group value: whichever profession's camp object your usual group is missing — Cooking and
Fishing are the two with the biggest numbers. If you want gold: two gathering professions, and sell to
the crafters who now can't substitute for you. If you want utility: **Engineering**, which the beta
consensus rates highest on quality-of-life and which nobody wants to give up once they've had it.

## What the client can and can't tell us

The client holds **2,436 recipes** with their reagent lists, filtered to real professions. That's the
number this site indexes, and it's the basis for the recipe pages that are being built.

What the client doesn't hold is the *output value* of anything. Forecasting crafting profit needs live
auction house data, which comes from Blizzard's API — a connection this site doesn't have yet. Until
then, treat any "best money-making profession" claim, including from creators in the beta, as a snapshot
of an economy that hasn't launched.
