---
title: "Gear: new tier sets, reworked dungeon drops, and pet scaling"
description: "Blizzard rewrote dungeon loot for Forever and added new tier sets. What changed in gearing, plus the Hunter pet stat scaling that alters how the class gears."
facts:
  - k: "rare+ items indexed"
    v: "4,581"
  - k: "new tier sets"
    v: "9 classes"
  - k: "likely source"
    v: "Mount Hyjal"
  - k: "pet health per stamina"
    v: "2"
updated: 2026-09-27
build: "1.60.1.70009"
sources:
  - label: "Client data — Item / ItemSparse / ItemSet tables, build 1.60.1.70009"
  - label: "Creator item and gear coverage (~22,000 words, including a full new-items video)"
  - label: "Blizzard — Forever Deep Dive Panel Recap"
---

Two things changed about gearing: **Blizzard rewrote dungeon drops across the board**, and **new tier sets
exist for all nine classes**.

## Dungeon loot was rewritten

This is described by creators as something Blizzard hasn't done before at this scale — the drop tables
for dungeons were updated, not inherited from Classic.

The practical upside is that you can't rely on Classic drop knowledge for anything beyond the broad
shape. Item names and slots are recognisable; the specific stats are not.

Some examples from the level 13–20 band, read off the beta:

| Item | Level | Notable stats |
|---|---|---|
| Subterranean Cape | 13 | +3 Strength, 5 health per 5 sec, 17 armor |
| Crystalline Cuffs (cloth wrists) | 13 | +2 Intellect, +3 Spirit |
| Footpads of the Fang | — | **+6 Agility, +6 Stamina** |

That last one is the tell. **+6/+6 on one item is a lot for the level band**, and it's a good illustration
of why "not perfectly itemised" still belongs in the same sentence as "strong" — Forever is keeping
Classic's uneven item design, just with better numbers available if you know where to look.

## New tier sets

Tier sets exist for all nine classes, and creator coverage of the Druid set:

- Rendered in the Classic idiom — crescent-moon motifs, no modern-graphics drift
- Described as "exactly what a new tier set in Classic would look like"

The likely source is the **Mount Hyjal** raid, which appears in the challenge list as **13 bosses** —
one of the largest encounters in the game. Nothing about the set's stat budget has been published.

The client holds **536 item sets**, though the majority of those are legacy entries. Filtering down to
Forever's actual tier sets is ongoing work.

## Hunter pets now scale with your stats

A quiet change with an outsized effect on how Hunters gear:

| Player stat | Pet receives |
|---|---|
| 1 Stamina | **2 Health** |
| Armor | **30%** transferred |

In Classic, a pet's stats were entirely its own. Now your gear feeds it. The consequence is that
**Stamina on gear is worth more to a Hunter than it is to anyone else**, and gear that looks like
survivability for you is damage output for your pet.

Expect Hunter itemisation advice to be rewritten. It's one of the few places where a stat priority
genuinely inverted rather than shifted.

## The horizontal progression claim, and the honest caveat

Forever's pitch is that item level stops climbing: level cap stays 60, and the world expands sideways
instead of upward. That's the design intent, and it's why "what's best" should stay answerable longer
here than in a version that keeps raising the ceiling.

But there's a real risk that gets discussed a lot in the beta: **if power does creep vertically, the
content behind you gets retired.** Nobody wants to run a raid that only exists to be outgrown.

Blizzard's stated answer is that new content adds options rather than replacing them. Whether that holds
across multiple content releases is the thing to watch, and no amount of beta data settles it.

## What this site can and can't do about gearing

**Can:** the client carries **31,818 items** and **536 item sets**, with names, quality, item level,
required level, class, subclass and icon IDs. That's enough to build item pages and set lists.

**Can't, yet:** BiS lists. A BiS list is a claim about what's best for a spec at a level band, which
requires stat weights, which requires either simulation or a large body of field data. Any BiS list
published right now for Forever is someone's opinion about a beta. We'd rather not dress that up as data.

**Also missing:** auction house values. Anything about what gear is *worth* needs live economy data from
Blizzard's API, which this site isn't connected to.

So the honest position: item lookup is coming, because the data is there. BiS rankings are not, because
the data isn't.
