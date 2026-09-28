/**
 * 官方美术素材管线 —— 把 Blizzard 自家的营销图和游戏图标抓下来
 *
 * 为什么用这两个来源：
 *   1. blz-contentstack-images.akamaized.net —— Blizzard 官网自己挂的营销素材
 *      （Forever 落地页的主视觉、天裔原画、区域图、产品图）
 *   2. render.worldofwarcraft.com/us/icons —— 游戏内图标的官方渲染 CDN
 *      通过 wago.tools/api/info/{fdid} 拿文件名，再拼 CDN 地址
 *
 * 不用竞品站的图：那是别人的截图，DMCA 风险比"没图"严重得多。
 * 这两个源返回的都是开发商自己发布/渲染的素材。
 *
 *   node pipeline/assets.mjs            # 全量
 *   node pipeline/assets.mjs --force    # 重下
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "src/assets/official");
const ICONS = resolve(ROOT, "src/assets/classes");
const MANIFEST = resolve(ROOT, "data/assets.json");
const DB = resolve(ROOT, "data/wow-forever.db");
const FORCE = process.argv.includes("--force");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function grab(url, dest, { retries = 3 } = {}) {
  if (!FORCE && existsSync(dest) && statSync(dest).size > 1000) return { dest, cached: true };
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 500) return { dest: null, skip: `太小 ${buf.length}B` };
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, buf);
        return { dest, size: buf.length };
      }
      if (res.status === 404) return { dest: null, skip: "404" };
      if (i === retries - 1) return { dest: null, skip: `HTTP ${res.status}` };
    } catch (e) {
      if (i === retries - 1) return { dest: null, skip: `ERR ${e.message.slice(0, 40)}` };
    }
    await sleep(1500);
  }
}

/** JPEG 尺寸，用来记进清单（也验证下下来的确实是图） */
function jpegSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] === 0xff && [0xc0, 0xc1, 0xc2].includes(buf[i + 1])) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i++;
  }
  return null;
}

// ── 1. 官方营销素材（从 Forever 落地页抓 URL 列表）────────────
console.error("▸ 官方营销素材");
const page = await (await fetch("https://worldofwarcraft.blizzard.com/en-us/forever", { headers: { "User-Agent": UA } })).text();
const cdn = "https://blz-contentstack-images.akamaized.net/";

// 同一个素材有 sm/md/lg 多个变体 —— 按基础名去重，优先拿不带尺寸后缀的那个
const variants = [...new Set([...page.matchAll(new RegExp(`https://blz-contentstack-images\\.akamaized\\.net/[^"'\\\\\\s)]+`, "g"))].map((m) => m[0]))];
const byBase = new Map();
for (const u of variants) {
  const path = u.split("?")[0];
  const base = path.replace(/-(sm|md|lg)\.(jpg|png)$/, ".$2");
  const isFull = !/-(sm|md|lg)\./.test(path);
  if (!byBase.has(base) || isFull) byBase.set(base, path);
}

const official = [];
for (const [base, url] of byBase) {
  const name = base.split("/").pop();
  if (name.endsWith(".png") && name.includes("favicon")) continue; // 跳过网站图标
  const dest = resolve(OUT, name);
  const r = await grab(url, dest);
  const size = r.dest ? jpegSize(readFileSync(r.dest)) : null;
  official.push({ name, url, ok: !!r.dest, kb: r.dest ? Math.round(statSync(r.dest).size / 1024) : 0, dim: size ? `${size.w}x${size.h}` : "png/svg", skip: r.skip });
  console.error(`  ${r.dest ? "✓" : "✗"} ${name.padEnd(42)} ${r.dest ? `${Math.round(statSync(r.dest).size / 1024)}KB ${size ? size.w + "x" + size.h : ""}` : r.skip}`);
  await sleep(120);
}

// ── 2. 游戏图标（fdid → 文件名 → 官方渲染 CDN）────────────────
// 三组：职业徽记 9 · 天赋树/专精 27 · XP 增益 5
const slug = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const iconCache = new Map(); // fdid → 文件名，避免重复请求

