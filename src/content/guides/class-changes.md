---
title: "Class changes: what Forever rewrote"
description: "Forever pulls abilities forward from later expansions and rebuilds talent trees. What each of the nine classes actually got, and what's still unclear."
facts:
  - k: "classes"
    v: "9"
  - k: "talents"
    v: "466"
  - k: "trees"
    v: "27"
updated: 2026-09-28
build: "1.60.1.70009"
sources:
  - label: "Client data — Talent / TalentTab / Spell tables, build 1.60.1.70009"
  - label: "Creator coverage of class changes (~28,000 words across beta patch breakdowns)"
  - label: "Blizzard — Forever Deep Dive Panel Recap"
  - label: "Wowhead — beta development notes and datamined tuning passes"
---

Forever's class design runs on one rule. Abilities that later expansions made core to a spec get pulled
back into a level-60 game.

Lava Burst. Mutilate. Victory Rush. Holy Strike. All back, all baseline.

The client holds the rest — **466 talents across 27 trees**. That's what the
[class pages](/classes/) and their talent calculators are built from.

## Warrior

- **Victory Rush** is baseline for all three specs. Kill something, heal yourself. That fixes solo
  questing, which is where Warriors hurt most.
- **Sunder Armor** threat values corrected across every rank.
- **Protection** swapped **Bastion** and **Focused Rage**. Focused Rage lands earlier, so the spec
  smooths out instead of spiking.
- Rage generation is still the loudest Warrior complaint on the beta forums. Several big threads want the
  normalisation reverted, not compensated.

## Paladin

- **Holy** gets a new capstone, **Light's Vigil**. The spec finally has an area button. Twenty years of
  single-target triage, and now it can heal or damage a group.
- **Voice of Truth** gives **6 seconds of immunity to silence and interrupts**. That's a real Holy
  problem, solved directly.
- **Infusion of Light** is in, plus better mana regen.
- **Retribution** gets **Holy Strike**, a short-cooldown weapon-and-holy hit, plus an absorb shield on
  attacks.
- **Retribution Aura** scales with spell power now instead of sitting at a fixed number.
- Consecration bugs fixed, including one where it simply didn't apply.
- **Undead can be Paladins.** Loudest change in the expansion.

## Shaman

- **Lava Burst is back.** Elemental players missed it most, and it changes the rotation rather than just
  adding a button.
- **Totemic Projection** and **Totemic Recall** are in. Drop all four totems at once, or pull them back
  for mana. Both together take about **3 seconds**.
- **Fire Nova reworked.** It doesn't eat a totem slot any more — it just deals AoE from your fire totem.
- **Windfury, Tranquil Air and Grace of Air no longer stack.** Not even from different shamans in one
  group. Stacking shamans is worse than it was.
- **Elemental** swapped Elemental Fury and Elemental Alacrity, putting crit damage earlier in the tree.
- **Dwarf Shamans** are new.

## Rogue

- **Rogues can wield axes now.** Quiet change, loud result: Fury Warriors and Rogues want the same drops.
- **Assassination** leans hard into poisons. **Mutilate** lands as a major attack.
- Creators call this a rework, not a tuning pass. It got its own beta news post, which is unusual.

## Hunter

- **Summon Hawks** is new. Another creature to manage on top of your pet.
- **Marksmanship** carries the deeper changes. The other two specs feel familiar.

## Mage

- **Orc Mages** and **Alliance Skyborne Mages** are both new.
- **Frostfire Bolt** is baseline. Cross-tree fire/frost builds open up instead of forcing one element.
- Mages get their own system for **ciphering scrolls**.

## Warlock

Barely touched:

- Healing now scales correctly off **10% of the Warlock's spell healing**
- Otherwise unchanged

Warlocks are consistently rated a top leveling class in the beta. Unchanged is arguably a buff.

## Druid

- **Skyborne Druids get their own forms.** First new shapeshift set added to Classic-era Azeroth.
- Feral has a design problem that isn't about tuning. There's a long forum thread making that case.

## Two warnings before you plan around this

**Talent positions move between builds.** The beta was taking a new build roughly **every day** while this
was written. A tree that was right last week may be wrong now. The [class pages](/classes/) rebuild from
the client, so they track the current build instead of a snapshot.

**Creator coverage isn't patch notes.** Most of the above came from people reading tooltips on stream.
Treat tuning numbers as provisional. Mechanics are safer.

## What's still missing

- **Skyborne racials** aren't documented in effect terms yet
- The client has per-spec ability lists (31,703 named spells), but sorting them by spec and cutting the
  unused ones is ongoing
- All **466 talents** are in the [talent calculators](/tools/talent-calculator/), with their real
  positions, ranks and arrows
