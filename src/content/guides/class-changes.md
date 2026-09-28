---
title: "Class changes: what Forever rewrote, class by class"
description: "Forever pulls abilities forward from later expansions and rebuilds talent trees. Every class change we could confirm, listed class by class."
facts:
  - k: "classes"
    v: "9"
  - k: "talent points"
    v: "432"
  - k: "trees"
    v: "27"
updated: 2026-09-27
build: "1.60.1.70009"
sources:
  - label: "Client data — Talent / TalentTab / Spell tables, build 1.60.1.70009"
  - label: "Creator coverage of class changes (~28,000 words across beta patch breakdowns)"
  - label: "Blizzard — Forever Deep Dive Panel Recap"
  - label: "Wowhead — beta development notes and datamined tuning passes"
---

Forever's class design has one consistent rule: **abilities that later expansions made core to a spec get
pulled back into a level-60 game.** Lava Burst, Mutilate, Victory Rush and Holy Strike are all things
Classic players know from later eras, restored here as baseline parts of the kit.

Below is what's confirmed. The client holds the full picture — **432 talent points across 27 trees** —
and that data drives the class pages on this site.

## Warrior

- **Victory Rush** becomes a baseline ability for all three specs. Kill an enemy, heal yourself. That's a
  meaningful change to solo questing, which is where Warriors have historically suffered most.
- **Sunder Armor** threat values corrected across all ranks, with a small increase from attack power.
- **Protection**: the positions of **Bastion** and **Focused Rage** were swapped, pushing Focused Rage
  earlier so progression smooths out instead of spiking.
- Rage generation remains the most-discussed Warrior issue on the beta forums by a wide margin. Multiple
  large threads ask for the normalisation to be reverted rather than compensated for.

## Paladin

- **Holy** gets a new capstone, **Light's Vigil**, which finally gives the spec AoE healing or AoE damage
  potential. A spec built for twenty years around single-target triage now has an area button.
- **Voice of Truth** grants **6 seconds of immunity to silence and interrupts** — a real Holy Paladin
  problem solved directly.
- **Infusion of Light** is in, with better mana regeneration alongside it.
- **Retribution** gets **Holy Strike**, a short-cooldown strike combining weapon and holy damage, and an
  absorb shield that procs on attacks.
- **Retribution Aura** now scales dynamically with spell power instead of sitting at a fixed value.
- Consecration bugs fixed, including one where it failed to apply its effect.
- **Undead can be Paladins now**, which is the single loudest change in the expansion.

## Shaman

- **Lava Burst is back.** It's the ability Elemental players have missed most, and it unlocks a different
  play pattern rather than just adding a button.
- **Totemic Projection** and **Totemic Recall** are both added: summon all four totems at once, or recall
  them all for mana back. Casting them together takes about **3 seconds**.
- **Fire Nova reworked** — it no longer occupies its own totem slot and simply deals AoE damage from your
  fire totem. Improved Fire Nova is also in.
- **Windfury, Tranquil Air and Grace of Air no longer stack**, even from different shamans in the same
  group. Stacking shamans is meaningfully worse than it was.
- **Elemental**: Elemental Fury and Elemental Alacrity swapped positions, putting crit damage earlier in
  the tree.
- **Dwarf Shamans** are new — one of six new race/class combinations in Forever.

## Rogue

- **Rogues can wield axes.** This is a quiet change with loud consequences: Fury Warriors now compete with
  Rogues for the same weapon drops.
- **Assassination** leans much harder into poison damage, and **Mutilate** is added as a major attack.
- The class received what creators describe as a substantial rework rather than a tuning pass — large
  enough that it was covered as its own news item during the beta.

## Hunter

- **Summon Hawks** is a new ability that sits between the existing shots. It's another creature-management
  button on top of a pet rotation.
- **Marksmanship** sees the deeper changes; the other two specs are described as familiar.

## Mage

- **Orc Mages and Alliance Skyborne Mages** are both new.
- **Frostfire Bolt** becomes baseline, giving every Mage a mixing option and opening up cross-tree builds
  instead of forcing a single element.
- Mages get their own profession-flavoured system for **ciphering scrolls**.

## Warlock

The lightest touch of any class:

- A fix so that healing correctly scales with **10% of the Warlock's spell healing**
- Otherwise largely unchanged

Given that Warlocks are consistently rated a top leveling class in the beta, "unchanged" is arguably a
buff.

## Druid

- **Skyborne Druids get their own unique forms** — the first new shapeshift set added to Classic-era
  Azeroth
- Feral has a community-documented design problem that isn't just about tuning, and there's a long forum
  thread making that argument

## How to read this

Two cautions, both important:

**Talent positions move between builds.** Forever's beta was receiving a new build roughly **every day**
during the period this covered. A tree layout that was accurate last week may not be this week. The
class pages on this site regenerate from the client, so they track the current build rather than a
snapshot.

**Creator coverage is not patch notes.** Most of what's above comes from people reading tooltips on
stream. Where a claim is a tuning number rather than a mechanic, treat it as provisional.

## What's missing

- **Racials for the Skyborne** aren't documented in effect terms yet
- Full per-spec ability lists exist in the client (31,703 named spells) but mapping them to specs and
  pruning the unused ones is ongoing work
- The **432 talent points** are indexed and browsable on the [class pages](/classes/), but the actual
  talent *trees* with their point costs are still being assembled
