/**
 * 天赋图标：fdid → wago.tools 拿文件名 → 暴雪官方渲染 CDN 的 56px JPEG → public/icons/talents/。
 * 和 assets.mjs 的游戏图标同一条路（不用 Wowhead 的图，见 OPS.md「美术素材」）。
 *
 * 文件名缓存在 data/baseline/icon-names.json（fdid → 名字），图片已在就不重下，
 * 所以只有第一次跑慢（466 个天赋约 300 个不同图标）。拉不到的图标页面上显示首字母兜底。
 */
import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const UA = "Mozilla/5.0";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fetchTalentIcons({ foreverDb, root }) {
  const cacheFile = resolve(root, "data/baseline/icon-names.json");
  const outDir = resolve(root, "public/icons/talents");
  mkdirSync(outDir, { recursive: true });
  const cache = existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, "utf8")) : {};

  const w = new DatabaseSync(foreverDb);
  const fdids = w.prepare(`SELECT DISTINCT icon_fdid FROM talent_node WHERE icon_fdid IS NOT NULL`).all().map((r) => r.icon_fdid);
  let fetched = 0, failed = 0;
  for (const fdid of fdids) {
    if (!(fdid in cache)) {
      try {
        const info = await (await fetch(`https://wago.tools/api/info/${fdid}`, { headers: { "User-Agent": UA } })).json();
        cache[fdid] = (info.filename || "").split("/").pop().replace(/\.blp$/i, "").toLowerCase() || null;
      } catch { cache[fdid] = null; }
      await sleep(120);
    }
    const name = cache[fdid];
    if (!name) { failed++; continue; }
    const dest = resolve(outDir, `${name}.jpg`);
    if (existsSync(dest)) continue;
    try {
      const res = await fetch(`https://render.worldofwarcraft.com/us/icons/56/${name}.jpg`, { headers: { "User-Agent": UA } });
      const buf = Buffer.from(await res.arrayBuffer());
      // 只收真 JPEG（FF D8），别把错误页存成图
      if (res.ok && buf[0] === 0xff && buf[1] === 0xd8) { writeFileSync(dest, buf); fetched++; }
      else { failed++; cache[fdid] = cache[fdid]; }
    } catch { failed++; }
    await sleep(120);
  }
  writeFileSync(cacheFile, JSON.stringify(cache, null, 0));

  // 只给真有图片文件的天赋写 icon，页面就不会引用到不存在的图
  const upd = w.prepare(`UPDATE talent_node SET icon = ? WHERE icon_fdid = ?`);
  w.exec("BEGIN");
  for (const fdid of fdids) {
    const name = cache[fdid];
    upd.run(name && existsSync(resolve(outDir, `${name}.jpg`)) ? name : null, fdid);
  }
  w.exec("COMMIT");
  const missing = w.prepare(`SELECT COUNT(*) n FROM talent_node WHERE icon IS NULL`).get().n;
  w.close();
  return { icons: fdids.length, fetched, failed, talentsWithoutIcon: missing };
}
