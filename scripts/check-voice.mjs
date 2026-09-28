/**
 * check-voice.mjs —— 量一下攻略的「AI 味」。
 *
 * 为什么需要：DESIGN-RULES 要求「口语化，像朋友聊天」「每句话不超过 15 个字」，
 * 但靠肉眼读很容易自己骗自己 —— 写完觉得挺顺，一量平均句长 20 词。
 *
 *   node scripts/check-voice.mjs               # 全部
 *   node scripts/check-voice.mjs camping.md    # 单篇
 *
 * 只看**散文段落**，跳过列表、表格、标题 —— 那些本来就该短，算进去会稀释指标。
 */
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../src/content/guides");
const only = process.argv[2];

/** 阈值：超过就该改了 */
const LIMITS = { avg: 15, long: 30, dashes: 0, worth: 0, meta: 0, passive: 0 };

function prose(md) {
  const body = md.split(/^---$/m).slice(2).join("---"); // 去掉 frontmatter
  const out = [];
  for (const para of body.split(/\n\s*\n/)) {
    const p = para.trim();
    if (!p) continue;
    if (/^(#|[-*|>]|\d+[.)]|\|)/.test(p)) continue; // 标题/列表/表格/引用
    if (p.includes("|")) continue;                    // 表格行
    out.push(p.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")); // 链接只留文字
  }
  return out.join(" ");
}

function measure(md) {
  const text = prose(md);
  const sents = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.split(/\s+/).length > 2);
  const words = sents.map((s) => s.split(/\s+/).length);
  const avg = words.length ? words.reduce((a, b) => a + b, 0) / words.length : 0;
  return {
    sents: sents.length,
    avg,
    long: words.filter((w) => w > LIMITS.long).length,
    dashes: (text.match(/—[^—]{4,40}—/g) || []).length,     // 破折号夹注
    worth: (text.match(/\bworth \w+ing\b/gi) || []).length,  // "worth knowing"
    meta: (text.match(/\b(?:most|many) (?:guides|players|people|sites)\b/gi) || []).length, // 元话
    passive: (text.match(/\b(?:is|are|was|were|be) \w+ed\b/gi) || []).length,
    extras: (text.match(/\b(?:it's worth noting|that said|moreover|furthermore|importantly|the key (?:thing|point) is)\b/gi) || []).length,
  };
}

const files = (only ? [only] : readdirSync(DIR).filter((f) => f.endsWith(".md"))).sort();
const rows = [];

for (const f of files) {
  const md = readFileSync(resolve(DIR, f), "utf8");
  const m = measure(md);
  const bad =
    (m.avg > LIMITS.avg ? 1 : 0) + (m.long > LIMITS.long ? 1 : 0) + (m.dashes > LIMITS.dashes ? 1 : 0) +
    (m.worth > LIMITS.worth ? 1 : 0) + (m.meta > LIMITS.meta ? 1 : 0) + (m.passive > LIMITS.passive ? 1 : 0) +
    (m.extras > LIMITS.extras ? 1 : 0);
  rows.push({ name: f.replace(".md", ""), ...m, bad });
}

const h = (s, n) => s.padStart(n);
console.log(
  `  ${"guide".padEnd(20)}${h("sents", 6)}${h("avg", 7)}${h(">30", 6)}${h("dash", 6)}${h("worth", 7)}${h("meta", 6)}${h("passive", 8)}${h("cliche", 7)}`,
);
console.log("  " + "─".repeat(76));
for (const r of rows.sort((a, b) => b.avg - a.avg)) {
  const mark = r.bad === 0 ? "✅" : r.bad >= 3 ? "❌" : "⚠️";
  console.log(
    `  ${mark} ${r.name.padEnd(18)} ${String(r.sents).padStart(5)} ${r.avg.toFixed(1).padStart(7)}` +
    ` ${String(r.long).padStart(6)} ${String(r.dashes).padStart(5)} ${String(r.worth).padStart(6)}` +
    ` ${String(r.meta).padStart(5)} ${String(r.passive).padStart(5)} ${String(r.extras).padStart(5)}`,
  );
}
const bad = rows.filter((r) => r.bad > 0).length;
console.log(`\n  ${rows.length - bad}/${rows.length} 达标（平均句长 ≤ ${LIMITS.avg} 词，其余为 0）`);
process.exit(bad ? 1 : 0);
