// scripts/debug-products.cjs
const fs = require("fs");
const src = fs.readFileSync("perfumeria/lib/data.ts", "utf8");
const m = src.match(/export const PRODUCTS[^=]*=\s*\[([\s\S]*?)\n\];/);
const lines = m[1].split("\n");
let cur = null, body = [], blocks = [];
for (const line of lines) {
  const topId = line.match(/^    id:\s*"([^"]+)",\s*$/);
  if (topId) {
    if (cur) blocks.push({ id: cur, raw: body.join("\n") });
    cur = topId[1]; body = [];
  } else if (cur) body.push(line);
}
if (cur) blocks.push({ id: cur, raw: body.join("\n") });

const p = blocks.find(b => b.id === "mn-002");
console.log("Product mn-002 body length:", p.raw.length);
console.log("Product mn-002 body (first 800 chars):");
console.log(p.raw.substring(0, 800));
console.log("\nProduct mn-002 body (last 200 chars):");
console.log(p.raw.substring(p.raw.length - 200));

// Test regex for variants
const varMatch = p.raw.match(/\bvariants:\s*\[([\s\S]*?)\]/);
console.log("\n--- variants match? ---");
console.log(varMatch ? "MATCHED: " + varMatch[1].substring(0, 200) : "NO MATCH");

// Test regex for reviews
const revMatch = p.raw.match(/\breviews:\s*\[([\s\S]*?)\],\s*qa:/);
console.log("\n--- reviews match (with qa required)? ---");
console.log(revMatch ? "MATCHED: " + revMatch[1].substring(0, 100) : "NO MATCH");

// Test regex for reviews without qa required
const revMatch2 = p.raw.match(/\breviews:\s*\[([\s\S]*?)\]/);
console.log("\n--- reviews match (without qa)? ---");
console.log(revMatch2 ? "MATCHED length: " + revMatch2[1].length : "NO MATCH");
