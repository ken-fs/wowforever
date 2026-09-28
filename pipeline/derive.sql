-- 派生表：原始 DB2 表全是 TEXT，这里物化成整数类型 + 建索引
--
-- 为什么用 TABLE 不用 VIEW：
--   视图每次查询都重算。spell_named 那种 36k×42k 的 JOIN 会让报告跑不完（实测卡死）。
--   物化一次 + 建索引 = 报告和后面的站点生成都快。
--
-- 换 build 重跑会整表重建。

DROP TABLE IF EXISTS item_named;
CREATE TABLE item_named AS
SELECT
  CAST(i.ID AS INTEGER)               AS id,
  s.Display_lang                      AS name,
  CAST(s.OverallQualityID AS INTEGER) AS quality,
  CAST(s.ItemLevel AS INTEGER)        AS ilvl,
  CAST(s.RequiredLevel AS INTEGER)    AS req_level,
  CAST(i.ClassID AS INTEGER)          AS class_id,
  CAST(i.SubclassID AS INTEGER)       AS subclass_id,
  ic.ClassName_lang                   AS class_name,
  CAST(i.IconFileDataID AS INTEGER)   AS icon_fdid
FROM "Item" i
JOIN "ItemSparse" s ON CAST(s.ID AS INTEGER) = CAST(i.ID AS INTEGER)
LEFT JOIN "ItemClass" ic ON CAST(ic.ClassID AS INTEGER) = CAST(i.ClassID AS INTEGER)
WHERE s.Display_lang IS NOT NULL AND s.Display_lang <> '';
CREATE INDEX ix_item_named_q   ON item_named(quality);
CREATE INDEX ix_item_named_cls ON item_named(class_id);

-- 法术图标：先把 SpellMisc 压成 1 spell = 1 icon，再 join
DROP TABLE IF EXISTS spell_icon;
CREATE TABLE spell_icon AS
SELECT CAST(SpellID AS INTEGER) AS spell_id,
       MIN(CAST(SpellIconFileDataID AS INTEGER)) AS icon_fdid
FROM "SpellMisc"
WHERE SpellID IS NOT NULL AND SpellID <> '' AND SpellIconFileDataID IS NOT NULL AND SpellIconFileDataID <> ''
GROUP BY 1;
CREATE INDEX ix_spell_icon ON spell_icon(spell_id);

DROP TABLE IF EXISTS spell_named;
CREATE TABLE spell_named AS
SELECT
  CAST(sp.ID AS INTEGER)           AS id,
  sn.Name_lang                     AS name,
  sp.Description_lang              AS description,
  sp.AuraDescription_lang          AS aura,
  si.icon_fdid                     AS icon_fdid
FROM "Spell" sp
JOIN "SpellName" sn ON CAST(sn.ID AS INTEGER) = CAST(sp.ID AS INTEGER)
LEFT JOIN spell_icon si ON si.spell_id = CAST(sp.ID AS INTEGER)
WHERE sn.Name_lang IS NOT NULL AND sn.Name_lang <> '';
CREATE INDEX ix_spell_named_name ON spell_named(name);

-- ── 支柱 ④ 职业×种族 ──────────────────────────────────────────
DROP TABLE IF EXISTS race_class;
CREATE TABLE race_class AS
SELECT
  r.Name_lang                                   AS race,
  CAST(cbi.RaceID AS INTEGER)                   AS race_id,
  c.Name_lang                                   AS class,
  CAST(cbi.ClassID AS INTEGER)                  AS class_id,
  CASE WHEN CAST(cbi.RaceID AS INTEGER) >= 95 THEN 1 ELSE 0 END AS is_skyborne,
  -- 天裔两分支 = 联盟/部落两个版本：有法师的是联盟（High Order），有萨满的是部落（Windshaper）。
  -- 依据：客户端职业列表 + 创作者原话 "Alliance skyborn get the mage, Horde skyborn get the shaman"
  CASE
    WHEN CAST(cbi.RaceID AS INTEGER) = 95 THEN 'Alliance'
    WHEN CAST(cbi.RaceID AS INTEGER) = 96 THEN 'Horde'
    ELSE NULL
  END AS skyborne_faction
