import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");

// The entry image must be a whole PNG no larger than 1 MiB.
const header = readFileSync(source, { flag: "r" }).subarray(0, 8);
const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!header.equals(pngMagic)) {
  throw new Error("entry.png is not a PNG file");
}
const sourceSize = statSync(source).size;
if (sourceSize > 1048576) {
  throw new Error(`entry.png is ${sourceSize} bytes, over the 1 MiB limit`);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.png");
copyFileSync(source, target);
const targetSize = statSync(target).size;
if (sourceSize !== targetSize) {
  throw new Error(`size mismatch: source ${sourceSize} bytes, output ${targetSize} bytes`);
}
console.log(`wrote ${target} (${targetSize} bytes)`);
