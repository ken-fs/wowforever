/**
 * xp_source：客户端里所有改经验的东西，给 /tools/xp-calculator/ 用。
 *
 * 按光环类型认：200 = 全部经验 %，291 = 任务经验 %，447 = 打某类怪的经验 %。
 * 再加上休息经验相关的（营地帐篷、Well Rested）—— 它们不带 XP 光环，靠说明文字认。
 *
 * 不猜：数值指向客户端里没有的法术（Well-Rested 的 $429959s0）就标 readable=0；
 * 说明里写着 Season of Mastery 的是旧赛季遗留，标出来，别当成 Forever 的现行加成。
 */
import { DatabaseSync } from "node:sqlite";
import { makeResolver } from "./tooltip.mjs";

export function deriveXp({ foreverDb }) {
  const F = makeResolver(foreverDb);
  const w = new DatabaseSync(foreverDb);

  const rows = w.prepare(
    `SELECT CAST(s.ID AS INT) id, sn.Name_lang name, s.Description_lang descr, s.AuraDescription_lang aura,
            group_concat(CAST(e.EffectAura AS INT) || ':' || CAST(e.EffectBasePointsF AS REAL)) effects
       FROM Spell s
       JOIN SpellName sn ON CAST(sn.ID AS INT) = CAST(s.ID AS INT)
       JOIN SpellEffect e ON CAST(e.SpellID AS INT) = CAST(s.ID AS INT)
      WHERE sn.Name_lang NOT LIKE '%DNT%'
        AND (CAST(s.ID AS INT) IN (SELECT CAST(SpellID AS INT) FROM SpellEffect
                                    WHERE CAST(EffectAura AS INT) IN (200, 291, 447)
                                      AND CAST(EffectBasePointsF AS REAL) > 0)
             OR s.Description_lang LIKE '%rested experience%'
             OR s.AuraDescription_lang LIKE '%rested experience%')
      GROUP BY s.ID`,
  ).all();

  const out = [];
  const seen = new Set();
  for (const r of rows) {
    const eff = Object.fromEntries(String(r.effects).split(",").map((p) => p.split(":").map(Number)));
    // 说明里常带条件分支（Well Fed 的 $?pc142418[...]），解不开就退到 buff 栏那行
    let desc = F.resolve(r.id);
    if (!desc.ok || !desc.text) {
      const a = F.resolve(r.id, 1, "aura");
      if (a.ok && a.text) desc = a;
    }
    // Discoverer's Delight 的「任务金币 +$w3%」在数据里是 0 —— 真值不在客户端，这半句删掉不显示
    const text = desc.text.replace(/,?\s*and [^.,]* by 0%/g, "");
    const selfRef = new RegExp(`\\$${r.id}s`).test(`${r.descr ?? ""} ${r.aura ?? ""}`);
    let kind, pct = null;
    if (eff[447]) { kind = "creature"; pct = eff[447]; }
    else if (eff[200] && /from kills/i.test(`${r.descr} ${r.aura}`)) { kind = "kills"; pct = eff[200]; }
    else if (eff[200]) { kind = "all"; pct = eff[200]; }
    else if (eff[291]) { kind = "quests"; pct = eff[291]; }
    else if (/rested experience/i.test(`${r.descr} ${r.aura}`)) kind = "rested";
    else continue;
    // 空说明的辅助法术（Boosted Rest 冷却 / 帐篷触发器）不单独列
    if (kind === "rested" && !desc.text) continue;
    // 同名多个法术 id 发的是同一个 buff（文字一样）就留一个；Camp Tent 两个 id 文字不同，都留
    if (seen.has(`${r.name}|${text}`)) continue;
    seen.add(`${r.name}|${text}`);
    out.push({
      spell_id: r.id, name: r.name, kind, pct,
      text: desc.ok && !selfRef ? text : (r.aura || r.descr || "").replace(/\$\S+/g, "?"),
      readable: desc.ok && !selfRef ? 1 : 0,
      cn_only: /\(CN Only\)/i.test(`${r.descr} ${r.aura}`) ? 1 : 0,
      season_of_mastery: /Season of Mastery/i.test(r.aura ?? "") ? 1 : 0,
    });
  }

  w.exec(`DROP TABLE IF EXISTS xp_source`);
  w.exec(`CREATE TABLE xp_source (spell_id INT, name TEXT, kind TEXT, pct REAL, text TEXT,
          readable INT, cn_only INT, season_of_mastery INT)`);
  const ins = w.prepare(`INSERT INTO xp_source VALUES (?,?,?,?,?,?,?,?)`);
  for (const o of out) ins.run(o.spell_id, o.name, o.kind, o.pct, o.text, o.readable, o.cn_only, o.season_of_mastery);
  w.close();
  return out.length;
}
