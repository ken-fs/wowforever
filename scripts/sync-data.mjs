#!/usr/bin/env node
// autopilot 的确定性数据同步：重跑客户端管线，挡住空表、空名字和异常缩水。
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DB = resolve(ROOT, "data/site.db");
const TABLES = {
  race_class: "race IS NULL OR class IS NULL",
  talent_node: "class IS NULL OR name IS NULL",
  spellbook: "class IS NULL OR name IS NULL",
  recipe: "profession IS NULL OR spell_name IS NULL",
  mount: "name IS NULL",
  xp_curve: "level IS NULL OR xp IS NULL",
  xp_source: "name IS NULL",
  Map: null,
  DungeonEncounter: null,
};

function query(db, sql) {
  const out = execFileSync("sqlite3", ["-readonly", "-json", db, sql], { encoding: "utf8" }).trim();
  return out ? JSON.parse(out) : [];
}

function snapshot(db) {
  if (!existsSync(db)) return null;
  const build = query(db, "SELECT value FROM meta WHERE key='build'")[0]?.value ?? null;
  const tables = Object.fromEntries(Object.keys(TABLES).map((table) => {
    const row = query(db, `SELECT COUNT(*) AS n FROM "${table}"`)[0];
    const emptyNames = TABLES[table] ? query(db, `SELECT COUNT(*) AS n FROM "${table}" WHERE ${TABLES[table]}`)[0].n : 0;
    return [table, { count: Number(row.n), emptyNames: Number(emptyNames) }];
  }));
  return { build, tables };
}

export function validate(before, after) {
  if (!after?.build) return ["新数据库没有 build 号"];
  const problems = [];
  for (const [table, now] of Object.entries(after.tables)) {
    if (!now.count) problems.push(`${table} 是空表`);
    if (now.emptyNames) problems.push(`${table} 有 ${now.emptyNames} 行关键名称为空`);
    const old = before?.tables?.[table]?.count;
    if (old && now.count < old * 0.8) problems.push(`${table} 从 ${old} 行缩到 ${now.count} 行（超过 20%）`);
  }
  if (after.tables.xp_curve.count !== 60) problems.push(`xp_curve 应有 60 行，实际 ${after.tables.xp_curve.count}`);
  return problems;
}

if (process.argv.includes("--self-test")) {
  const good = { build: "1.60.1.70532", tables: Object.fromEntries(Object.keys(TABLES).map((t) => [t, { count: t === "xp_curve" ? 60 : 100, emptyNames: 0 }])) };
  assert.deepEqual(validate(good, good), []);
  const shrunk = structuredClone(good);
  shrunk.tables.recipe.count = 79;
  assert.match(validate(good, shrunk).join("\n"), /recipe.*超过 20%/);
  const empty = structuredClone(good);
  empty.tables.mount.emptyNames = 1;
  assert.match(validate(good, empty).join("\n"), /mount.*名称为空/);
  console.log("sync-data self-test ✓");
} else {
  const before = snapshot(DB);
  execFileSync("npm", ["run", "data"], { cwd: ROOT, stdio: "inherit" });
  const after = snapshot(DB);
  const problems = validate(before, after);
  if (problems.length) throw new Error(`数据校验没过：\n- ${problems.join("\n- ")}`);
  console.log(`SYNC_BUILD=${before?.build ?? "unknown"}→${after.build}`);
  console.log(`SYNC_CHANGES=${Object.entries(after.tables).map(([table, now]) => {
    const old = before?.tables?.[table]?.count ?? now.count;
    return `${table} ${old}→${now.count}`;
  }).join("；")}`);
}
