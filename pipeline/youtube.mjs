/**
 * WoW: Forever 知识管线 —— YouTube → 字幕 → 纯文本语料
 *
 * 为什么需要：任务/NPC 数据在服务端拿不到，但**创作者在玩 beta 并把知识讲出来**。
 * 把他们的视频转成文字，就是能落到页面上的知识来源。
 *
 *   export YOUTUBE_API_KEY=...            # 或 source game-name-radar/.env
 *   node pipeline/youtube.mjs             # 全量跑（可中断，已下的会跳过）
 *   node pipeline/youtube.mjs --per=3     # 每个话题抓几个
 *   node pipeline/youtube.mjs --topic=leveling
 *
 * 产出：data/transcripts/<videoId>.txt + data/transcripts/index.json
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = resolve(ROOT, "data/transcripts");
const INDEX = resolve(DIR, "index.json");

const KEY = process.env.YOUTUBE_API_KEY;
if (!KEY) {
  console.error("缺 YOUTUBE_API_KEY。先跑：set -a; source ../game-name-radar/.env; set +a");
  process.exit(1);
}

// 话题 = 计划里 SERP 验证过的查询簇，也是站点支柱
const TOPICS = {
  beginner: "wow forever beginner guide",
  leveling: "wow forever leveling guide",
  classchanges: "wow forever class changes",
  professions: "wow forever professions guide",
  camping: "wow forever camping system",
  legacy: "wow forever legacy system",
  gold: "wow forever gold making",
  dungeons: "wow forever dungeon guide",
  talents: "wow forever talents guide",
  bis: "wow forever bis gear",
  addons: "wow forever addons",
  skyborne: "wow forever skyborne",
  tips: "wow forever tips and tricks",
  mistakes: "wow forever mistakes",
};

const flags = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = true] = a.replace(/^--/, "").split("=");
    return [k, v];
  }),
);
const PER = Number(flags.per) || 5;
// 只看 45 天内的（产品 9-12 官宣，更早的不可能是 Forever 内容）
const AFTER = new Date(Date.now() - 45 * 864e5).toISOString().replace(/\.\d+Z$/, "Z");

const yt = async (path, params) => {
  const u = `https://www.googleapis.com/youtube/v3/${path}?` + new URLSearchParams({ ...params, key: KEY });
  const res = await fetch(u);
  if (!res.ok) throw new Error(`${path} ${res.status}: ${(await res.text()).slice(0, 120)}`);
  return res.json();
};

/** VTT → 纯文本。YouTube 自动字幕是滚动式：每个 cue 会把上一句再抄一遍，
 *  所以只取每个 cue 的**最后一行**，再去掉相邻重复。 */
function vttToText(vtt) {
  const out = [];
  for (const cue of vtt.split(/\n\n+/)) {
    const lines = cue
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.includes("-->") && !/^(WEBVTT|Kind:|Language:)/.test(l) && !/^\d+$/.test(l));
    if (!lines.length) continue;
    const text = lines[lines.length - 1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
    if (text && text !== out[out.length - 1]) out.push(text);
  }
  return out.join(" ").replace(/\s+/g, " ").trim();
}

function loadIndex() {
  if (!existsSync(INDEX)) return { videos: {} };
  try { return JSON.parse(readFileSync(INDEX, "utf8")); } catch { return { videos: {} }; }
}

const index = loadIndex();
mkdirSync(DIR, { recursive: true });

const topics = flags.topic ? { [flags.topic]: TOPICS[flags.topic] } : TOPICS;
if (!Object.keys(topics).some((t) => topics[t])) {
  console.error(`未知话题 ${flags.topic}。可选：${Object.keys(TOPICS).join(", ")}`);
  process.exit(1);
}

let added = 0, skipped = 0, failed = 0;

for (const [name, query] of Object.entries(topics)) {
  if (!query) continue;
  const found = await yt("search", {
    part: "snippet", type: "video", maxResults: String(PER * 2),
    q: query, order: "relevance", publishedAfter: AFTER,
  });

  for (const item of (found.items || []).slice(0, PER)) {
    const id = item.id.videoId;
    if (index.videos[id]?.file && existsSync(resolve(DIR, index.videos[id].file))) { skipped++; continue; }

    // yt-dlp 对第二种字幕语言常常 429 退出码非 0，但第一种已经落盘了。
    // 所以：不看退出码，只看磁盘上有没有 .vtt。
    try {
      execFileSync("yt-dlp", [
        "--skip-download", "--write-auto-subs", "--sub-langs", "en-orig,en", "--sub-format", "vtt",
        "-o", resolve(DIR, "%(id)s.%(ext)s"), `https://www.youtube.com/watch?v=${id}`,
      ], { stdio: "ignore", timeout: 90_000 });
    } catch { /* 退出码非 0 不代表失败，下面看文件 */ }
    const cands = readdirSync(DIR).filter((f) => f.startsWith(id) && f.endsWith(".vtt"));
    const file = cands.find((f) => f.includes("en-orig")) || cands[0] || null;  // en-orig 是原始音轨，质量更好

    if (!file) { failed++; console.error(`  ✗ ${id} ${item.snippet.title.slice(0, 50)}`); continue; }

    const text = vttToText(readFileSync(resolve(DIR, file), "utf8"));
    if (text.length < 500) { failed++; continue; }  // 太短 = 没抓到内容

    const txtName = `${id}.txt`;
    writeFileSync(resolve(DIR, txtName), text);
    index.videos[id] = {
      topic: name, title: item.snippet.title, channel: item.snippet.channelTitle,
      published: item.snippet.publishedAt.slice(0, 10), words: text.split(/\s+/).length, file: txtName,
    };
    added++;
    console.error(`  ✓ [${name}] ${text.split(/\s+/).length} words  ${item.snippet.title.slice(0, 52)}`);
  }
  writeFileSync(INDEX, JSON.stringify(index, null, 1));  // 每话题存一次盘，中断也不丢
}

// ── 报告 ──
const vs = Object.values(index.videos);
const byTopic = {};
for (const v of vs) {
  byTopic[v.topic] ??= { n: 0, words: 0 };
  byTopic[v.topic].n++;
  byTopic[v.topic].words += v.words;
}
const md = [
  `# 语料报告 · ${new Date().toISOString().slice(0, 10)}`,
  "",
  `本次新增 ${added} · 跳过 ${skipped} · 失败 ${failed}`,
  "",
  `**总计 ${vs.length} 个视频 / ${vs.reduce((a, v) => a + v.words, 0).toLocaleString()} 词**`,
  "",
  "| 话题 | 视频 | 词数 |",
  "|---|---|---|",
  ...Object.entries(byTopic).sort((a, b) => b[1].words - a[1].words)
    .map(([k, v]) => `| ${k} | ${v.n} | ${v.words.toLocaleString()} |`),
  "",
  "## 频道分布（谁在深耕这块）",
  "",
  ...Object.entries(vs.reduce((a, v) => ((a[v.channel] = (a[v.channel] || 0) + 1), a), {}))
    .sort((a, b) => b[1] - a[1]).slice(0, 12)
    .map(([c, n]) => `- ${c} — ${n} 个`),
].join("\n");

writeFileSync(resolve(ROOT, "out/corpus.md"), md);
console.error(`\n→ data/transcripts/ (${vs.length} videos) · out/corpus.md`);
