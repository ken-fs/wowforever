---
title: "Addons in Forever: what's restricted, and what replaced it"
description: "Forever inherits retail's addon API restrictions, so the usual combat addon advice is wrong. What Blizzard built in instead, and what still works."
facts:
  - k: "addon ruleset"
    v: "retail's"
  - k: "built-in replacements"
    v: "3"
  - k: "install filter"
    v: "CurseForge → Forever"
updated: 2026-09-27
build: "1.60.1.70009"
sources:
  - label: "Blizzard forums — 'WoW Forever will share the addon and API restrictions of retail' and the addon support subforum"
  - label: "Blizzard forums — DoT tracking, WeakAuras and UI restriction threads"
  - label: "Wowhead — Cooldown Manager Now Available in WoW: Forever Beta; beta development notes"
  - label: "Creator installation walkthroughs (~7,500 words, 4 videos)"
---

Most addon advice you'll read for Forever is Classic advice, and a chunk of it is now wrong. Forever uses
**retail's addon and API restrictions**, which means the combat addons that Classic players treat as
mandatory either don't work, or work in a reduced form.

This is the single biggest practical difference between Forever and every other WoW ruleset, and it's
barely covered anywhere.

## What actually changed

Retail's restrictions centre on what addons are allowed to *read* during combat. Health, auras and threat
are returned to addons as protected values they can display but not act on. Practically:

- **WeakAuras-style combat tracking is heavily limited.** The most common thread on the beta forums is
  asking for it back, which tells you what happened.
- **DoT tracking is disabled** in the form players expect.
- **Addons that automate a rotation or decision are out.** That part is deliberate and nobody is promising
  it returns.

Several long-running addons have also stopped maintaining retail-compatible builds at all, which removes
them from the Forever pool regardless of the rules.

## What Blizzard built in instead

Three things that used to be addon territory are now native:

| Built-in | Replaces |
|---|---|
| **Cooldown Manager** | WeakAuras-style cooldown tracking |
| **Damage meter** | Recount / Details for basic numbers |
| **Statistics pane** | Third-party character telemetry addons |

The Cooldown Manager landed mid-beta and is still being tuned — players are asking for missing-buff
tracking and for off-cooldown alerts, which suggests it's a first pass rather than a finished feature.

Alongside those, the **Inspect** window got real improvements: increased range, and talents visible by
default. That removes another slice of what people used addons for.

> The pattern is consistent: Blizzard is closing the gap with built-ins rather than loosening the
> restrictions. Plan for a UI that looks like retail's, not Classic's.

## What still works

Everything that doesn't need protected combat data. In practice that's the boring, high-value half of
the addon ecosystem:

- **Quest and map addons** — quest tracking, point-of-interest markers, rare scanning
- **UI addons** — action bars, unit frames, minimaps. One developer shipped a complete replacement
  interface built specifically around Forever's restrictions
- **Bag, mail, auction and inventory addons**
- **Bag and bank organisation**, which the base game improved but didn't finish

The community has been rebuilding the restricted pieces as interface packages rather than combat logic,
which is the direction that works.

## Installing them

CurseForge is the practical route, and the client is already registered with Blizzard:

1. Install the **CurseForge app** — the standalone build, not the Overwolf wrapper. Several creators
   specifically warn against the wrapper version.
2. In **Browse**, open the game version dropdown and pick **Forever**. If it's missing, update the app.
3. Install from there as normal.

**One known snag:** at least one popular addon (HandyNotes) has a dependency that doesn't list on
CurseForge, so the app won't pull it in. Download the dependency manually and drop it into
`Interface/AddOns`. RareScanner covers similar ground and installs cleanly if you'd rather not bother.

## The beta bug you'll hit

Addon **saved variables don't survive a client restart** in the beta. Settings write to disk correctly
and then aren't restored on load, so every addon resets to defaults on login. Blizzard lists it among
the known issues.

If you're setting up a UI in the beta, expect to redo it. It's a beta defect, not a Forever design
decision.

## What this means if you're coming from Classic

The advice that transfers is about *information*, not automation. WeakAuras won't farm your rotation for
you any more, but the things that made Classic leveling and questing bearable — quest markers, rare
alerts, a minimap that isn't actively hostile, bags you can sort — all still work, and several now have
first-party equivalents.

The honest summary of the beta consensus: **you don't need as many addons, and the ones you do need are
the ones that were never controversial.**

## What we can't confirm

- The restriction details come from beta testing and forum reports, not a published Blizzard spec. The
  precise boundary of what addons can read is being discovered by addon authors in public.
- Whether the Cooldown Manager gets the buff-tracking additions players are asking for before launch
  is unknown.
- The saved-variable bug is on the known-issues list, which is a statement that it exists, not a
  promise about when it's fixed.
