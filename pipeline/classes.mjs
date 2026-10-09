/**
 * 职业派生表：天赋树（Forever vs Classic）+ 技能书。build.mjs 灌完库之后调用。
 *
 *   talent_node     Forever 每个天赋：位置 / 等级数 / 每级文字 / 和 Classic 比改了什么
 *   talent_removed  Classic 有、Forever 没了的天赋
 *   spellbook       每个职业训练师能学的技能，按等级
 *
 * ⚠️ Forever 的天赋不在 Talent 表里。Talent / TalentTab（432 行）是 Classic 留下的旧布局，
 *    真树在 Trait 系统：TraitNode（位置）→ TraitNodeXTraitNodeEntry → TraitNodeEntry（MaxRanks）
 *    → TraitDefinition（SpellID）。9 棵职业树各 50–54 个节点，每棵横向排 3 个专精。
 *    2026-10-09 实测：469 个节点里 468 个的名字和等级数与 talentsforever.com 一致。
 *
 * ⚠️ 每级文字为什么借 talentsforever 的导出（CC BY 4.0）：Forever 的天赋法术有的存「每级值」
 *    （Toughness 2 → 2/4/6/8/10%），有的存「满级值」（Burning Soul 70 → 23/47/70%），
 *    文件里看不出是哪种。只靠客户端解析，满级文字只有 277/468 对得上；他们逐级进游戏核对过。
 *    布局、等级数、和 Classic 的比较仍然是我们自己从两个客户端算的。页面上要署名 + 链接。
 */
import { DatabaseSync } from "node:sqlite";
import { existsSync, readFileSync } from "node:fs";
import { makeResolver } from "./tooltip.mjs";

// ChrClasses.ID → SpellClassOptions.SpellClassSet（法术族），用来认出哪棵 Trait 树是哪个职业
const CLASS_SET = { 1: 4, 2: 10, 3: 9, 4: 8, 5: 6, 7: 11, 8: 3, 9: 5, 11: 7 };

// 比较前把时长统一成秒：Classic 写 "120 sec"，Forever 写 "2 min"，是同一个数
const toSec = (s) => String(s ?? "")
  .replace(/(\d+(?:\.\d+)?)\s*(?:hrs?|hours?)\b/gi, (_, n) => `${n * 3600} sec`)
  .replace(/(\d+(?:\.\d+)?)\s*min\b/gi, (_, n) => `${n * 60} sec`);
const norm = (s) => toSec(s).toLowerCase().replace(/[.,;:]/g, "").replace(/\s+/g, " ").trim();
const nums = (s) => (toSec(s).match(/\d+(\.\d+)?/g) ?? []).map(Number).join(",");

