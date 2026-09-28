---
title: "Camping: every profession buff, and how camps stack"
description: "All 12 professions across three tiers, what each camp object does, and the social rule that shapes every camp. Plus what each object costs to craft."
facts:
  - k: "unlocks at"
    v: "Lv 5"
  - k: "professions with a camp object"
    v: "12"
  - k: "features: basic / journeyman / expert"
    v: "3 / 5 / 10"
  - k: "sit time for buffs"
    v: "1 min"
updated: 2026-09-28
build: "1.60.1.70009"
sources:
  - label: "Blizzard — Forever Deep Dive Panel Recap (camping design intent)"
    url: "https://worldofwarcraft.blizzard.com/en-us/news/24303313"
  - label: "hammerdance — Every Camping Buff For All Professions (beta footage, 2,387 words)"
  - label: "Scatter — Camping Explained (unlock quest, feature limits)"
  - label: "GuideMMO — Hidden Changes (camp tent rested mechanic)"
  - label: "Client spell data for camp objects and buff auras, build 1.60.1.70009"
---

Camping tries to make the campfire a place, not a consumable.

You drop objects. Other people sit at them. What you get depends on which professions showed up.

It starts at **level 5**, not at max level.

## How you unlock it

Around level 5 you get a quest called **The Great Outdoors**. Sit by the fire next to the quest giver.
Then head into town to train Cooking and learn your first campfire.

Your first fire costs **simple wood** and **flint and tinder**. The cooking trainer sells both.

That's on purpose. Blizzard wants this running in your first hour, not your fortieth.

## How a camp gets built

The fire is the anchor. Everything else hangs off it. And the fire has a hard limit:

| Campfire | Extra objects it holds |
|---|---|
| Basic | 3 |
| Journeyman | 5 |
| Expert | 10 |

The number isn't the interesting part. This is:

> You can place **one** object yourself. The rest come from other players.

That's the design, not a beta limit. A camp with ten slots is a camp ten professions built.

Sit or craft near the fire for **1 minute** and the buffs land on you. Most camp objects are consumable
and share a **one-hour cooldown**. The fire has its own shorter one.

## Every profession's camp object

One rule makes this table easy to read. **Tier 3 also gives you tier 1 and tier 2.** Upgrading never
removes anything. A maxed object is three buffs stacked.

| Profession | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|
| **Cooking** | Basic Campfire Kit — 3 features | Journeyman Campfire Kit — 5 features, plus **Cookie's Feast** (stamina food) | Expert Campfire Kit — **10 features** |
| **Alchemy** | Mana Well — mana regen | Fermentor — higher-tier reagents | Alchemy Laboratory — lab-only recipes |
| **Blacksmithing** | Sharpening Wheel — **Strength** | Anvil — repair in the field | Master Forge — forge recipes anywhere |
| **Enchanting** | Enchanted Loot — armor, stats, resistances | Arcane Salvager — better disenchanting | Arcane Forge — arcane-forge recipes |
| **Engineering** | Reagent Bot — buy reagents out there | Repair Bot — repair anywhere | Anarchist's Workbench — recipe unlock |
| **Leatherworking** | Camp Tent — **one bar of rested XP** | Tanning Rack — higher-tier reagents | Sewing Machine — recipe unlock |
| **Tailoring** | Faction Banner — **Spirit** | Spinning Wheel — higher-tier reagents | Loom — recipe unlock |
| **Fishing** | Fishbowl — **+8% to stats** | Fishing Rack — uncommon fish for 1 hour, plus skill and lures | Fishing Hut — rare fish, on top of the above |
| **Mining** | Lodestone — **melee attack power** | Rock Garden — spawns a mining node over time | Molten Foundry — recipe unlock |
| **Herbalism** | Incense Candle — **Intellect** | Greenhouse — grow herbs from seeds | *(not visible in current footage)* |
| **Skinning** | Camping Chair — **+2% crit** | Field Guide — track beasts | Trapper's Workbench — holds one trap |
| **First Aid** | First Aid Kit — **Stamina** | Toxin Study — healing potions and antivenoms | Plague Doctor's Laboratory — higher-tier potions |

Look down the tier 3 column. Nearly all of them are **recipe unlocks**. Alchemy, Blacksmithing,
Enchanting, Engineering, Leatherworking, Tailoring, Mining and First Aid all end on "you can now craft
the things that used to need a city".

That turns a camp into a portable workshop. It's why a raid group wants a fully-tiered camp before a
run, not just a fire.

## What the buffs are worth

Four are stats you'd otherwise get from a class:

| Object | Buff |
|---|---|
| Sharpening Wheel | Strength |
| Incense Candle | Intellect |
| Faction Banner | Spirit |
| First Aid Kit | Stamina |

So a camp can cover most of a group's missing buffs without a druid or a priest.

Two others are the ones people argue about.

**Fishbowl at +8% to stats** is the biggest single number on this list. Not close.

**Camp Tent's one bar of rested XP** gets called the weakest option. But it applies to **everyone sitting
there**, and rested XP multiplies whatever the leveling changes already gave you. One creator put it
bluntly: getting a bar of rested instead of a stat buff "feels weird". Whether it survives launch is
anyone's guess.

## What each camp object costs

The client ships a recipe for most of these. So the material lists below aren't guesswork.

| Object | Profession | Trivial at |
|---|---|---|
| Camp Chair | Skinning | 25 |
| Camp Tent | Leatherworking | 25 |
| Faction Banner | Tailoring | 25 |
| Field Guide | Skinning | 145 |

[Each profession page](/professions/) lists the exact materials. Camp Tent is **5× Light Leather**, for
example.

That's cheap. So the argument against the tent isn't the cost. It's that a bar of rested XP is a weaker
payoff than a stat buff in the same slot.

## What we don't know yet

- **Greenhouse and Rock Garden** both make resources over time. Nobody has published numbers. Mining's
  node is described in the client only as "common", which begs a question about rare nodes. Untested.
- **Herbalism's tier 3** object wasn't visible in the footage we have.
- **Exact buff magnitudes** for most objects aren't in the tooltips we've seen. +8%, +2% crit and the
  stat names are confirmed. The rest are described in words, not numbers.

This page rebuilds from client data the moment camp objects expose real effect values. The camp spells
are already in the database. The numbers just aren't attached to them.