FROM "CharBaseInfo" cbi
JOIN "ChrRaces"   r ON CAST(r.ID AS INTEGER) = CAST(cbi.RaceID  AS INTEGER)
JOIN "ChrClasses" c ON CAST(c.ID AS INTEGER) = CAST(cbi.ClassID AS INTEGER);

-- ── 支柱 ① 天赋 ───────────────────────────────────────────────
DROP TABLE IF EXISTS talent_full;
CREATE TABLE talent_full AS
SELECT
  CAST(t.ID AS INTEGER)          AS id,
  CAST(t.TabID AS INTEGER)       AS tab_id,
  tt.Name_lang                   AS tab,
  CAST(t.TierID AS INTEGER)      AS tier,
  CAST(t.ColumnIndex AS INTEGER) AS col,
  c.Name_lang                    AS class,
  CAST(c.ID AS INTEGER)          AS class_id,
  sn.name                        AS spell_name,
  CAST(t.SpellRank_0 AS INTEGER) AS spell_id
FROM "Talent" t
LEFT JOIN "TalentTab" tt ON CAST(tt.ID AS INTEGER) = CAST(t.TabID AS INTEGER)
-- ⚠️ Talent.ClassID 在 Forever 客户端里整列是 0（没填），职业要靠
-- TalentTab.ClassMask 的位掩码反解：bit = 1 << (ChrClasses.ID - 1)。
-- 实测掩码集合 {1,2,4,8,16,64,128,256,1024} 正好对上 9 个职业。
LEFT JOIN "ChrClasses" c
  ON (CAST(tt.ClassMask AS INTEGER) & (1 << (CAST(c.ID AS INTEGER) - 1))) > 0
-- ⚠️ Talent.SpellID 在 Forever 客户端里整列是 0，真法术 id 在 SpellRank_0
-- （实测 415/432 能在 spell_named 里解析出名字）。别再改回 SpellID。
LEFT JOIN spell_named sn ON sn.id = CAST(t.SpellRank_0 AS INTEGER);
CREATE INDEX ix_talent_class ON talent_full(class_id);

-- ── 支柱 ③ 专业 / 配方 ────────────────────────────────────────
DROP TABLE IF EXISTS recipe;
CREATE TABLE recipe AS
SELECT
  CAST(sla.ID AS INTEGER)               AS id,
  sl.DisplayName_lang                   AS profession,
  CAST(sla.SkillLine AS INTEGER)        AS skill_line,
  -- ⚠️ MinSkillLineRank 在 Forever 客户端里 7809/7826 行都是 1（没用）。
  -- 真等级在 TrivialSkillLineRankHigh —— 配方"变灰"的技能等级，2547 行有值。
  -- 别当"需求等级"用，它是 trivial 等级。
  CAST(sla.TrivialSkillLineRankHigh AS INTEGER) AS trivial_at,
  CAST(sla.TradeSkillCategoryID AS INTEGER)    AS category_id,
  sn.name                               AS spell_name,
  CAST(sla.Spell AS INTEGER)            AS spell_id,
  CAST(sr.Reagent_0 AS INTEGER)         AS reagent_0,
  CAST(sr.ReagentCount_0 AS INTEGER)    AS count_0
  -- 完整材料表见 recipe_reagent（一张配方最多 8 个材料槽）
FROM "SkillLineAbility" sla
JOIN "SkillLine" sl ON CAST(sl.ID AS INTEGER) = CAST(sla.SkillLine AS INTEGER)
  -- 11 = 制造专业(9 个)；9 = 次要技能，但 Cooking/First Aid/Fishing 也是真专业
  -- ⚠️ 只写 CategoryID='11' 会把这三个漏掉 —— 而营火系统的主角就是烹饪，钓鱼还有 Fishbowl
  AND (sl.CategoryID = '11' OR sl.DisplayName_lang IN ('Cooking', 'First Aid', 'Fishing'))
  -- 7 = 武器技能(Axes/Swords/Bows)，不是专业