export function deriveClasses({ foreverDb, classicDb, classicBuild, tfPath }) {
  const F = makeResolver(foreverDb);
  const C = classicDb && existsSync(classicDb) ? makeResolver(classicDb, { classic: true }) : null;
  const tf = tfPath && existsSync(tfPath) ? JSON.parse(readFileSync(tfPath, "utf8")) : null;
  const w = new DatabaseSync(foreverDb);

  const classes = w.prepare(`SELECT CAST(ID AS INT) id, Name_lang name FROM ChrClasses`).all();
  const className = Object.fromEntries(classes.map((c) => [c.id, c.name]));

  // ── Classic 天赋（旧 Talent 表 + Classic 客户端的法术文字）────────────────
  const classic = {}; // class → name → row
  if (C) {
    const rows = C.db.prepare(
      `SELECT CAST(tt.ClassMask AS INT) mask, tt.Name_lang tab, CAST(tt.OrderIndex AS INT) ord,
              CAST(t.TierID AS INT) tier, CAST(t.ColumnIndex AS INT) col, sn.Name_lang name,
              t.SpellRank_0 r0, t.SpellRank_1 r1, t.SpellRank_2 r2, t.SpellRank_3 r3, t.SpellRank_4 r4
         FROM Talent t
         JOIN TalentTab tt ON CAST(tt.ID AS INT) = CAST(t.TabID AS INT)
         JOIN SpellName sn ON CAST(sn.ID AS INT) = CAST(t.SpellRank_0 AS INT)`,
    ).all();
    for (const r of rows) {
      const cid = Object.keys(className).find((id) => r.mask & (1 << (id - 1)));
      if (!cid) continue;
      const ranks = [r.r0, r.r1, r.r2, r.r3, r.r4].map(Number).filter((x) => x > 0);
      const last = C.resolve(ranks.at(-1));
      (classic[className[cid]] ??= {})[r.name] = {
        name: r.name, spec: r.tab, ord: r.ord, row: r.tier + 1, col: r.col + 1, max: ranks.length,
        text: last.text, ok: last.ok, spells: ranks,
      };
    }
  }

  // ── Forever 天赋（Trait 树）────────────────────────────────────────────
  const nodes = w.prepare(
    `SELECT CAST(n.TraitTreeID AS INT) tree, CAST(n.PosX AS INT) x, CAST(n.PosY AS INT) y,
            CAST(e.MaxRanks AS INT) max, CAST(d.SpellID AS INT) spell, sn.Name_lang name,
            CAST(sco.SpellClassSet AS INT) cset
       FROM TraitNode n
       JOIN TraitNodeXTraitNodeEntry nx ON CAST(nx.TraitNodeID AS INT) = CAST(n.ID AS INT)
       JOIN TraitNodeEntry e ON CAST(e.ID AS INT) = CAST(nx.TraitNodeEntryID AS INT)
       JOIN TraitDefinition d ON CAST(d.ID AS INT) = CAST(e.TraitDefinitionID AS INT)
       JOIN SpellName sn ON CAST(sn.ID AS INT) = CAST(d.SpellID AS INT)
       LEFT JOIN SpellClassOptions sco ON CAST(sco.SpellID AS INT) = CAST(d.SpellID AS INT)`,
  ).all();

  // 树 → 职业：树里法术族的众数（Legacy 树没有法术族，自然落选）
  const treeVotes = {};
  for (const n of nodes) if (n.cset) (treeVotes[n.tree] ??= {})[n.cset] = (treeVotes[n.tree]?.[n.cset] ?? 0) + 1;
  const treeClass = {};
  for (const [tree, votes] of Object.entries(treeVotes)) {
    const [cset, cnt] = Object.entries(votes).sort((a, b) => b[1] - a[1])[0];
    const cid = Object.keys(CLASS_SET).find((id) => CLASS_SET[id] === Number(cset));
    // 少于 40 个节点的是别的系统（符文 / 职业小树），不是天赋树
    const total = nodes.filter((n) => n.tree === Number(tree)).length;
    if (cid && total >= 40 && cnt >= total / 2) treeClass[tree] = className[cid];
  }

  const tfTalents = {};
  if (tf) for (const [cls, v] of Object.entries(tf.talents ?? {}))
    for (const tr of v.trees) for (const t of tr.talents) tfTalents[`${cls}|${t.name}`] = { ...t, tree: tr.name };

  // 每棵树横向三块，每块 4 列、列距 600；行距 600、从 y=2130 起。
  // 树外的坐标（x>20000 / y>9000）是隐藏节点，不进页面。
  const out = [];
  for (const [tree, cls] of Object.entries(treeClass)) {
    const own = nodes.filter((n) => n.tree === Number(tree) && n.x < 20000 && n.y < 9000);
    const band = (x) => (x < 4000 ? 0 : x < 8000 ? 1 : 2);
    const bandBase = [0, 1, 2].map((b) => Math.min(...own.filter((n) => band(n.x) === b).map((n) => n.x)));
    // 专精名：这一块里的天赋在 Classic 属于哪一系（众数）
    const bandName = [0, 1, 2].map((b) => {
      const v = {};
      for (const n of own.filter((n) => band(n.x) === b)) {
        const c = classic[cls]?.[n.name] ?? (tfTalents[`${cls}|${n.name}`] && { spec: tfTalents[`${cls}|${n.name}`].tree });
        if (c?.spec) v[c.spec] = (v[c.spec] ?? 0) + 1;
      }
      return Object.entries(v).sort((a, b) => b[1] - a[1])[0]?.[0] ?? `Tree ${b + 1}`;
    });
    for (const n of own) {
      const b = band(n.x);
      const row = Math.round((n.y - 2130) / 600) + 1;
      const col = Math.round((n.x - bandBase[b]) / 600) + 1;
      const t = tfTalents[`${cls}|${n.name}`];
      let ranks, source;
      if (t && t.max === n.max && t.desc?.length === n.max) { ranks = t.desc; source = "talentsforever"; }
      else {
        const r = F.resolve(n.spell);
        ranks = r.ok ? [r.text] : [];
        source = "client";
      }
      // 改了名的天赋（Predatory Instincts → Natural Instinct）名字对不上，按法术 id 兜底
      const c = classic[cls]?.[n.name]
        ?? Object.values(classic[cls] ?? {}).find((x) => x.spells.includes(n.spell));
      let status = "new", moved = 0, numbersChanged = 0, ranksChanged = 0;
      if (c) {
        moved = c.spec !== bandName[b] || c.row !== row || c.col !== col ? 1 : 0;
        ranksChanged = c.max !== n.max ? 1 : 0;
        const textChanged = c.ok && ranks.length && norm(c.text) !== norm(ranks.at(-1)) ? 1 : 0;
        numbersChanged = c.ok && ranks.length && nums(c.text) !== nums(ranks.at(-1)) ? 1 : 0;
        const renamed = c.name !== n.name ? 1 : 0;
        status = textChanged || ranksChanged || renamed ? "changed" : moved ? "moved" : "same";
      }
      // 两边都读客户端，判定仍有约 10% 不同（2026-10-09：421/466 一致）。分歧多在前置条件
      // 和我们解不出 Classic 文字的天赋 —— 那些他们进游戏看过，所以有他们的判定就用他们的。
      const tfStatus = t?.classic?.status ?? (t ? "new" : null);
      const statusSource = tfStatus && tfStatus !== status ? "talentsforever" : "client";
      if (tfStatus) status = tfStatus;
      // 判成「新」的就不再挂 Classic 那条（Arcane Geometry 复用了 Magic Attunement 的法术 id，
      // 但效果完全不同 —— 挂上会让 Magic Attunement 从「已删除」里消失）
      const cl = status === "new" ? null : c;
      out.push({
        class: cls, spec: bandName[b], spec_order: b, row, col, name: n.name, spell_id: n.spell,
        max_ranks: n.max, ranks: JSON.stringify(ranks), text_source: source, status,
        moved: cl ? moved : 0, ranks_changed: cl ? ranksChanged : 0, numbers_changed: cl ? numbersChanged : 0,
        classic_spec: cl?.spec ?? null, classic_row: cl?.row ?? null, classic_col: cl?.col ?? null,
        classic_max: cl?.max ?? null, classic_text: cl?.ok ? cl.text : null,
        classic_name: cl && cl.name !== n.name ? cl.name : (cl ? t?.classic?.renamed ?? null : null),
        status_source: statusSource,
        // 前置条件变化 / 取代了哪些旧天赋：只有他们的导出里有（我们没解 TraitEdge 的方向）
        note: t?.classic?.note ?? null,
        replaces: t?.classic?.replaces?.join(", ") ?? null,
      });
    }
  }

  const removed = [];
  for (const [cls, list] of Object.entries(classic)) {
    const have = new Set(out.filter((o) => o.class === cls).flatMap((o) => [o.name, o.classic_name]));
    for (const [name, c] of Object.entries(list)) {
      if (!have.has(name)) removed.push({ class: cls, spec: c.spec, name, classic_max: c.max, classic_row: c.row, classic_text: c.ok ? c.text : null });
    }
  }

  // ── 技能书：训练师技能（SkillLine 类别 7 = 职业技能线，去掉宠物线）────────
  const book = w.prepare(
    `SELECT CAST(sla.ClassMask AS INT) mask, sl.DisplayName_lang school, sn.Name_lang name,
            COALESCE(sp.NameSubtext_lang, '') rank, CAST(lv.BaseLevel AS INT) level,
            CAST(sla.Spell AS INT) spell, CAST(sla.AcquireMethod AS INT) acq
       FROM SkillLineAbility sla
       JOIN SkillLine sl ON CAST(sl.ID AS INT) = CAST(sla.SkillLine AS INT)
       JOIN SpellName sn ON CAST(sn.ID AS INT) = CAST(sla.Spell AS INT)
       JOIN Spell sp ON CAST(sp.ID AS INT) = CAST(sla.Spell AS INT)
       LEFT JOIN SpellLevels lv ON CAST(lv.SpellID AS INT) = CAST(sla.Spell AS INT) AND CAST(lv.DifficultyID AS INT) = 0
      WHERE CAST(sl.CategoryID AS INT) = 7 AND sl.DisplayName_lang NOT LIKE 'Pet - %'
        AND CAST(sla.ClassMask AS INT) != 0`,
  ).all();
  const classicBook = {};
  if (C) {
    for (const r of C.db.prepare(
      `SELECT CAST(sla.ClassMask AS INT) mask, sn.Name_lang name, COALESCE(sp.NameSubtext_lang,'') rank,
              CAST(lv.BaseLevel AS INT) level, CAST(sla.Spell AS INT) spell
         FROM SkillLineAbility sla
         JOIN SkillLine sl ON CAST(sl.ID AS INT) = CAST(sla.SkillLine AS INT)
         JOIN SpellName sn ON CAST(sn.ID AS INT) = CAST(sla.Spell AS INT)
         JOIN Spell sp ON CAST(sp.ID AS INT) = CAST(sla.Spell AS INT)
         LEFT JOIN SpellLevels lv ON CAST(lv.SpellID AS INT) = CAST(sla.Spell AS INT) AND CAST(lv.DifficultyID AS INT) = 0
        WHERE CAST(sl.CategoryID AS INT) = 7 AND CAST(sla.ClassMask AS INT) != 0`,
    ).all()) {
      for (const id of Object.keys(className)) if (r.mask & (1 << (id - 1))) {
        classicBook[`${className[id]}|${r.name}|${r.rank}`] = r;
      }
    }
  }
  // 先按客户端列一遍：每个职业技能线上、有学习等级的法术
  const mine = new Map();
  for (const r of book) {
    if (!r.level) continue;
    for (const id of Object.keys(className)) {
      if (!(r.mask & (1 << (id - 1)))) continue;
      const key = `${className[id]}|${r.name}|${r.rank}`;
      if (!mine.has(key)) mine.set(key, { ...r, cls: className[id] });
    }
  }
  const classicOf = (key, level, text) => {
    if (!C) return { status: null, level: null };
    const cb = classicBook[key];
    if (!cb) return { status: "new", level: null };
    const cd = C.resolve(cb.spell);
    return {
      status: cb.level !== level ? "level" : text && cd.ok && nums(cd.text) !== nums(text) ? "changed" : "same",
      level: cb.level,
    };
  };

  // ⚠️ 只靠客户端列会混进内部法术（Explosive Trap Effect、形态被动），还会漏掉
  //    技能线共用的（Holy 线 Paladin/Priest 共用，ClassMask=0 分不出职业）。
  //    2026-10-09 对照 talentsforever：两边都有的条目学习等级 0 处不同。
  //    所以有他们的导出时，列表以他们的为准（他们按训练师核对），等级用我们的再核一遍。
  const spellbook = [];
  const gone = [];
  const tfBooks = tf?.spellbooks ?? null;
  if (tfBooks) {
    for (const [cls, bk] of Object.entries(tfBooks)) {
      const talentGranted = new Set(bk.talents ?? []);
      for (const g of bk.gone ?? []) gone.push({ class: cls, name: g });
      for (const tab of bk.tabs ?? []) {
        if (/^(pets|demons)$/i.test(tab.name)) continue; // 宠物技能不在训练师那里
        for (const [name, rank] of tab.spells) {
          // 天赋给的技能：第 1 级来自天赋，高等级仍然去训练师那里学
          if (talentGranted.has(name) && (rank === "" || rank === "Rank 1")) continue;
          const key = `${cls}|${name}|${rank}`;
          const sd = tf.spell_desc?.[key];
          const idx = /^Rank (\d+)$/.exec(rank)?.[1];
          const level = (idx ? bk.levels?.[name]?.[idx - 1] : bk.levels?.[name]?.[0])
            ?? Number(/level (\d+)/.exec(sd?.lv ?? "")?.[1] ?? 0);
          if (!level) continue;
          const m = mine.get(key);
          const own = m ? F.resolve(m.spell) : null;
          const description = sd?.d || (own?.ok ? own.text : null);
          const cls0 = classicOf(key, level, description);
          spellbook.push({
            class: cls, school: tab.name, name, rank, level, spell_id: m?.spell ?? sd?.id ?? null,
            description, verified: m && m.level === level ? 1 : 0,
            classic_status: sd?.cs ?? cls0.status, classic_level: cls0.level,
            classic_text: sd?.cd ?? null, classic_note: sd?.cn ?? null,
          });
        }
      }
    }
  } else {
    const talentSpells = new Set(out.map((o) => `${o.class}|${o.name}`));
    for (const [key, r] of mine) {
      if (talentSpells.has(`${r.cls}|${r.name}`) && (r.rank === "" || r.rank === "Rank 1")) continue;
      if (/ Effect$|\(Passive\d?\)/.test(r.name)) continue;
      const own = F.resolve(r.spell);
      const cls0 = classicOf(key, r.level, own.ok ? own.text : null);
      spellbook.push({
        class: r.cls, school: r.school, name: r.name, rank: r.rank, level: r.level, spell_id: r.spell,
        description: own.ok ? own.text : null, verified: 0,
        classic_status: cls0.status, classic_level: cls0.level, classic_text: null,
      });
    }
  }

  // ── 写表 ───────────────────────────────────────────────────────────────
  const write = (table, rows, cols) => {
    w.exec(`DROP TABLE IF EXISTS ${table}`);
    w.exec(`CREATE TABLE ${table} (${cols.join(", ")})`);
    const names = cols.map((c) => c.split(" ")[0]);
    const ins = w.prepare(`INSERT INTO ${table} (${names.join(",")}) VALUES (${names.map(() => "?").join(",")})`);
    w.exec("BEGIN");
    for (const r of rows) ins.run(...names.map((n) => r[n] ?? null));
    w.exec("COMMIT");
  };
  write("talent_node", out, [
    "class TEXT", "spec TEXT", "spec_order INT", "row INT", "col INT", "name TEXT", "spell_id INT",
    "max_ranks INT", "ranks TEXT", "text_source TEXT", "status TEXT", "moved INT", "ranks_changed INT",
    "numbers_changed INT", "status_source TEXT", "note TEXT", "replaces TEXT", "classic_name TEXT", "classic_spec TEXT", "classic_row INT", "classic_col INT", "classic_max INT",
    "classic_text TEXT",
  ]);
  write("talent_removed", removed, [
    "class TEXT", "spec TEXT", "name TEXT", "classic_max INT", "classic_row INT", "classic_text TEXT",
  ]);
  write("spellbook", spellbook, [
    "class TEXT", "school TEXT", "name TEXT", "rank TEXT", "level INT", "spell_id INT", "description TEXT",
    "verified INT", "classic_status TEXT", "classic_level INT", "classic_text TEXT", "classic_note TEXT",
  ]);
  write("spellbook_gone", gone, ["class TEXT", "name TEXT"]);
  // 技能书法术的施法材料（法师传送门的符文、术士的灵魂碎片之类）
  const reagentRows = [];
  const qReag = w.prepare(`SELECT * FROM SpellReagents WHERE CAST(SpellID AS INT) = ?`);
  const qItem = w.prepare(`SELECT Display_lang n, CAST(BuyPrice AS INT) p FROM ItemSparse WHERE CAST(ID AS INT) = ?`);
  for (const sbk of spellbook) {
    if (!sbk.spell_id) continue;
    const r = qReag.get(sbk.spell_id);
    if (!r) continue;
    for (let i = 0; i < 8; i++) {
      const item = Number(r[`Reagent_${i}`]), cnt = Number(r[`ReagentCount_${i}`]);
      if (item > 0 && cnt > 0) {
        const it = qItem.get(item);
        reagentRows.push({ spell_id: sbk.spell_id, item_id: item, item: it?.n ?? null, count: cnt, price: it?.p ?? null });
      }
    }
  }
  write("spellbook_reagent", reagentRows, ["spell_id INT", "item_id INT", "item TEXT", "count INT", "price INT"]);

  // 页面要写明对比的是哪两个版本、文字借的是哪天的导出
  const meta = w.prepare(`INSERT OR REPLACE INTO meta VALUES (?, ?)`);
  if (classicBuild) meta.run("classic_build", classicBuild);
  if (tf?.generated) meta.run("talentsforever_generated", tf.generated);

  // talent_full（derive.sql 从旧 Talent 表建的，432 行、布局是 Classic 的）被首页 / 职业页 /
  // 种族×职业页一起用着。直接用 Trait 树的结果重建同名同列的表，那些页面不用改就是对的。
  const cid = Object.fromEntries(classes.map((c) => [c.name, c.id]));
  write("talent_full", out.map((o) => ({
    id: null, tab_id: cid[o.class] * 10 + o.spec_order, tab: o.spec, tier: o.row - 1, col: o.col - 1,
    class: o.class, class_id: cid[o.class], spell_name: o.name, spell_id: o.spell_id,
  })), ["id INT", "tab_id INT", "tab TEXT", "tier INT", "col INT", "class TEXT", "class_id INT", "spell_name TEXT", "spell_id INT"]);
  w.close();

  return {
    talents: out.length,
    fromTf: out.filter((o) => o.text_source === "talentsforever").length,
    removed: removed.length,
    spellbook: spellbook.length,
    spellbookNoText: spellbook.filter((s) => !s.description).length,
    spellbookVerified: spellbook.filter((s) => s.verified).length,
  };
}
