// scripts/debug-qa2.cjs
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
const qaRe = /\bqa:\s*\[([\s\S]*?)\]/;
const qaM = mn001.raw.match(qaRe);
const qaBody = qaM[1];

const re =
  /\{\s*id:\s*"([^"]+)",\s*user:\s*"([^"]+)",\s*question:\s*"([\s\S]*?)",\s*answer:\s*"([\s\S]*?)",\s*answeredBy:\s*"([^"]*)",\s*date:\s*"([^"]+)"\s*\}/g;
let q;
let i = 0;
while ((q = re.exec(qaBody))) {
  i++;
  console.log(`Match ${i}:`);
  console.log("  id:", q[1]);
  console.log("  user:", q[2]);
  console.log("  question:", q[3]);
  console.log("  answer:", q[4]);
  console.log("  answeredBy:", q[5]);
  console.log("  date:", q[6]);
}
console.log(`Total QA matches: ${i}`);
