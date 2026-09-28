---
title: "Camping: every profession buff, and how the camps actually stack"
description: "The full WoW Forever camping table — all 12 professions across three tiers, what each object does, and the social rule that shapes every camp."
facts:
  - k: "unlocks at"
    v: "Lv 5"
  - k: "professions with a camp object"
    v: "12"
  - k: "features: basic / journeyman / expert"
    v: "3 / 5 / 10"
  - k: "sit time for buffs"
    v: "1 min"
updated: 2026-09-27
build: "1.60.1.70009"
sources:
  - label: "Blizzard — Forever Deep Dive Panel Recap (camping design intent)"
    url: "https://worldofwarcraft.blizzard.com/en-us/news/24303313"
  - label: "hammerdance — Every Camping Buff For All Professions (beta footage, 2,387 words)"
  - label: "Scatter — Camping Explained (unlock quest, feature limits)"
  - label: "GuideMMO — Hidden Changes (camp tent rested mechanic)"
  - label: "Client spell data for camp objects and buff auras, build 1.60.1.70009"
---

Camping is Forever's attempt to make the campfire a place rather than a consumable. You put objects down,
other people sit at them, and the buffs you get depend on which professions bothered to show up.

It is not a max-level system. It starts at **level 5**.

## Unlocking it

Around level 5 you get a quest called **The Great Outdoors**. It asks you to sit by the campfire next to
the quest giver, then sends you into town to train Cooking and learn your first campfire.

Your first campfire costs **simple wood** and **flint and tinder**, both sold by the cooking trainer. That's
deliberately cheap — Blizzard wants the system running from the first hour, not the fortieth.

## How a camp is built

The campfire is the anchor. Everything else attaches to it, and the fire has a hard limit on how many
extra objects it can hold:

| Campfire | Extra features it holds |
|---|---|
| Basic | 3 |
| Journeyman | 5 |
| Expert | 10 |

The restriction that matters isn't the number, though:

> You can place **one** of those features yourself. The rest have to come from other players.

That's the design working as intended, not a beta limitation. A camp with ten slots is a camp built by
ten professions, and the panel recap makes the goal explicit — the minute you spend sitting is a minute
where you might meet someone on the same quest.

**Sitting or crafting near the fire for 1 minute** applies the camp's buffs. Most individual camp objects
are consumable and share a **one-hour placement cooldown**. The fire itself has a shorter separate cooldown.

## Every profession's camp object

The rule that makes this table readable: **tier 3 gives you tier 1 and tier 2 as well.** Upgrading never
replaces anything, so a maxed camp object is three buffs stacked.

| Profession | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|
| **Cooking** | Basic Campfire Kit — anchors 3 features | Journeyman Campfire Kit — 5 features, plus **Cookie's Feast** (stamina food) | Expert Campfire Kit — **10 features** |
| **Alchemy** | Mana Well — mana regeneration | Fermentor — produces higher-tier reagents | Alchemy Laboratory — unlocks lab-only recipes |
| **Blacksmithing** | Sharpening Wheel — **Strength** | Anvil — repair gear in the field | Master Forge — forge recipes anywhere |
| **Enchanting** | Enchanted Loot — armor, all stats and resistances | Arcane Salvager — more efficient disenchanting | Arcane Forge — arcane-forge recipes |
| **Engineering** | Reagent Bot — buy reagents in the world | Repair Bot — repair anywhere | Anarchist's Workbench — its own recipe unlock |
| **Leatherworking** | Camp Tent — **one bar of rested XP** | Tanning Rack — higher-tier leatherworking reagents | Sewing Machine — its own recipe unlock |
| **Tailoring** | Faction Banner — **Spirit** | Spinning Wheel — higher-tier reagents | Loom — its own recipe unlock |
| **Fishing** | Fishbowl — **+8% to stats** | Fishing Rack — uncommon fish for 1 hour, plus skill and lures | Fishing Hut — rare fish for 1 hour, on top of everything above |
| **Mining** | Lodestone — **melee attack power** | Rock Garden — spawns a mining node over time | Molten Foundry — its own recipe unlock |
| **Herbalism** | Incense Candle — **Intellect** | Greenhouse — grow herbs from planted seeds | *(higher tier cut off in current footage)* |
| **Skinning** | Camping Chair — **+2% crit** | Field Guide — track beasts | Trapper's Workbench — holds one trap |
| **First Aid** | First Aid Kit — **Stamina** | Toxin Study — healing potions and antivenoms | Plague Doctor's Laboratory — higher-tier potions and elixirs |

Read the tier 3 column again and notice what most of them are: **recipe unlocks**. Alchemy, Blacksmithing,
Enchanting, Engineering, Leatherworking, Tailoring, Mining and First Aid all end on "you can now craft the
things that used to require a city". That turns a camp into a portable workshop, and it's the reason a
raiding group wants a fully-tiered camp before a run rather than just a fire.

## What the buffs are actually worth

Four of these are stat buffs you'd otherwise get from a class: **Sharpening Wheel** (Strength), **Incense
Candle** (Intellect), **Faction Banner** (Spirit), **First Aid Kit** (Stamina). A camp can cover most of a
group's missing buff slots without a single druid or priest.

Two others are the ones people argue about:

- **Fishbowl at +8% to stats** is the biggest single number on this list by a wide margin
- **Camp Tent's one bar of rested XP** is widely called the weakest option — but it applies to *everyone
  sitting there*, and rested XP is a multiplier on top of whatever the leveling changes already did. One
  creator put it plainly: getting a bar of rested instead of a stat buff "feels weird". Whether that
  survives launch is unknown.

## What's still uncertain

- **The Greenhouse and Rock Garden** both generate resources over time, and nobody has published numbers
  on how fast. Mining's node is described in the client only as "common", which raises an obvious question
  about whether it can roll rare nodes. It's untested.
- **Herbalism's tier 3** object wasn't visible in the footage we have.
- **Exact buff magnitudes** for most objects aren't in the tooltips we've seen — +8%, +2% crit and the
  stat names are confirmed, the rest are described qualitatively.

This page gets rebuilt from client data as soon as the camp objects expose real effect values. The camp
spells are already in the database; the numbers just aren't attached to them yet.
