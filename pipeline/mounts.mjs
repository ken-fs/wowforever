/**
 * mount：Forever 客户端里的全部坐骑物品，和 Classic Era 同名物品比等级与商人价格。
 *
 * 认坐骑：Forever 是 Item.ClassID=15 / SubclassID=5（Mount）。
 * ⚠️ Classic Era 客户端里同样这些坐骑是 SubclassID=0（Junk），所以 Classic 侧按名字对，不按分类。
 * 价格 = ItemSparse.BuyPrice（铜），商人原价，不含声望折扣。骑术训练费在服务器上，客户端没有。
 * 2026-10-09 实测：40 级普通坐骑 80g → 20g，60 级快速坐骑 1000g → 200g，等级要求没变。
 */
import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";

// 名字里的关键词 → 坐骑种类（客户端的 RequiredSkill 在 Forever 里是 0，认不出来）
const FAMILY = [
  [/galestrider/i, "Galestrider"],
  [/kodo/i, "Kodo"],
  [/wolf|howler/i, "Wolf"],
  [/\bram\b/i, "Ram"],
  [/mechanostrider|battlestrider/i, "Mechanostrider"],
  [/raptor/i, "Raptor"],
  [/saber|tiger|leopard|prideclaw|sabercat/i, "Cat"],
  [/skeletal|deathcharger/i, "Undead horse"],
  [/stormpike/i, "Ram"],
  [/stallion|steed|bridle|mare|pinto|palomino|horse|charger/i, "Horse"],
  [/qiraji/i, "Qiraji"],
  [/bear/i, "Bear"],
];

export function deriveMounts({ foreverDb, classicDb }) {
  const w = new DatabaseSync(foreverDb);
  const rows = w.prepare(
    `SELECT CAST(s.ID AS INT) id, s.Display_lang name, CAST(s.RequiredLevel AS INT) level,
            CAST(s.BuyPrice AS INT) price, CAST(s.OverallQualityID AS INT) quality
       FROM Item i JOIN ItemSparse s ON CAST(s.ID AS INT) = CAST(i.ID AS INT)
      WHERE CAST(i.ClassID AS INT) = 15 AND CAST(i.SubclassID AS INT) = 5
        AND s.Display_lang NOT LIKE '%DNT%' AND s.Display_lang NOT LIKE '%[PH]%'`,
  ).all();

  // Classic 同名物品：同名可能有多条（Golden Sabercat 两条），取最便宜的那条
  const classic = new Map();
  if (classicDb && existsSync(classicDb)) {
    const c = new DatabaseSync(classicDb, { readOnly: true });
    const q = c.prepare(
      `SELECT CAST(RequiredLevel AS INT) level, CAST(BuyPrice AS INT) price FROM ItemSparse
        WHERE Display_lang = ? ORDER BY CASE WHEN CAST(BuyPrice AS INT) > 0 THEN 0 ELSE 1 END, CAST(BuyPrice AS INT)`,
    );
    for (const r of rows) {
      const hit = q.get(r.name);
      if (hit) classic.set(r.name, hit);
    }
    c.close();
  }

  const seen = new Set();
  const out = [];
  for (const r of rows) {
    if (seen.has(r.name)) continue;
    seen.add(r.name);
    const c = classic.get(r.name);
    out.push({
      item_id: r.id, name: r.name, level: r.level, price: r.price, quality: r.quality,
      family: FAMILY.find(([re]) => re.test(r.name))?.[1] ?? "Other",
      in_classic: classicDb ? (c ? 1 : 0) : null,
      classic_level: c?.level ?? null, classic_price: c?.price ?? null,
    });
  }

  w.exec(`DROP TABLE IF EXISTS mount`);
  w.exec(`CREATE TABLE mount (item_id INT, name TEXT, level INT, price INT, quality INT, family TEXT,
          in_classic INT, classic_level INT, classic_price INT)`);
  const ins = w.prepare(`INSERT INTO mount VALUES (?,?,?,?,?,?,?,?,?)`);
  for (const o of out) ins.run(o.item_id, o.name, o.level, o.price, o.quality, o.family, o.in_classic, o.classic_level, o.classic_price);
  w.close();
  return out.length;
}
