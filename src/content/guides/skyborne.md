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
updated: 2026-09-27
build: "1.60.1.70009"
sources:
  - label: "Client data — CharBaseInfo and ChrRaces tables, build 1.60.1.70009"
  - label: "Nobbel87 and others — Skyborne lore coverage (~12,500 words)"
  - label: "Blizzard — Forever What's Next Panel Recap"
  - label: "Blizzard — Forever Deep Dive Panel Recap"
---

Blizzard announced one new race. The client ships two, and their class lists explain why.

## Two rows in the data

`ChrRaces` carries them as separate playable entries:

| Client ID | Race | Short name | Faction |
|---|---|---|---|
| 95 | **High Order Skyborne** | Elf | Alliance |
| 96 | **Windshaper Skyborne** | Elf | Horde |

Both count as full playable races with their own class lists, their own starting experience on Zephras
Isle, and their own character creation options.

## The class lists give it away

This is the part that resolves it. Both versions get the same four classes, and then they diverge by
exactly one:

| | Warrior | Hunter | Rogue | Druid | Mage | Shaman |
|---|---|---|---|---|---|---|
| **High Order** (Alliance) | ● | ● | ● | ● | ● | — |
| **Windshaper** (Horde) | ● | ● | ● | ● | — | ● |

Mage for one, Shaman for the other, nothing else. Beta creators describe the split in exactly these
terms — the Alliance Skyborne get the mage, the Horde Skyborne get the shaman — and the client's class
lists match with no exceptions.

**So the Skyborne are a neutral race with two faction variants, stored as two rows.** What looked like an
unexplained asymmetry is just how the game handles a race that can join either side.

## What they can play

Four classes are open to both factions:

- **Warrior** — and Skyborne warriors get Blood Fury-adjacent tools via their racials
- **Hunter** — the pet classes are the forgiving picks
- **Rogue** — stealth, and in Forever, the ability to wield **axes**
- **Druid** — with **unique Skyborne druid forms**

Then one faction-exclusive each: **Mage** for Alliance, **Shaman** for Horde.

The Druid entry is the interesting one. Every other Druid race has had its forms set for twenty years.
Skyborne Druids get their own, which is the first genuinely new shapeshift art set the game has added
to Classic-era Azeroth.

## Who they are

The Skyborne are elves — the client's own short name for both entries is literally "Elf". The lore
positions them as **Shan'dorei**, cousins to both the blood elves and the night elves, descended from
the ancient Kalimdor stock that split after the Sundering rather than from either modern nation.

They arrive from **Zephras Isle**, their starting zone, which is included with the Skyborne Heroic and
Epic packs along with early name reservation.

And no, they don't have to be blue. Customisation covers a normal range; the blue is a marketing
impression, not a rule.

## Where they fit

Being neutral means Skyborne can be recruited by either faction, which is why they're the only race in
the client with two entries instead of one. Functionally:

- Pick Skyborne on Alliance → you're playing the High Order variant, and you can be a Mage
- Pick Skyborne on Horde → you're playing the Windshaper variant, and you can be a Shaman
- Either way you get Druid, which is otherwise restricted to Night Elf, Tauren, and you

That last point matters more than it looks. Before Skyborne, Alliance Druid meant Night Elf and nothing
else — a twenty-year monopoly that a lot of players wanted broken.

## The community did not ask for this

Worth stating plainly, because it's the loudest thing about the race: the beta forums are heavily
against them. The biggest threads include *"Consider pumping the brakes on Skyborne"* with over ten
thousand views, *"Can We Get A Toggle to Turn Off Skyborn?"*, and a self-described analysis thread
claiming **59% disapproval against 12% in favour**.

Blizzard has shown no sign of reversing the addition. If you're making a character decision rather than
a forum argument, the class list above is what actually constrains you.

## What's uncertain

- Whether the character creator presents them as one race with a faction choice, or as two visibly
  separate options, isn't confirmed. The data says two.
- Their **racials** aren't fully documented yet — this site has the Skyborne class list from the client,
  but not the effect values for their racial abilities.
- The faction inference above is a strong one, not an official statement. It rests on the mage/shaman
  split being corroborated by both the client and independent creator coverage.