LEFT JOIN spell_named sn ON sn.id = CAST(sla.Spell AS INTEGER)
LEFT JOIN "SpellReagents" sr ON CAST(sr.SpellID AS INTEGER) = CAST(sla.Spell AS INTEGER)
WHERE sn.name IS NOT NULL
  -- 排除职业本身（"Blacksmithing" 这种技能线法术会被当成配方混进来）
  AND sn.name <> sl.DisplayName_lang
  -- 只要真配方：trivial 等级 > 0 的
  AND CAST(sla.TrivialSkillLineRankHigh AS INTEGER) > 0;
CREATE INDEX ix_recipe_prof ON recipe(profession);

-- 配方材料：SpellReagents 有 Reagent_0..7 共 8 个槽位，竖过来存才用得上
-- （之前 recipe 表只取了 reagent_0，浪费了 7 个槽）
DROP TABLE IF EXISTS recipe_reagent;
CREATE TABLE recipe_reagent AS
SELECT spell_id, CAST(trivial_at AS INTEGER) AS trivial_at, profession, spell_name,
       reagent_id, count, slot
FROM (
  SELECT CAST(sr.SpellID AS INTEGER) AS spell_id, r.trivial_at, r.profession, r.spell_name,
         CAST(sr.Reagent_0 AS INTEGER) AS reagent_id, CAST(sr.ReagentCount_0 AS INTEGER) AS count, 0 AS slot FROM "SpellReagents" sr JOIN recipe r ON r.spell_id = CAST(sr.SpellID AS INTEGER)
  UNION ALL SELECT CAST(sr.SpellID AS INTEGER), r.trivial_at, r.profession, r.spell_name, CAST(sr.Reagent_1 AS INTEGER), CAST(sr.ReagentCount_1 AS INTEGER), 1 FROM "SpellReagents" sr JOIN recipe r ON r.spell_id = CAST(sr.SpellID AS INTEGER)
  UNION ALL SELECT CAST(sr.SpellID AS INTEGER), r.trivial_at, r.profession, r.spell_name, CAST(sr.Reagent_2 AS INTEGER), CAST(sr.ReagentCount_2 AS INTEGER), 2 FROM "SpellReagents" sr JOIN recipe r ON r.spell_id = CAST(sr.SpellID AS INTEGER)
  UNION ALL SELECT CAST(sr.SpellID AS INTEGER), r.trivial_at, r.profession, r.spell_name, CAST(sr.Reagent_3 AS INTEGER), CAST(sr.ReagentCount_3 AS INTEGER), 3 FROM "SpellReagents" sr JOIN recipe r ON r.spell_id = CAST(sr.SpellID AS INTEGER)
  UNION ALL SELECT CAST(sr.SpellID AS INTEGER), r.trivial_at, r.profession, r.spell_name, CAST(sr.Reagent_4 AS INTEGER), CAST(sr.ReagentCount_4 AS INTEGER), 4 FROM "SpellReagents" sr JOIN recipe r ON r.spell_id = CAST(sr.SpellID AS INTEGER)
  UNION ALL SELECT CAST(sr.SpellID AS INTEGER), r.trivial_at, r.profession, r.spell_name, CAST(sr.Reagent_5 AS INTEGER), CAST(sr.ReagentCount_5 AS INTEGER), 5 FROM "SpellReagents" sr JOIN recipe r ON r.spell_id = CAST(sr.SpellID AS INTEGER)
  UNION ALL SELECT CAST(sr.SpellID AS INTEGER), r.trivial_at, r.profession, r.spell_name, CAST(sr.Reagent_6 AS INTEGER), CAST(sr.ReagentCount_6 AS INTEGER), 6 FROM "SpellReagents" sr JOIN recipe r ON r.spell_id = CAST(sr.SpellID AS INTEGER)
  UNION ALL SELECT CAST(sr.SpellID AS INTEGER), r.trivial_at, r.profession, r.spell_name, CAST(sr.Reagent_7 AS INTEGER), CAST(sr.ReagentCount_7 AS INTEGER), 7 FROM "SpellReagents" sr JOIN recipe r ON r.spell_id = CAST(sr.SpellID AS INTEGER)
)
WHERE reagent_id > 0;
CREATE INDEX ix_rr_spell ON recipe_reagent(spell_id);

