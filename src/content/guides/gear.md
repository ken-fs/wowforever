---
title: "Gear: new tier sets, rewritten loot, and pet scaling"
description: "Blizzard rewrote dungeon loot for Forever and added tier sets for all nine classes. Plus the Hunter pet change that inverts how you gear."
facts:
  - k: "rare+ items indexed"
    v: "4,581"
  - k: "new tier sets"
    v: "9 classes"
  - k: "likely source"
    v: "Mount Hyjal"
  - k: "pet health per stamina"
    v: "2"
updated: 2026-09-28
build: "1.60.1.70009"
sources:
  - label: "Client data — Item / ItemSparse / ItemSet tables, build 1.60.1.70009"
  - label: "Creator item and gear coverage (~22,000 words, including a full new-items video)"
  - label: "Blizzard — Forever Deep Dive Panel Recap"
---

Two things changed about gearing. Blizzard **rewrote dungeon drops**, and there are **new tier sets for all
nine classes**.

## Your Classic drop knowledge is out

Creators describe this as something Blizzard hasn't done at this scale. The drop tables were rewritten,
not inherited.

So you can't trust Classic drop knowledge beyond the broad shape. Item names and slots look familiar.
The stats don't.

Some examples from the level 13–20 band, read off the beta:

| Item | Level | Stats |
|---|---|---|
| Subterranean Cape | 13 | +3 Strength, 5 health per 5 sec, 17 armor |
| Crystalline Cuffs (cloth wrists) | 13 | +2 Intellect, +3 Spirit |
| Footpads of the Fang | — | **+6 Agility, +6 Stamina** |

That last one is the tell. **+6/+6 is a lot for that level band.**

It's also why "not perfectly itemised" and "strong" still belong in the same sentence. Forever keeps
Classic's uneven item design. The numbers are just better if you know where to look.

## Tier sets

All nine classes get one. Creator coverage of the Druid set:

- Drawn in the Classic idiom — crescent-moon motifs, no modern-graphics drift
- Described as "exactly what a new tier set in Classic would look like"

Likely source: the **Mount Hyjal** raid. It shows up in the challenge list as **13 bosses**, one of the
biggest encounters in the game. No stat budget has been published.

The client holds **536 item sets**. Most are legacy entries. Narrowing down to Forever's real tier sets
is ongoing work.

## Hunter pets scale with your gear now

Quiet change. Big effect on how Hunters itemise.

| Your stat | Pet gets |
|---|---|
| 1 Stamina | **2 Health** |
| Armor | **30% transferred** |

In Classic a pet's stats were its own. Now your gear feeds it.

So **Stamina on gear is worth more to a Hunter than to anyone else.** Gear that looks like survivability
for you is damage for your pet.

Expect Hunter itemisation guides to get rewritten. This is one of the few places a stat priority actually
flipped, rather than just shifting.

## The horizontal progression promise

Forever's pitch: item level stops climbing. Level cap stays 60. The world grows sideways instead of up.

That's the design intent, and it's why "what's best" should stay answerable longer here than in a version
that keeps raising the ceiling.

But there's a real risk, and the beta talks about it a lot. **If power does creep upward, the content
behind you gets retired.** Nobody wants to run a raid that only exists to be outgrown.

Blizzard says new content adds options rather than replacing them. Whether that holds across several
releases is the thing to watch. Beta data can't settle it.

## What this site can and can't do

**Can:** the client carries **31,818 items** and **536 item sets**, with names, quality, item level,
required level, class, subclass and icon IDs. That's enough for item pages and set lists.

**Can't, yet:** BiS lists.

A BiS list says what's best for a spec at a level band. That needs stat weights. Stat weights need either
simulation or a mountain of field data. Any BiS list for Forever right now is someone's opinion about a
beta. We'd rather not dress that up as data.

**Also missing:** auction house prices. What gear is *worth* needs live economy data from Blizzard's API.
This site isn't connected to that.

So: item lookup is coming, because the data exists. BiS rankings aren't, because it doesn't.
