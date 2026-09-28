/**
 * 把整站 URL 推给 IndexNow（Bing / Yandex / Naver / Seznam 用它即时收录）。
 * Google 不参与 —— 这只是 Bing 侧的加速器。
 *
 *   node scripts/submit-indexnow.mjs            # 读 dist/ 里的 sitemap
 *   node scripts/submit-indexnow.mjs --live     # 读线上 sitemap
 *
 * 所有权靠 /<key>.txt 验证：IndexNow 会去抓那个文件。
 * key 存在仓库的 .indexnow-key，public/<key>.txt 是它的公开副本。
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "wowforever.one";
const KEY = readFileSync(resolve(ROOT, ".indexnow-key"), "utf8").trim();
const live = process.argv.includes("--live");

async function urls() {
  const src = live
    ? `https://${HOST}/sitemap-0.xml`
    : resolve(ROOT, "dist/sitemap-0.xml");
  if (!live && !existsSync(src)) throw new Error("dist/sitemap-0.xml 不存在，先 npm run build");
  const xml = live ? await (await fetch(src)).text() : readFileSync(src, "utf8");
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
}

const list = await urls();
const body = {
  host: HOST,
  key: KEY,
  keyLocation: `https://${HOST}/${KEY}.txt`,
  urlList: list,
};

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

// IndexNow 成功时返回 200 或 202（202 = 已接受但 key 还没验证完）
const ok = res.status === 200 || res.status === 202;
console.log(`${ok ? "✅" : "❌"} 提交 ${list.length} 个 URL → HTTP ${res.status}`);
if (!ok) console.log((await res.text()).slice(0, 400));
