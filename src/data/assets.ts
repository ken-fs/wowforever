/**
 * 官方素材注册表。
 *
 * 全部来自 Blizzard 自己的 CDN：
 *   · 营销图 —— 官网 Forever 落地页（blz-contentstack-images.akamaized.net）
 *   · 职业图标 —— 游戏图标官方渲染 CDN（render.worldofwarcraft.com）
 *
 * 管线：`node pipeline/assets.mjs`
 *
 * 别把竞品站的截图放进来 —— 那是别人的版权，DMCA 风险比"没图"严重。
 */
const marketing = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/official/*.{jpg,png}",
  { eager: true },
);
const icons = import.meta.glob<{ default: ImageMetadata }>("/src/assets/classes/*.jpg", { eager: true });
// 天赋树/专精图标 —— fdid 来自 TalentTab.SpellIconID（就是 fdid）
const specImgs = import.meta.glob<{ default: ImageMetadata }>("/src/assets/specs/*.jpg", { eager: true });
// XP 增益法术的图标 —— fdid 来自 spell_named.icon_fdid
const buffImgs = import.meta.glob<{ default: ImageMetadata }>("/src/assets/buffs/*.jpg", { eager: true });

/** 文件名（不含扩展名）→ ImageMetadata */
const byName = Object.fromEntries(
  Object.entries(marketing).map(([path, mod]) => [
    path.split("/").pop()!.replace(/\.(jpg|png)$/, ""),
    mod.default,
  ]),
);

function pick(name: string): ImageMetadata | undefined {
  return byName[name];
}

// ── 具名导出：用途清晰的 ──────────────────────────────────────

/** 首页主视觉（官方 key art，1600×1725） */
export const hero = pick("masthead-art");

/** 社交卡片 / OG（官方 Open Graph 图） */
export const ogImage = pick("Open_Graph_-_Camelot");

/** 游戏 logo（透明 PNG） */
export const logo = pick("camelot-logo-gamepage");

/** 游戏图标 */
export const gameIcon = pick("icon_512x512");

/** 七个区域的原画 —— 官方 "Updates_<Zone>" 系列（2600×1462） */
export const zones: Record<string, ImageMetadata | undefined> = {
  ashenvale: pick("Updates_Ashenvale_01"),
  ashenvaleAlt: pick("Updates_Ashenvale_02"),
  darkshore: pick("Updates_Darkshore"),
  dustwallow: pick("Updates_Dustwallow"),
  felwood: pick("Updates_Felwood"),
  mulgore: pick("Updates_Mulgore"),
  barrens: pick("Updates_TheBarrens"),
};

/** 天裔原画 */
export const skyborne = pick("Skyborne-BG");

/** 产品/礼包图 */
export const editions = {
  heroic: pick("Heroic_Comp"),
  epic: pick("Epic_Comp"),
  collection: pick("WoWForever_Collection"),
  warcraftCollection: pick("Warcraft_Forever_Collection_Comp"),
};

/** 特性宣传图 —— 按主题名取 */
export const feature = {
  cinematic: pick("Cinematic_Trailer"),
  stories: pick("Explore_Untold_Stories"),
  expanses: pick("Soak_in_Breathtaking_Expanses"),
  paths: pick("Take_Unknown_Paths"),
  power: pick("Claim_New_Power"),
  journey: pick("Every_Journey_Matters"),
  systems: pick("System_Revamps"),
};

// ── 攻略配图：slug → 官方图 ────────────────────────────────────
// 只挑语义对得上的，别硬塞。
export const guideImage: Record<string, ImageMetadata | undefined> = {
  "skyborne": skyborne,
  "leveling": feature.paths,
  "class-changes": feature.power,
  "gear": feature.systems,
  "dungeons": feature.stories,
  "camping": zones.ashenvale,
  "professions": zones.mulgore,
  "talents": feature.journey,
  "whats-different": feature.expanses,
  "gold-day-one": zones.barrens,
  "legacy-system": feature.cinematic,
  "addons": feature.systems,
};

// ── 职业图标 ──────────────────────────────────────────────────
export const classIcon: Record<string, ImageMetadata | undefined> = Object.fromEntries(
  Object.entries(icons).map(([path, mod]) => [
    path.split("/").pop()!.replace(".jpg", ""),
    mod.default,
  ]),
);

// ── 天赋树 / 专精图标 ─────────────────────────────────────────
// key 是 `<职业slug>-<专精slug>`，例如 warrior-arms / druid-feral-combat
const byStem = (mods: Record<string, { default: ImageMetadata }>) =>
  Object.fromEntries(Object.entries(mods).map(([p, m]) => [p.split("/").pop()!.replace(".jpg", ""), m.default]));

export const specIcon: Record<string, ImageMetadata | undefined> = byStem(specImgs);

/** 取某个职业某个专精的图标。专精名跟客户端 TalentTab.Name_lang 走 */
export function specFor(cls: string, spec: string): ImageMetadata | undefined {
  const s = (x: string) => x.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return specIcon[`${s(cls)}-${s(spec)}`];
}

// ── XP 增益法术图标 ───────────────────────────────────────────
export const buffIcon: Record<string, ImageMetadata | undefined> = byStem(buffImgs);

/** 取某个增益法术的图标（按法术名） */
export function buffFor(name: string): ImageMetadata | undefined {
  return buffIcon[name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")];
}

export const attribution =
  "Artwork © Blizzard Entertainment. Reproduced from Blizzard's own press and marketing assets for reference.";
