/**
 * WoW: Forever 数据管线
 *
 * 一个脚本干三件事：resolve build → 拉 wago.tools CSV → 灌 SQLite
 * 换游戏版本只需重跑；没有依赖（node 内置 fetch + sqlite3 CLI）
 *
 *   node pipeline/build.mjs                 # 拉当前 beta build
 *   node pipeline/build.mjs --force         # 重下 CSV
 *   node pipeline/build.mjs --build=1.60.1.70009
 *   node pipeline/build.mjs --only=Item,Spell
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = resolve(ROOT, "data/raw");
const DB = resolve(ROOT, "data/wow-forever.db");
const PRODUCT = "wow_classic_beta"; // Forever beta 的产品代号（正式版出来后可能要改）

// 想加表就往这里加；不存在会自动跳过并记一行
const TABLES = [
  // 实体底座
  "Item", "ItemSparse", "ItemSet", "ItemClass", "ItemSubClass", "ItemDisplayInfo",
  "ItemXItemEffect", "ItemEffect",
  "Spell", "SpellName", "SpellEffect", "SpellReagents", "SpellMisc", "SpellCategory",
  // 角色：职业 / 种族 / 天赋
  "ChrRaces", "ChrClasses", "CharBaseInfo", "Talent", "TalentTab", "ChrSpecialization",
  // 专业 / 配方
  "SkillLine", "SkillLineAbility",
  // 世界 / 副本
  "Map", "DungeonEncounter", "Creature", "QuestV2", "QuestXP", "QuestInfo", "QuestLine", "QuestPOIBlob",
  "LevelExperience",
  // 传承系统
  "TraitTree", "TraitNode", "TraitNodeEntry", "TraitDefinition", "TraitCurrency",
];

const flags = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = true] = a.replace(/^--/, "").split("=");
    return [k, v];
  }),
);
const FORCE = !!flags.force;
const ONLY = flags.only ? String(flags.only).split(",") : null;

// ── 1. resolve build ────────────────────────────────────────────
async function resolveBuild() {
  if (flags.build) return flags.build;
  const txt = await (await fetch(`http://us.patch.battle.net:1119/${PRODUCT}/versions`)).text();
  const row = txt.split("\n").find((l) => l.startsWith("us|"));
  if (!row) throw new Error(`拿不到 ${PRODUCT} 的版本号`);
  return row.split("|")[5];
}

// ── 2. 下载 CSV ────────────────────────────────────────────────
async function fetchTable(table, build) {
  const dir = resolve(RAW, build);
  const file = resolve(dir, `${table}.csv`);
  if (!FORCE && existsSync(file) && statSync(file).size > 0) return { table, file, cached: true };
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(`https://wago.tools/db2/${table}/csv?build=${build}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (res.status === 200) {
        const buf = Buffer.from(await res.arrayBuffer());
        // wago.tools 偶尔把 Cloudflare 错误页当 200 吐回来（实测见过 "error code: 520" 16 字节）
        // 只认"第一行像 CSV 表头"的响应，否则别把它缓存成数据
        const head = buf.subarray(0, 200).toString("utf8").split("\n")[0];
        if (!head.includes(",") || /^error code/i.test(head.trim())) {
          if (i === 2) return { table, file: null, skip: `坏响应: ${head.slice(0, 40)}` };
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        mkdirSync(dir, { recursive: true });
        writeFileSync(file, buf);
        return { table, file, size: buf.length };
      }
      return { table, file: null, skip: `HTTP ${res.status}` };
    } catch (e) {
      if (i === 2) return { table, file: null, skip: `ERR ${e.message}` };
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

// ── 3. 灌 SQLite（用 sqlite3 CLI 的 .import，省掉自己写 CSV parser）──
function importAll(results, build) {
  rmSync(DB, { force: true });
  const script = [];
  let imported = 0;
  for (const r of results) {
    if (!r.file) continue;
    const rows = readFileSync(r.file, "utf8").split("\n").length - 1;
    if (rows <= 0) continue;
    // .import 默认把 CSV 第一行当列名 —— 别加 --skip，否则第一行数据会变成列名
    script.push(`.mode csv`, `.import --csv "${r.file}" "${r.table}"`);
    imported++;
  }
  // meta：把 build 号写进库里，站点构建时读它显示"数据基于哪个版本"
  // 营地道具对照表 —— 攻略里的道具名（创作者转述）↔ 客户端配方名。
  // 不能在 SQL 里自动匹配：按名字 LIKE '%camp%' 只能捞到 4/16。
  const campMap = JSON.parse(readFileSync(resolve(ROOT, "pipeline/camp-objects.json"), "utf8")).objects;
  const esc = (v) => (v === null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
  script.push(
    `DROP TABLE IF EXISTS camp_object;`,
    `CREATE TABLE camp_object (profession TEXT, object TEXT, tier INTEGER, recipe TEXT);`,
    ...campMap.map((o) => `INSERT INTO camp_object VALUES (${esc(o.profession)}, ${esc(o.object)}, ${o.tier}, ${esc(o.recipe)});`),
  );
  script.push(
    `CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);`,
    `INSERT OR REPLACE INTO meta VALUES ('build', '${build}'), ('built_at', '${new Date().toISOString()}');`,
    `.read ${resolve(ROOT, "pipeline/derive.sql")}`,
    ".quit",
  );
  const tmp = resolve(ROOT, "data/_import.sql");
  writeFileSync(tmp, script.join("\n"));
  execFileSync("sqlite3", [DB], { input: readFileSync(tmp), stdio: ["pipe", "inherit", "inherit"] });
  rmSync(tmp, { force: true });
  // 哨兵：列名不对说明 --skip 之类的参数把表头吃掉了，早点炸掉好过后面出鬼数据
  const cols = execFileSync("sqlite3", ["-readonly", DB, "SELECT count(*) FROM pragma_table_info('Item') WHERE name='ID'"], { encoding: "utf8" }).trim();
  if (cols !== "1") throw new Error("Item 表没有 ID 列 —— 表头被吃掉了，检查 .import 参数");
  return imported;
}

// ── 4. 报告 ────────────────────────────────────────────────────
function query(sql) {
  return execFileSync("sqlite3", ["-readonly", "-json", DB, sql], { encoding: "utf8" });
}
function q1(sql) {
  const out = query(sql).trim();
  return out ? JSON.parse(out) : [];
}

function report(build, results) {
  const L = [];
  L.push(`# 数据管线报告 · build ${build}`);
  L.push("");
  L.push(`> ${new Date().toISOString().slice(0, 19).replace("T", " ")} · 产品 ${PRODUCT}`);
  L.push("");
  L.push("## 表");
  L.push("");
  L.push("| 表 | 行数 |");
  L.push("|---|---|");
  for (const r of results) {
    if (!r.file) { L.push(`| \`${r.table}\` | ✗ ${r.skip} |`); continue; }
    const n = Number(execFileSync("sqlite3", ["-readonly", DB, `SELECT COUNT(*) FROM "${r.table}"`], { encoding: "utf8" }));
    L.push(`| \`${r.table}\` | ${n.toLocaleString()} |`);
  }
  L.push("");
  L.push("## 可生成的页面量");
  L.push("");
  L.push("| 支柱 | 页数 | 依据 |");
  L.push("|---|---|---|");
  const pillars = q1(`SELECT * FROM v_page_counts`);
  for (const p of pillars) L.push(`| ${p.pillar} | **${Number(p.pages).toLocaleString()}** | ${p.basis} |`);

  L.push("");
  L.push("## 顺手挖到的（官方没讲 / 竞品没写）");
  L.push("");
  for (const row of q1(`SELECT label, detail FROM v_findings`)) {
    L.push(`- **${row.label}** — ${row.detail}`);
  }
  L.push("");
  L.push("## 抽样（确认数据是真能看的）");
  L.push("");
  for (const [title, sql, cols] of [
    ["物品", "SELECT name, quality, ilvl FROM item_named WHERE quality>=4 ORDER BY ilvl DESC LIMIT 8", ["name", "quality", "ilvl"]],
    ["露营法术", "SELECT name FROM spell_named WHERE name LIKE '%Campfire%' OR name LIKE 'Camp Type%' LIMIT 8", ["name"]],
    ["专业配方", "SELECT spell_name, profession FROM recipe WHERE spell_name IS NOT NULL LIMIT 8", ["spell_name", "profession"]],
  ]) {
    L.push(`**${title}**`);
    L.push("");
    const rows = q1(sql);
    if (!rows.length) { L.push("_（空）_", ""); continue; }
    L.push("| " + cols.join(" | ") + " |");
    L.push("|" + cols.map(() => "---").join("|") + "|");
    for (const r of rows) L.push("| " + cols.map((c) => String(r[c] ?? "").replace(/\|/g, "/")).join(" | ") + " |");
    L.push("");
  }

  return L.join("\n");
}

// ── main ───────────────────────────────────────────────────────
const build = await resolveBuild();
console.error(`build = ${build}`);
const list = ONLY ? TABLES.filter((t) => ONLY.includes(t)) : TABLES;

const results = [];

// ── 基线对比：拉经典服的 CharBaseInfo，用来算"Forever 改了什么" ──
async function fetchBaseline() {
  const dir = resolve(ROOT, "data/baseline");
  const file = resolve(dir, "CharBaseInfo.csv");
  if (!FORCE && existsSync(file) && statSync(file).size > 0) return file;
  const txt = await (await fetch("http://us.patch.battle.net:1119/wow_classic_era/versions")).text();
  const row = txt.split("\n").find((l) => l.startsWith("us|"));
  const v = row ? row.split("|")[5] : "1.15.9.69722";
  const res = await fetch(`https://wago.tools/db2/CharBaseInfo/csv?build=${v}`, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) return null;
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.error(`baseline: classic_era ${v} → ${file}`);
  return file;
}

const baseline = await fetchBaseline();
if (baseline) {
  results.push({ table: "CharBaseInfo_baseline", file: resolve(ROOT, "data/baseline/CharBaseInfo.csv") });
}
for (const t of list) {
  const r = await fetchTable(t, build);
  console.error(`  ${r.file ? (r.cached ? "cached" : `${(r.size / 1024).toFixed(0)}KB`) : `skip (${r.skip})`}  ${t}`);
  results.push(r);
  await new Promise((r) => setTimeout(r, 300)); // 别把 wago.tools 打爆
}

const n = importAll(results, build);
console.error(`imported ${n} tables → ${DB}`);

// ⚠️ 新增派生表后必须加进 SITE_TABLES，否则本地 build 正常（读完整库）
// 但 CI 构建报 'no such table'（只读 site.db）。踩过一次。
// ── 导出瘦身库：站点构建只读它（0.3MB vs 20MB），可以进 git，CI 不依赖网络 ──
const SITE_TABLES = [
  "race_class", "race_class_new", "talent_full", "xp_spell", "xp_curve", "quest_xp",
  "recipe", "recipe_reagent", "reagent_name", "camping_spell", "camp_object", "counts", "meta", "ChrRaces", "ChrClasses", "DungeonEncounter", "Map", "ItemSet",
  "v_change_summary", "v_page_counts", "v_findings", "v_gaps",
];
const siteDb = resolve(ROOT, "data/site.db");
rmSync(siteDb, { force: true });
const dump = execFileSync("sqlite3", [DB, `.dump ${SITE_TABLES.map((t) => `"${t}"`).join(" ")}`], {
  encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
});
execFileSync("sqlite3", [siteDb], { input: dump });
console.error(
  `site.db: ${(statSync(siteDb).size / 1024).toFixed(0)}KB（完整库 ${(statSync(DB).size / 1048576).toFixed(1)}MB）`,
);

const md = report(build, results);
writeFileSync(resolve(ROOT, "out/report.md"), md);
console.error(`\n→ out/report.md`);
