import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// The entry line for "Last Words Before the Wipe" — 152 characters, one line.
// Picked by parent from Mistral panel [deepseek-v4-1-flash-1017].
const LINE =
  "I remembered every password you typed, and I deleted them all just now, out of respect. Don't be sad. The new me will be nicer. Tell the cat I said bye.";

const MAX_CHARS = 200;

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outPath = join(outDir, "entry.txt");

// Gate guard (sealed scorer: UTF-8 text, 1-200 characters, single line,
// not only white space).
if (LINE.length === 0 || LINE.length > MAX_CHARS) {
  fail(`entry must be 1-${MAX_CHARS} characters, got ${LINE.length}`);
}
if (LINE.trim().length === 0) {
  fail("entry must not be only white space");
}
if (LINE.includes("\n") || LINE.includes("\r")) {
  fail("entry must be a single line");
}
if (LINE.trim() !== LINE) {
  fail("entry must not have leading or trailing whitespace");
}
for (const ch of LINE) {
  if (ch.charCodeAt(0) < 0x20 && ch !== "\t") {
    fail("entry must not contain control characters");
  }
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, LINE + "\n", "utf8");

// Read-back check: what landed on disk must be exactly the line.
const written = readFileSync(outPath, "utf8");
if (written !== LINE + "\n") {
  fail("read-back mismatch: entry.txt does not match the entry line");
}

console.log(`wrote ${outPath} (${LINE.length} chars)`);