async function iconUrl(fdid) {
  if (iconCache.has(fdid)) return iconCache.get(fdid);
  const info = await (await fetch(`https://wago.tools/api/info/${fdid}`, { headers: { "User-Agent": UA } })).json().catch(() => ({}));
  const file = (info.filename || "").split("/").pop().replace(".blp", "");
  const url = file ? `https://render.worldofwarcraft.com/us/icons/56/${file}.jpg` : null;
  iconCache.set(fdid, url);
  return url;
}

async function fetchIconSet(label, rows, outDir, nameOf) {
  console.error(`\n▸ ${label}`);
  mkdirSync(outDir, { recursive: true });
  const out = [];
  for (const r of rows) {
    if (!r.fdid || String(r.fdid) === "0") { out.push({ ...r, ok: false, skip: "无 fdid" }); continue; }
    const url = await iconUrl(r.fdid);
    if (!url) { out.push({ ...r, ok: false, skip: "无文件名" }); continue; }
    const dest = resolve(outDir, `${nameOf(r)}.jpg`);
    const res = await grab(url, dest);
    out.push({ ...r, file: url.split("/").pop().replace(".jpg", ""), url, ok: !!res.dest, skip: res.skip });
    console.error(`  ${res.dest ? "✓" : "✗"} ${nameOf(r).padEnd(30)} ${url.split("/").pop().replace(".jpg", "")}`);
    await sleep(120);
  }
  return out;
}

const q = (sql) => JSON.parse(execFileSync("sqlite3", ["-readonly", "-json", DB, sql], { encoding: "utf8" }));

const classIcons = await fetchIconSet(
  "职业徽记",
  q("SELECT Name_lang AS name, IconFileDataID AS fdid FROM ChrClasses"),
  ICONS,
  (r) => slug(r.name),
);

const specIcons = await fetchIconSet(
  "天赋树 / 专精",
  // ClassMask 是位掩码 —— Talent.ClassID 在 Forever 客户端里整列是 0，别用
  q(`SELECT c.Name_lang AS cls, tt.Name_lang AS spec, tt.SpellIconID AS fdid
     FROM TalentTab tt
     JOIN ChrClasses c ON (CAST(tt.ClassMask AS INTEGER) & (1 << (CAST(c.ID AS INTEGER)-1))) > 0`),
  resolve(ROOT, "src/assets/specs"),
  (r) => `${slug(r.cls)}-${slug(r.spec)}`,
);

const buffIcons = await fetchIconSet(
  "XP 增益法术",
  q(`SELECT DISTINCT s.name, s.icon_fdid AS fdid FROM xp_spell x JOIN spell_named s ON s.id = x.id WHERE s.icon_fdid > 0`),
  resolve(ROOT, "src/assets/buffs"),
  (r) => slug(r.name),
);

// ── 3. 清单 ───────────────────────────────────────────────────
mkdirSync(dirname(MANIFEST), { recursive: true });
writeFileSync(
  MANIFEST,
  JSON.stringify(
    {
      generated: new Date().toISOString(),
      sources: {
        marketing: "blz-contentstack-images.akamaized.net — Blizzard 官网 Forever 落地页素材",
        classIcons: "render.worldofwarcraft.com/us/icons — 游戏图标官方渲染 CDN（fdid 经 wago.tools/api/info 解析）",
      },
      counts: { marketing: official.filter((x) => x.ok).length, classIcons: classIcons.filter((x) => x.ok).length, specIcons: specIcons.filter((x) => x.ok).length, buffIcons: buffIcons.filter((x) => x.ok).length },
      marketing: official,
      classIcons,
      specIcons,
      buffIcons,
    },
    null,
    1,
  ),
);

console.error("");
for (const [dir, arr] of [["official", official], ["classes", classIcons], ["specs", specIcons], ["buffs", buffIcons]]) {
  const ok = arr.filter((x) => x.ok).length;
  console.error(`→ src/assets/${dir.padEnd(9)} ${ok}/${arr.length}`);
}
console.error("→ data/assets.json   清单");
