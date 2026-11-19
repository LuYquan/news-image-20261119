// Copies the finished news infographic into the grading output folder.
// Runs with Node 22 and the standard library only; no network is used.

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1_048_576;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function fail(message) {
  throw new Error(`entry.png check failed: ${message}`);
}

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, "entry.png");

if (!existsSync(source)) fail("entry.png is missing next to main.ts");
const bytes = readFileSync(source);
if (bytes.length > MAX_BYTES) fail(`file is ${bytes.length} bytes, over the 1 MiB limit`);
if (!bytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
  fail("file does not start with the PNG magic bytes");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
const destination = join(outDir, "entry.png");
copyFileSync(source, destination);

const written = statSync(destination).size;
if (written !== bytes.length) {
  fail(`copied file is ${written} bytes but the source is ${bytes.length} bytes`);
}
console.log(`Wrote ${destination} (${written} bytes)`);
