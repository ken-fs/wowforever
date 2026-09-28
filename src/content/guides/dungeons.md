---
title: "Dungeons: the new ones, their levels, and where the quests live"
description: "Forever's dungeon quests are the best experience in the game, and where you pick them up varies by faction. Levels and quest locations for the new instances."
facts:
  - k: "dungeon encounter maps"
    v: "42"
  - k: "leveling source"
    v: "quests"
  - k: "one dungeon"
    v: "up to 2 levels"
updated: 2026-09-27
build: "1.60.1.70009"
sources:
  - label: "Client data — DungeonEncounter and Map tables, build 1.60.1.70009"
  - label: "Creator dungeon walkthroughs: Ruins of Lordaeron, Hall of Thanes (~10,000 words)"
  - label: "Blizzard — Forever Deep Dive Panel Recap"
---

Dungeons stopped being optional. Because Forever moved experience out of dungeon trash and into dungeon
quests, a run is now the single most efficient thing you can do with an hour — which makes knowing where
the quests are a routing problem, not a completionist one.

## The two new instances

| Dungeon | Level range | Bosses | Quests (Horde / Alliance) |
|---|---|---|---|
| **Hall of Thanes** | ~13–17 | 6 | 3 |
| **Ruins of Lordaeron** | 16–23 | 6 | 6 / 4 |

### Hall of Thanes

The Alliance counterpart to Ragefire Chasm, and the intro dungeon for that faction. Mob levels run
**13 to 15** with one boss at **16**. It's tuned gently, but the recommendation for the tank specifically
is **17 or higher** — the first pull is where groups wipe, not the last.

Three quests. **Two are right outside the instance**, and the third comes from a small side quest in
Dun Morogh, starting from **Belden Steelgrill**, who wants you to investigate a campsite overlooking the
Gol'Bolar Quarry.

### Ruins of Lordaeron

Level **16 to 23**, six bosses, and the quest counts diverge sharply by faction:

- **Alliance: 4 quests, all of them inside the instance.** Pick them up when you get there.
- **Horde: 6 quests.** Two are inside. The other four are scattered:
  - Two in the **Undercity** — one in the Apothecarium, one in Sylvanas's room
  - One at the **caravan between Brill and the ruins**
  - One more along the way

If you're Horde, this means doing a pass through Undercity *before* you go, or you'll run it twice. The
entrance itself is inside Undercity, on the left as you come in — easy to walk past.

## Why the quests matter so much

This is the change that reshaped leveling:

- **Dungeon mob kills pay close to nothing** now
- **Dungeon quests pay enormously** — the reported ceiling is **up to two levels per dungeon**
- **Every dungeon in the game has quests**, not just the new ones

Two beta reports, both consistent:

- A warrior gained **two levels from a single Ruins of Lordaeron quest run**
- A Horde character went **14 to 20 across Ragefire Chasm, Ruins of Lordaeron and Wailing Caverns** — and
  that was the entire route

Compare that to Classic, where speed levelers routinely skipped dungeons because assembling a group cost
more than the instance paid back. That calculus is inverted.

## What it does to a route

Classic routing was zone-chaining: finish a zone, move to the next, skip instances unless you had a
group sitting ready.

Forever routing is dungeon-threading: pick a handful of zones, and use the dungeons between them as the
experience backbone. You'll cover fewer zones for the same levels.

The practical consequences:

- **Group availability matters more than route optimisation.** A dungeon you can't fill is a route that
  doesn't work.
- **Tanks and healers are the bottleneck**, and the dungeon XP change makes the tank shortage worse, not
  better — there's a long beta thread arguing exactly that.
- **Blueprints drop from dungeon bosses**, so the same runs that level you fastest also unlock your
  profession recipes. Professions and dungeons are the same activity now.

## Camps make dungeon groups better

Because camp buffs last **one hour**, a group that builds a camp before a run carries a pile of stat
buffs into the instance for free. Repair bots and reagent bots offset the two most common reasons people
leave a dungeon early.

If you're the one organising runs, the camp is worth more than your route.

## What we can't give you

- **Quest-level detail.** Quest text and rewards live on Blizzard's servers, not in the client. Saying
  exactly which quest grants what requires either playing it or reading someone who did. Sites with
  quest pages got them by typing them up from the beta.
- **The full new-dungeon list.** Creators report **nine new dungeons**; the client carries **42 dungeon
  encounter maps** in total, and separating the new ones from the returning ones is ongoing work.
- **Loot tables.** Boss encounter data is in the client (`DungeonEncounter`, 342 entries), but mapping
  drops to bosses isn't done yet.
