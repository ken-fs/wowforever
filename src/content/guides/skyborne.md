---
title: "The Skyborne are two races, and they're the two factions"
description: "The client stores High Order and Windshaper Skyborne separately, and their class lists give away what they are: the Alliance and Horde versions."
facts:
  - k: "playable races"
    v: "2"
  - k: "classes each"
    v: "5"
  - k: "shared classes"
    v: "4"
  - k: "client race IDs"
    v: "95 / 96"
updated: 2026-09-28
build: "1.60.1.70009"
sources:
  - label: "Client data — CharBaseInfo and ChrRaces tables, build 1.60.1.70009"
  - label: "Nobbel87 and others — Skyborne lore coverage (~12,500 words)"
  - label: "Blizzard — Forever What's Next Panel Recap"
  - label: "Blizzard — Forever Deep Dive Panel Recap"
---

Blizzard announced one new race. The client ships two. And their class lists explain why.

## Two rows, not one

`ChrRaces` carries them as separate playable entries:

| Client ID | Race | Short name | Faction |
|---|---|---|---|
| 95 | **High Order Skyborne** | Elf | Alliance |
| 96 | **Windshaper Skyborne** | Elf | Horde |

Both are full races. Their own class lists, their own starting experience on Zephras Isle, their own
character creation options.

## The class lists give it away

Here's the bit that resolves everything. Both versions get the same four classes. Then they split by
exactly one:

| | Warrior | Hunter | Rogue | Druid | Mage | Shaman |
|---|---|---|---|---|---|---|
| **High Order** (Alliance) | ● | ● | ● | ● | ● | — |
| **Windshaper** (Horde) | ● | ● | ● | ● | — | ● |

Mage for one. Shaman for the other. Nothing else.

Beta creators describe it the same way: the Alliance Skyborne get the mage, the Horde Skyborne get the
shaman. The client's class lists match with no exceptions.

**So the Skyborne are one neutral race with two faction variants.** Stored as two rows. What looked like
an unexplained asymmetry is just how the game handles a race that can join either side.

## What they can play

Four classes for both factions:

- **Warrior**
- **Hunter** — pets make it the forgiving pick
- **Rogue** — stealth, and now axe access
- **Druid** — with **unique Skyborne forms**

Then one exclusive each. **Mage** for Alliance, **Shaman** for Horde.

The Druid entry is the interesting one. Every other Druid race has had its forms locked in for twenty
years. Skyborne get their own. That's the first genuinely new shapeshift art added to Classic-era
Azeroth.

## Who they are

Elves. The client's own short name for both entries is literally "Elf".

The lore calls them **Shan'dorei**. Cousins to blood elves and night elves. Descended from the old
Kalimdor stock that split after the Sundering, not from either modern nation.

They start on **Zephras Isle**. That comes with the Skyborne Heroic and Epic packs, along with early name
reservation.

And no, they don't have to be blue. Customisation covers a normal range. The blue is marketing, not a
rule.

[Full race and class matrix →](/race-class/)

## Why the split matters

Skyborne are neutral, so either faction can recruit them. That's why they're the only race in the client
with two entries.

In practice:

- Skyborne on Alliance → High Order variant → you can be a Mage
- Skyborne on Horde → Windshaper variant → you can be a Shaman
- Either way, you get Druid

That last point is bigger than it looks. Before Skyborne, Alliance Druid meant Night Elf. Nothing else.
A twenty-year monopoly, and plenty of players wanted it broken.

## The forums hate them

This is the loudest thing about the race, so let's not dance around it.

The beta forums are heavily against them. Three of the biggest threads:

- *"Consider pumping the brakes on Skyborne"* — over ten thousand views
- *"Can We Get A Toggle to Turn Off Skyborn?"*
- A self-described analysis thread claiming **59% disapproval, 12% in favour**

Blizzard hasn't shown any sign of reversing it. If you're picking a character rather than picking a
forum fight, the class list above is what actually limits you.

## What's uncertain

- Whether the character creator shows them as one race with a faction choice, or two separate options.
  The data says two. Nobody has confirmed the UI.
- Their **racials** aren't documented in effect terms yet. This site has the class list from the client,
  not the numbers behind their racial abilities.
- The faction mapping is a strong inference, not an official statement. It rests on the mage/shaman
  split, which both the client and independent creator coverage agree on.
