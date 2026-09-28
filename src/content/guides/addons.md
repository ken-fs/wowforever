---
title: "Addons: what's restricted, and what replaced it"
description: "Forever inherits retail's addon API restrictions, so most Classic addon advice is wrong. What Blizzard built in instead, and what still works."
facts:
  - k: "addon ruleset"
    v: "retail's"
  - k: "built-in replacements"
    v: "3"
  - k: "install filter"
    v: "CurseForge → Forever"
updated: 2026-09-28
build: "1.60.1.70009"
sources:
  - label: "Blizzard forums — 'WoW Forever will share the addon and API restrictions of retail' and the addon support subforum"
  - label: "Blizzard forums — DoT tracking, WeakAuras and UI restriction threads"
  - label: "Wowhead — Cooldown Manager Now Available in WoW: Forever Beta; beta development notes"
  - label: "Creator installation walkthroughs (~7,500 words, 4 videos)"
---

Careful with addon advice for Forever. Most of it is Classic advice, and a chunk of it is now wrong.

Forever uses **retail's addon and API restrictions**. So the combat addons Classic players treat as
mandatory either don't work, or work in a reduced form.

That's the biggest practical difference between Forever and any other WoW ruleset. Almost nobody covers
it.

## What changed

The restrictions are about what an addon can **read** during combat. Health, auras and threat come back
as protected values. An addon can show them. It can't act on them.

So:

- **WeakAuras-style combat tracking is heavily limited.** The most common beta forum thread is asking
  for it back. That tells you what happened.
- **DoT tracking is off**, in the form players expect.
- **Rotation and decision automation is out.** That part is deliberate. Nobody is promising it returns.

Some long-running addons also stopped maintaining retail builds entirely. They're out of the Forever pool
whatever the rules say.

## What Blizzard built instead

Three things that used to be addon territory are native now:

| Built-in | Replaces |
|---|---|
| **Cooldown Manager** | WeakAuras-style cooldown tracking |
| **Damage meter** | Recount / Details, for basic numbers |
| **Statistics pane** | Third-party character addons |

The Cooldown Manager landed mid-beta and is still being tuned. Players want missing-buff tracking and
off-cooldown alerts. Sounds like a first pass, not a finished feature.

The **Inspect** window got real improvements too. Longer range, and talents visible by default. Another
slice of what people used addons for, gone.

> Blizzard is closing the gap with built-ins. Not loosening the restrictions. Plan for a UI that looks
> like retail's, not Classic's.

## What still works

Anything that doesn't need protected combat data. That's the boring, useful half of the addon world:

- **Quest and map addons** — tracking, points of interest, rare scanning
- **UI addons** — action bars, unit frames, minimaps. One developer shipped a whole replacement interface
  built around Forever's restrictions
- **Bag, mail, auction and inventory addons**

The community is rebuilding the restricted parts as interface packages, not combat logic. That's the
direction that works.

## How to install them

CurseForge is the practical route. The client is already registered with Blizzard.

1. Install the **CurseForge app**. Standalone build, not the Overwolf wrapper — several creators warn
   against the wrapper.
2. Open **Browse** and pick **Forever** from the game version dropdown. Missing? Update the app.
3. Install like normal.

**One snag.** At least one popular addon (HandyNotes) has a dependency that isn't listed on CurseForge,
so the app won't pull it in. Grab the dependency by hand and drop it into `Interface/AddOns`.
RareScanner covers similar ground and installs cleanly if you'd rather skip the hassle.

## The beta bug you'll hit

Addon **saved variables don't survive a client restart** in the beta.

Settings write to disk fine. They just aren't restored on load. So every addon resets to defaults each
time you log in. It's on Blizzard's known-issues list.

Setting up a UI in the beta right now means doing it again tomorrow. Beta defect, not a Forever design
choice.

## Coming from Classic

The advice that carries over is about **information**, not automation.

WeakAuras won't play your rotation. But the things that made Classic bearable all still work: quest
markers, rare alerts, a minimap that isn't hostile, bags you can sort. Several now have first-party
versions.

Short version of the beta consensus: **you need fewer addons, and the ones you need were never
controversial.**

## What we can't confirm

- The restriction details come from beta testing and forum posts, not a published Blizzard spec. Addon
  authors are mapping the exact boundary in public.
- Whether the Cooldown Manager gets buff tracking before launch is unknown.
- The saved-variable bug being on the known-issues list means it exists. It doesn't mean anyone said when
  it's fixed.
