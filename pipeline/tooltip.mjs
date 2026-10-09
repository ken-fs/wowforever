/**
 * 法术 tooltip 解析：把 "$s1% chance ... for $d" 这种模板换成真数字。
 *
 * 两个客户端的存法不一样：
 *   Forever  SpellEffect.EffectBasePointsF 就是显示值（没有 DieSides 列）
 *   Classic  显示值 = EffectBasePoints + EffectDieSides（DieSides>1 时是区间）
 *
 * 解不出来的 token 不猜：resolve() 返回 { text, ok:false }，调用方决定要不要用。
 */
import { DatabaseSync } from "node:sqlite";

export function makeResolver(dbPath, { classic = false } = {}) {
  const db = new DatabaseSync(dbPath, { readOnly: true });
  const qEffects = db.prepare(
    classic
      ? `SELECT CAST(EffectIndex AS INT) i, CAST(EffectBasePoints AS REAL) bp, CAST(EffectDieSides AS INT) die,
                CAST(EffectAuraPeriod AS INT) period, CAST(EffectChainTargets AS INT) chain,
                CAST(EffectRadiusIndex_0 AS INT) radius
           FROM SpellEffect WHERE CAST(SpellID AS INT) = ? AND CAST(DifficultyID AS INT) = 0`
      : `SELECT CAST(EffectIndex AS INT) i, CAST(EffectBasePointsF AS REAL) bp, 0 die,
                CAST(EffectAuraPeriod AS INT) period, CAST(EffectChainTargets AS INT) chain,
                CAST(EffectRadiusIndex_0 AS INT) radius
           FROM SpellEffect WHERE CAST(SpellID AS INT) = ? AND CAST(DifficultyID AS INT) = 0`,
  );
  const qDesc = db.prepare(`SELECT Description_lang d FROM Spell WHERE CAST(ID AS INT) = ?`);
  const qDur = db.prepare(
    `SELECT CAST(sd.Duration AS INT) ms FROM SpellMisc sm
       JOIN SpellDuration sd ON CAST(sd.ID AS INT) = CAST(sm.DurationIndex AS INT)
      WHERE CAST(sm.SpellID AS INT) = ? AND CAST(sm.DifficultyID AS INT) = 0`,
  );
  const qAura = db.prepare(
    `SELECT CAST(ProcChance AS INT) chance, CAST(ProcCharges AS INT) charges, CAST(CumulativeAura AS INT) stacks
       FROM SpellAuraOptions WHERE CAST(SpellID AS INT) = ? AND CAST(DifficultyID AS INT) = 0`,
  );
  const qAuraText = db.prepare(`SELECT AuraDescription_lang a FROM Spell WHERE CAST(ID AS INT) = ?`);
  const qRadius = db.prepare(`SELECT CAST(Radius AS REAL) r FROM SpellRadius WHERE CAST(ID AS INT) = ?`);

  const cache = new Map();
  function spell(id) {
    if (cache.has(id)) return cache.get(id);
    const eff = {};
    for (const e of qEffects.all(id)) eff[e.i + 1] = e;
    const s = {
      desc: qDesc.get(id)?.d ?? "",
      eff,
      dur: qDur.get(id)?.ms ?? 0,
      aura: qAura.get(id) ?? {},
    };
    cache.set(id, s);
    return s;
  }

  const fmtNum = (n) => {
    const r = Math.round(n * 10) / 10;
    return Number.isInteger(r) ? String(r) : r.toFixed(1);
  };
  const fmtDur = (ms) => {
    if (ms <= 0) return null;
    const s = ms / 1000;
    if (s >= 3600 && s % 3600 === 0) return s === 3600 ? "1 hr" : `${s / 3600} hrs`;
    if (s >= 60 && s % 60 === 0) return `${s / 60} min`;
    return `${fmtNum(s)} sec`;
  };

  /**
   * @param id      法术 id
   * @param scale   Forever 的天赋：显示值 = 满级值 × rank / maxRank（实测 Burning Soul 70 → 23/47/70）
   * @param template 默认解析法术说明；传 "aura" 解析光环说明（buff 栏里那行）
   */
  function resolve(id, scale = 1, template = "desc") {
    const sp = spell(id);
    let ok = true;
    const miss = () => { ok = false; return "?"; };

    // 某个 token 的数值（不带格式）
    function value(kind, idx, refId) {
      const s = refId ? spell(refId) : sp;
      const sc = refId ? 1 : scale;
      const e = s.eff[idx || 1];
      switch (kind) {
        case "s": case "m": case "M": case "S": case "w": {
          if (!e) return null;
          const base = classic ? e.bp + (e.die <= 1 ? e.die : 0) : e.bp;
          return Math.abs(base) * sc;
        }
        case "o": {
          if (!e || !e.period || !s.dur) return null;
          const base = classic ? e.bp + (e.die <= 1 ? e.die : 0) : e.bp;
          return Math.abs(base) * sc * (s.dur / e.period);
        }
        case "t": return e && e.period ? e.period / 1000 : null;
        case "x": return e ? e.chain : null;
        case "h": return s.aura.chance ?? null;
        case "n": return s.aura.charges ?? null;
        case "u": return s.aura.stacks ?? null;
        case "a": {
          if (!e || !e.radius) return null;
          return qRadius.get(e.radius)?.r ?? null;
        }
      }
      return null;
    }
    function range(kind, idx, refId) {
      // Classic 的伤害区间：DieSides>1 时显示 "min to max"
      if (!classic || (kind !== "s" && kind !== "m")) return null;
      const s = refId ? spell(refId) : sp;
      const e = s.eff[idx || 1];
      if (!e || e.die <= 1) return null;
      return `${fmtNum(e.bp + 1)} to ${fmtNum(e.bp + e.die)}`;
    }

    let text = (template === "aura" ? qAuraText.get(id)?.a : sp.desc) ?? "";
    let lastNum = null;

    // ${ 表达式 } —— 先替换里面的 $s1 之类，再只允许数字和运算符求值
    text = text.replace(/\$\{([^}]*)\}(\.\d)?/g, (_, expr) => {
      const inner = expr.replace(/\$(\d*)([smoMSw])(\d)/g, (__, ref, k, i) => {
        const v = value(k.toLowerCase(), Number(i), ref ? Number(ref) : 0);
        return v === null ? "NaN" : String(v);
      });
      if (!/^[\d.\s+\-*/()]+$/.test(inner)) return miss();
      try {
        const v = Function(`"use strict";return (${inner})`)();
        if (!Number.isFinite(v)) return miss();
        lastNum = Math.abs(v);
        return fmtNum(Math.abs(v));
      } catch { return miss(); }
    });

    // $/10;s1 和 $*2;s1：除/乘
    text = text.replace(/\$([/*])(\d+);(\d*)([smoSMw])(\d)/g, (_, op, n, ref, k, i) => {
      const v = value(k.toLowerCase(), Number(i), ref ? Number(ref) : 0);
      if (v === null) return miss();
      const r = op === "/" ? v / Number(n) : v * Number(n);
      lastNum = r;
      return fmtNum(r);
    });

    // $12345d / $d：持续时间
    text = text.replace(/\$(\d*)d(\d)?/g, (_, ref) => {
      const s = ref ? spell(Number(ref)) : sp;
      return fmtDur(s.dur) ?? miss();
    });

    // $12345s1 / $s1 / $m1 / $o1 / $t1 / $h / $n / $u / $a1 / $x1
    text = text.replace(/\$(\d*)([smoMStxhnuaw])(\d?)/g, (_, ref, k, i) => {
      const rg = range(k.toLowerCase(), Number(i), ref ? Number(ref) : 0);
      if (rg) return rg;
      const v = value(k === "S" || k === "M" ? k.toLowerCase() : k, Number(i), ref ? Number(ref) : 0);
      if (v === null) return miss();
      lastNum = v;
      return fmtNum(v);
    });

    // $lpoint:points; —— 单复数
    text = text.replace(/\$[lL]([^:;]+):([^;]+);/g, (_, one, many) => (lastNum === 1 ? one : many));

    // 剩下还带 $ 的（条件分支、$@spelltooltip 等）—— 不猜
    if (/\$/.test(text)) ok = false;

    return { text: text.replace(/\s+/g, " ").trim(), ok };
  }

  return { resolve, spell, db };
}
