/**
 * 构建期读 SQLite。跑 `node pipeline/build.mjs` 生成 data/wow-forever.db 后才有数据。
 * 用 Node 内置的 node:sqlite —— 零依赖。
 */
import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

// 用 cwd 而不是 import.meta.url —— Astro 会把本模块打包到 dist/.prerender/，
// 那时 import.meta.url 指向 dist 而不是 src，路径就错了。
const ROOT = process.cwd();
// 默认读瘦身库（0.3MB，可入 git，CI 构建不依赖网络）；
// 要看全量数据：WOW_DB=data/wow-forever.db npm run build
const DB_PATH =
  process.env.WOW_DB ??
  resolve(ROOT, existsSync(resolve(ROOT, "data/site.db")) ? "data/site.db" : "data/wow-forever.db");

if (!existsSync(DB_PATH)) {
  throw new Error(`找不到 ${DB_PATH}\n先跑：npm run data`);
}

const db = new DatabaseSync(DB_PATH, { readOnly: true });

/** 查多行 */
export function all(sql, ...params) {
  return db.prepare(sql).all(...params);
}

/** 查一行 */
export function one(sql, ...params) {
  return db.prepare(sql).get(...params) ?? null;
}

/** 查单值 */
export function val(sql, ...params) {
  const row = db.prepare(sql).get(...params);
  return row ? Object.values(row)[0] : null;
}

/** slug：名字 → url 片段 */
export const slug = (s) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** 预计算计数，值来自 derive.sql 的 counts 表 */
export function count(key: string): number {
  return Number(val(`SELECT value FROM counts WHERE key = ?`, key) ?? 0);
}

export const QUALITY = {
  0: "Poor", 1: "Common", 2: "Uncommon", 3: "Rare",
  4: "Epic", 5: "Legendary", 6: "Artifact", 7: "Heirloom",
};