-- 材料名：只存「被用作材料」的那部分物品（实测 ~800 个 vs 全量 19,224）
-- 站点要显示材料名，但没必要为此把整张 item_named 带进 site.db
DROP TABLE IF EXISTS reagent_name;
CREATE TABLE reagent_name AS
SELECT DISTINCT CAST(i.id AS INTEGER) AS id, i.name, CAST(i.quality AS INTEGER) AS quality
FROM item_named i
WHERE CAST(i.id AS INTEGER) IN (SELECT DISTINCT reagent_id FROM recipe_reagent);

-- ── 支柱 ② 露营 / 增益 ────────────────────────────────────────
DROP TABLE IF EXISTS camping_spell;
CREATE TABLE camping_spell AS
SELECT id, name, description, aura FROM spell_named
WHERE name LIKE 'Camp%' OR name LIKE '%Campfire%' OR name LIKE 'Tent%'
   OR description LIKE '%camp%' OR aura LIKE '%camp%';

-- ── XP 增益（tooltip 文本已验证：aura 200 = "Experience gains increased by X%"）──
DROP TABLE IF EXISTS xp_spell;
CREATE TABLE xp_spell AS
SELECT DISTINCT
  s.id,
  s.name,
  CAST(e.EffectAura AS INTEGER)     AS aura,
  CAST(e.EffectBasePointsF AS REAL) AS pct,
  s.description,
  s.aura AS tooltip,
  -- tooltip 形如 "$429959s0%" = 自引用，真值不在数据里（如 Well-Rested）
  -- 这种标 reliable=0，计算器必须跳过，否则会算出错的数
  CASE WHEN COALESCE(s.aura, '') LIKE '%$' || s.id || 's%' THEN 0 ELSE 1 END AS reliable,
  -- CN Only 的 buff 在英文客户端里拿不到
  CASE WHEN COALESCE(s.aura, '') LIKE '%(CN Only)%' THEN 1 ELSE 0 END AS cn_only
FROM spell_named s
JOIN SpellEffect e ON CAST(e.SpellID AS INTEGER) = s.id
WHERE e.EffectAura IN ('200', '291', '348')
  AND CAST(e.EffectBasePointsF AS REAL) > 0;
CREATE INDEX ix_xp_spell_aura ON xp_spell(aura);

-- ── 升级经验曲线（实测与经典服一致：400/900/1400/2100…）──
DROP TABLE IF EXISTS xp_curve;
CREATE TABLE xp_curve AS
SELECT CAST(Level AS INTEGER) AS level, CAST(Experience AS INTEGER) AS xp
FROM "LevelExperience"
WHERE CAST(Level AS INTEGER) BETWEEN 1 AND 60 ORDER BY 1;

-- 任务经验（按等级 × 难度档）
DROP TABLE IF EXISTS quest_xp;
CREATE TABLE quest_xp AS
SELECT CAST(ID AS INTEGER) AS level,
       CAST(Difficulty_3 AS INTEGER) AS normal,
       CAST(Difficulty_4 AS INTEGER) AS hard
FROM "QuestXP" WHERE CAST(ID AS INTEGER) BETWEEN 1 AND 60;

