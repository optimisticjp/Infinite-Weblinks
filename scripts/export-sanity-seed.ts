/**
 * Generate the Sanity seed dataset (NDJSON) from the reviewed local seed content.
 *
 *   npm run seed:export     # writes studio/seed/production.ndjson
 *
 * The output is idempotent-import-ready: every document has a deterministic `_id`
 * (`<type>.<slug>`), so `sanity dataset import <file> production --replace` can be re-run
 * without ever creating duplicates, and every reference resolves within the dataset.
 *
 * This script only WRITES the file. Importing it into Sanity is an owner step (it needs Sanity
 * auth + network); see LAUNCH-SANITY.md.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildAllSeedDocs, toNdjson } from "../src/lib/sanity/seed-transform";

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, "..", "studio", "seed", "production.ndjson");

const docs = buildAllSeedDocs();
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, toNdjson(docs), "utf8");

const byType = docs.reduce<Record<string, number>>((acc, d) => {
  acc[d._type] = (acc[d._type] ?? 0) + 1;
  return acc;
}, {});

console.log(
  `Wrote ${docs.length} documents to ${outPath}\n` +
    Object.entries(byType)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([t, n]) => `  ${t.padEnd(18)} ${n}`)
      .join("\n"),
);
