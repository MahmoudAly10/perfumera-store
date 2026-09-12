// scripts/debug-qa.cjs
const fs = require("fs");
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

const mn001 = blocks.find(b => b.id === "mn-001");
console.log("Last 700 chars of mn-001 raw:");
console.log(mn001.raw.substring(mn001.raw.length - 700));

// Now test QA regex
const qaRe = /\bqa:\s*\[([\s\S]*?)\]/;
const qaM = mn001.raw.match(qaRe);
console.log("\nqa regex match?");
console.log(qaM ? "YES: " + qaM[1].substring(0, 300) : "NO");

// Try matching just up to next ]
const qaRe2 = /\bqa:\s*\[([\s\S]*?)\](?=\s*,|\s*$|\s*\n)/;
const qaM2 = mn001.raw.match(qaRe2);
console.log("\nqa regex2 match?");
console.log(qaM2 ? "YES: " + qaM2[1].substring(0, 300) : "NO");