-- ── 相对经典服的变化（第 ⑤ 支柱）────────────────────────────
-- baseline = 经典服 (wow_classic_era) 的 CharBaseInfo，看 Forever 加/减了哪些组合
DROP TABLE IF EXISTS race_class_new;
CREATE TABLE race_class_new AS
SELECT rc.race, rc.class, rc.race_id, rc.class_id, rc.is_skyborne
FROM race_class rc
WHERE NOT EXISTS (
  SELECT 1 FROM "CharBaseInfo_baseline" b
  WHERE CAST(b.RaceID AS INTEGER) = rc.race_id AND CAST(b.ClassID AS INTEGER) = rc.class_id
);

DROP TABLE IF EXISTS v_change_summary;
CREATE TABLE v_change_summary AS
SELECT 'race × class combos' AS what,
       (SELECT COUNT(*) FROM "CharBaseInfo_baseline") AS classic,
       (SELECT COUNT(*) FROM race_class) AS forever;

-- ── 预计算计数（站点只用来显示数字，不必带整张表进构建）──
DROP TABLE IF EXISTS counts;
CREATE TABLE counts AS
SELECT 'spells'          AS key, COUNT(*) AS value FROM spell_named
UNION ALL SELECT 'items_rare',   COUNT(*) FROM item_named WHERE quality >= 3
UNION ALL SELECT 'items_epic',   COUNT(*) FROM item_named WHERE quality >= 4
UNION ALL SELECT 'tables',       COUNT(*) FROM sqlite_master WHERE type = 'table'
UNION ALL SELECT 'dungeons',     COUNT(DISTINCT MapID) FROM DungeonEncounter
UNION ALL SELECT 'sets',         COUNT(*) FROM "ItemSet";

-- ── 报告 ──────────────────────────────────────────────────────
DROP TABLE IF EXISTS v_page_counts;
CREATE TABLE v_page_counts AS
SELECT * FROM (
  SELECT '物品页（品质≥2）' AS pillar,
         CAST(SUM(quality >= 2) AS TEXT) AS pages, 'Item×ItemSparse JOIN' AS basis FROM item_named
  UNION ALL SELECT '法术页（有描述）', CAST(COUNT(*) AS TEXT), 'Spell×SpellName，description 非空'
    FROM spell_named WHERE description IS NOT NULL AND description <> ''
  UNION ALL SELECT '法术页（全部有名字）', CAST(COUNT(*) AS TEXT), 'Spell×SpellName' FROM spell_named
  UNION ALL SELECT '天赋点', CAST(COUNT(*) AS TEXT), 'Talent 表（9 职业 × 3 系）' FROM talent_full
  UNION ALL SELECT '天赋树（系）', CAST(COUNT(DISTINCT tab_id) AS TEXT), 'TalentTab' FROM talent_full
  UNION ALL SELECT '职业×种族组合', CAST(COUNT(*) AS TEXT), 'CharBaseInfo（含天裔两分支）' FROM race_class
  UNION ALL SELECT '套装页', CAST(COUNT(*) AS TEXT), 'ItemSet'
    FROM "ItemSet" WHERE ItemID_0 IS NOT NULL AND ItemID_0 <> ''
  UNION ALL SELECT '专业配方页', CAST(COUNT(*) AS TEXT), 'SkillLineAbility，已排职业本身+无等级行' FROM recipe
  UNION ALL SELECT '专业（SkillLine）', CAST(COUNT(*) AS TEXT), 'SkillLine 表' FROM "SkillLine"
  UNION ALL SELECT '地图/区域页', CAST(COUNT(*) AS TEXT), 'Map 表' FROM "Map"
  UNION ALL SELECT '副本 BOSS 页', CAST(COUNT(*) AS TEXT), 'DungeonEncounter' FROM "DungeonEncounter"
  UNION ALL SELECT '露营相关法术', CAST(COUNT(*) AS TEXT), 'SpellName LIKE Camp%' FROM camping_spell
  UNION ALL SELECT 'XP 增益（数值已验证）', CAST(COUNT(DISTINCT name) AS TEXT), 'aura 200/291/348，reliable=1' FROM xp_spell WHERE reliable = 1
  UNION ALL SELECT 'XP 增益（被排除）', CAST(COUNT(DISTINCT name) AS TEXT), 'tooltip 自引用，值不可信' FROM xp_spell WHERE reliable = 0
  UNION ALL SELECT '升级经验曲线', CAST(COUNT(*) AS TEXT), 'LevelExperience，1-60 每级所需 XP' FROM xp_curve
  UNION ALL SELECT '★ 相对经典服新增的种族职业组合', CAST(COUNT(*) AS TEXT), '与 wow_classic_era 的 CharBaseInfo 对比' FROM race_class_new
  UNION ALL SELECT '传承/天赋树节点', CAST(COUNT(*) AS TEXT), 'TraitNodeEntry' FROM "TraitNodeEntry"
  UNION ALL SELECT '物品可带法术（联动）', CAST(COUNT(DISTINCT ItemID) AS TEXT), 'ItemXItemEffect'
    FROM "ItemXItemEffect"
);

