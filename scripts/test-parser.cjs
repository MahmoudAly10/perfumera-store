// scripts/test-parser.cjs
const fs = require("fs");

// Read the source of gen-seed.cjs and eval the helper functions
const src = fs.readFileSync("scripts/gen-seed.cjs", "utf8");
const helperNames = [
  "getField", "getFieldNum", "getFieldBool", "getArrayField",
  "getNestedArray", "getReviews", "getQA", "getImages", "esc", "arr"
];
for (const name of helperNames) {
  const re = new RegExp(`function ${name}\\b[\\s\\S]*?\\n\\}`);
  const m = src.match(re);
  if (m) eval(m[0]);
}

// Now read the actual product body from data.ts using the same parser
const dataSrc = fs.readFileSync("perfumeria/lib/data.ts", "utf8");
const prodMatch = dataSrc.match(/export const PRODUCTS[^=]*=\s*\[([\s\S]*?)\n\];/);
const lines = prodMatch[1].split("\n");
let cur = null, body = [], blocks = [];
for (const line of lines) {
  const topId = line.match(/^    id:\s*"([^"]+)",\s*$/);
  if (topId) {
    if (cur) blocks.push({ id: cur, raw: body.join("\n") });
    cur = topId[1]; body = [];
  } else if (cur) body.push(line);
}
if (cur) blocks.push({ id: cur, raw: body.join("\n") });

const mn002 = blocks.find(b => b.id === "mn-002");
console.log("mn-002 raw length:", mn002.raw.length);
console.log("getNestedArray('variants'):", getNestedArray(mn002.raw, "variants"));
console.log("getReviews:", getReviews(mn002.raw).length, "reviews");
console.log("getQA:", getQA(mn002.raw).length, "QA");
console.log("getImages:", getImages(mn002.raw));

// Test on a product WITH qa
const mn001 = blocks.find(b => b.id === "mn-001");
console.log("\nmn-001 (has qa):");
console.log("getReviews:", getReviews(mn001.raw).length, "reviews");
console.log("getQA:", getQA(mn001.raw).length, "QA");
