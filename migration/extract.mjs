import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SRC = "d:/github_project/herb_forager/fp.js";
const OUT = "d:/github_project/herb_forager/migration/data";
mkdirSync(OUT, { recursive: true });

const src = readFileSync(SRC, "utf8");

// Pull a top-level `const NAME = <literal>;` block where the literal closes
// with `\n];` or `\n};` at column 0 (these are all plain-data declarations).
function block(name, open, close) {
  const start = src.indexOf(`const ${name} = ${open}`);
  if (start < 0) throw new Error(`not found: ${name}`);
  const from = start + `const ${name} = `.length;
  const end = src.indexOf(`\n${close};`, from);
  if (end < 0) throw new Error(`no close for ${name}`);
  const literal = src.slice(from, end + 1 + close.length); // include "\n" + close
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${literal});`)();
}

const HERBS = block("HERBS", "[", "]");
const HERB_DESC = block("HERB_DESC", "{", "}");
const NATURE_OF = block("NATURE_OF", "{", "}");
const FORMULAS = block("FORMULAS", "[", "]");
const ATLAS = block("ATLAS", "[", "]");

const hex = (n) =>
  typeof n === "number" ? "#" + n.toString(16).padStart(6, "0") : null;

const latinById = Object.fromEntries(ATLAS.map((a) => [a.id, a.latin]));

const herbs = HERBS.map((h) => ({
  id: h.id,
  name: h.name,
  icon: h.icon ?? null,
  colorHex: hex(h.color),
  shape: h.shape ?? null,
  nature: NATURE_OF[h.id] ?? null,
  clue: h.clue ?? null,
  desc: HERB_DESC[h.id] ?? null,
  latin: latinById[h.id] ?? null,
}));

const formulas = FORMULAS.map((f) => ({
  name: f.name,
  cure: f.cure,
  herbs: f.herbs,
  who: f.who,
}));

writeFileSync(`${OUT}/herbs.json`, JSON.stringify(herbs, null, 2) + "\n");
writeFileSync(`${OUT}/formulas.json`, JSON.stringify(formulas, null, 2) + "\n");

// Sanity report
const natureCount = herbs.reduce((m, h) => ((m[h.nature] = (m[h.nature] || 0) + 1), m), {});
const missingNature = herbs.filter((h) => !h.nature).map((h) => h.id);
const missingDesc = herbs.filter((h) => !h.desc).map((h) => h.id);
const formulaHerbIds = new Set(formulas.flatMap((f) => f.herbs));
const herbIds = new Set(herbs.map((h) => h.id));
const formulaRefMissing = [...formulaHerbIds].filter((id) => !herbIds.has(id));

console.log(JSON.stringify({
  herbCount: herbs.length,
  formulaCount: formulas.length,
  withAtlas: herbs.filter((h) => h.latin).length,
  natureCount,
  missingNature,
  missingDesc,
  formulaRefMissing,
}, null, 2));