-- 拿不到 / 不能用的表（写清楚边界，别到时候才发现）
DROP TABLE IF EXISTS v_gaps;
CREATE TABLE v_gaps AS
SELECT '任务（Quest）' AS item, 'QuestV2 只有 ID+主题，没有名字/目标/奖励文本' AS why
UNION ALL SELECT 'NPC / Creature', 'Creature 表只有 179 行且全是小动物(猫/松鼠)，不是 NPC 库'
UNION ALL SELECT '传承系统（Legacy）', 'TraitTree 的 TitleText 全为空，不像 Legacy 数据；需要另外找'
UNION ALL SELECT '露营增益表', '有 Create Campsite / Camp Benefits 等法术，但"10 专业 × 增益"的对应关系不在 DB2 里'
UNION ALL SELECT '拍卖行 / 经济', '要 Blizzard 官方 API（需 OAuth），本次未接';

DROP TABLE IF EXISTS v_findings;
CREATE TABLE v_findings AS
SELECT '天裔是两支（官网只讲一支）' AS label,
       (SELECT group_concat(r, ' + ') FROM (SELECT DISTINCT race AS r FROM race_class WHERE is_skyborne = 1)) AS detail
UNION ALL SELECT '天裔可选职业',
       (SELECT group_concat(c, ' / ') FROM (SELECT DISTINCT class AS c FROM race_class WHERE is_skyborne = 1))
UNION ALL SELECT '圣骑士只有这些种族',
       (SELECT group_concat(race, ' / ') FROM race_class WHERE class = 'Paladin')
UNION ALL SELECT '德鲁伊只有这些种族',
       (SELECT group_concat(race, ' / ') FROM race_class WHERE class = 'Druid')
UNION ALL SELECT '亡灵可选职业数 / 列表',
       (SELECT COUNT(*) || ' 个：' || group_concat(class, ' / ') FROM race_class WHERE race = 'Undead')
UNION ALL SELECT '种族总数 / 组合总数',
       (SELECT COUNT(DISTINCT race) || ' 个种族，' || COUNT(*) || ' 个组合' FROM race_class)
UNION ALL SELECT '职业（9 个）', (SELECT group_concat(n, ' / ') FROM (SELECT DISTINCT Name_lang AS n FROM "ChrClasses"))
UNION ALL SELECT '最高物品等级', (SELECT name || ' (ilvl ' || ilvl || ')' FROM item_named ORDER BY ilvl DESC LIMIT 1)
UNION ALL SELECT '史诗+物品数', (SELECT COUNT(*) || ' 件（品质 >= 4）' FROM item_named WHERE quality >= 4)
UNION ALL SELECT '★ 新增种族职业组合',
       (SELECT group_concat(race || ' + ' || class, ' · ') FROM race_class_new);
