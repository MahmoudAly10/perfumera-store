// scripts/gen-seed.cjs
// Generate supabase/migrations/08_seed.sql from lib/data.ts.
// Run: node scripts/gen-seed.cjs

const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "..", "perfumeria", "lib", "data.ts");
const src = fs.readFileSync(dataPath, "utf8");

// Slice the BRANDS array out of data.ts
function extractArray(name) {
  const re = new RegExp(
    `export const ${name}[^=]*=\\s*\\[([\\s\\S]*?)\\n\\];`,
    "m"
  );
  const m = src.match(re);
  if (!m) throw new Error(`Could not find ${name} in data.ts`);
  return m[1];
}

// Quick-and-dirty eval of the array literal (single-quoted strings only — fine
// for our data.ts which uses double quotes everywhere).
function parseObjectLiteral(body) {
  // Convert TS object literal to JSON-ish then JSON.parse.
  // Steps: wrap keys with quotes if missing, replace single quotes if any.
  let s = body
    .replace(/'/g, '"')                                  // ' -> "
    .replace(/([\{,\s])([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":') // unquoted keys
    .replace(/,(\s*[}\]])/g, "$1");                       // trailing commas
  return JSON.parse("{" + s + "}");
}

// ---------- brands ----------
const brandsBody = extractArray("BRANDS");
const brands = [];
const brandRe = /\{\s*id:\s*"([^"]+)",([\s\S]*?)\n\s*\}/g;
let bm;
while ((bm = brandRe.exec(brandsBody))) {
  brands.push({ id: bm[1], raw: bm[2] });
}

// Parse brand name/country/founded from each entry using a tolerant regex.
function parseBrand(entry) {
  const name = (entry.raw.match(/name:\s*"([^"]+)"/) || [])[1] || entry.id;
  const description =
    (entry.raw.match(/description:\s*"([^"]+)"/) || [])[1] || "";
  const country = (entry.raw.match(/country:\s*"([^"]+)"/) || [])[1] || "";
  const founded = parseInt(
    (entry.raw.match(/founded:\s*(\d+)/) || [])[1] || "null",
    10
  );
  return { id: entry.id, name, description, country, founded };
}
const brandRows = brands.map(parseBrand);

// ---------- products ----------
const productsBody = extractArray("PRODUCTS");
const productBlocks = [];
// Line-based scan: top-level product IDs are at exactly 4-space indent.
// We grab the body until the next such line or the closing `];`.
const lines = productsBody.split("\n");
let cur = null;
let body = [];
for (const line of lines) {
  const topId = line.match(/^    id:\s*"([^"]+)",\s*$/);
  if (topId) {
    if (cur) productBlocks.push({ id: cur, raw: body.join("\n") });
    cur = topId[1];
    body = [];
  } else if (cur) {
    body.push(line);
  }
}
if (cur) productBlocks.push({ id: cur, raw: body.join("\n") });

function esc(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  // string
  return "'" + String(v).replace(/'/g, "''") + "'";
}
function arr(a) {
  if (!Array.isArray(a) || a.length === 0) return "'{}'";
  return "ARRAY[" + a.map((x) => esc(x)).join(",") + "]";
}

const out = [];
out.push("-- 08_seed.sql");
out.push("-- Generated from perfumeria/lib/data.ts — 8 brands + 24 products + reviews/QA/variants + 4 promo codes.");
out.push("-- Run AFTER 01..07 are applied. Idempotent: truncates catalog tables first.");
out.push("");
out.push("begin;");
out.push("");
out.push("-- Wipe catalog tables (keeps profiles, orders, etc.)");
out.push("truncate table public.product_qa        cascade;");
out.push("truncate table public.product_reviews   cascade;");
out.push("truncate table public.product_variants  cascade;");
out.push("truncate table public.products          cascade;");
out.push("truncate table public.brands            cascade;");
out.push("truncate table public.promo_codes       cascade;");
out.push("");

// Brands
out.push("-- ===== Brands =====");
for (const b of brandRows) {
  out.push(
    `insert into public.brands (slug, name, description, country, founded) values (${esc(b.id)}, ${esc(b.name)}, ${esc(b.description)}, ${esc(b.country)}, ${b.founded});`
  );
}
out.push("");

// Helper: extract one product block
function getField(raw, name) {
  const re = new RegExp(`(?:^|,\\s*)\\s*${name}:\\s*"([^"]+)"`, "m");
  return (raw.match(re) || [])[1] || null;
}
function getFieldNum(raw, name) {
  const re = new RegExp(`(?:^|,\\s*)\\s*${name}:\\s*([\\d.]+)`, "m");
  const v = (raw.match(re) || [])[1];
  return v === undefined ? null : parseFloat(v);
}
function getFieldBool(raw, name) {
  return new RegExp(`(?:^|,\\s*)\\s*${name}:\\s*true`).test(raw);
}
function getArrayField(raw, name) {
  const m = raw.match(new RegExp(`${name}:\\s*\\[([^\\]]*?)\\]`, "s"));
  if (!m) return [];
  return Array.from(m[1].matchAll(/"([^"]+)"/g)).map((x) => x[1]);
}
function getNestedArray(raw, name) {
  // Variants: [{ size, price, stock }, ...]
  const m = raw.match(new RegExp(`\\b${name}:\\s*\\[([\\s\\S]*?)\\]`, "m"));
  if (!m) return [];
  const out = [];
  const re = /\{\s*size:\s*"([^"]+)",\s*price:\s*([\d.]+),\s*stock:\s*(\d+)/g;
  let v;
  while ((v = re.exec(m[1]))) {
    out.push({ size: v[1], price: parseFloat(v[2]), stock: parseInt(v[3], 10) });
  }
  return out;
}
function getReviews(raw) {
  // match reviews: [ { ... }, ... ]
  const m = raw.match(/\breviews:\s*\[([\s\S]*?)\],\s*qa:/);
  if (!m) return [];
  const out = [];
  const re =
    /\{\s*id:\s*"([^"]+)",\s*user:\s*"([^"]+)",\s*avatar:\s*"([^"]*)",\s*rating:\s*(\d+),\s*date:\s*"([^"]+)",\s*title:\s*"([^"]*)",\s*body:\s*"([\s\S]*?)",([\s\S]*?)\}/g;
  let r;
  while ((r = re.exec(m[1]))) {
    const [, id, user, avatar, rating, date, title, body, tail] = r;
    const photos = (tail.match(/photos:\s*\[([^\]]*?)\]/) || [, "[]"])[1];
    const photoArr = Array.from(photos.matchAll(/"([^"]+)"/g)).map((x) => x[1]);
    const verified = /verified:\s*true/.test(tail);
    const helpful = parseInt((tail.match(/helpful:\s*(\d+)/) || [, "0"])[1], 10);
    const unhelpful = parseInt(
      (tail.match(/unhelpful:\s*(\d+)/) || [, "0"])[1],
      10
    );
    out.push({
      id, user, avatar, rating: parseInt(rating, 10), date, title, body,
      photos: photoArr, verified, helpful, unhelpful,
    });
  }
  return out;
}
function getQA(raw) {
  const m = raw.match(/\bqa:\s*\[([\s\S]*?)\]/);
  if (!m) return [];
  const out = [];
  const re =
    /\{\s*id:\s*"([^"]+)",\s*user:\s*"([^"]+)",\s*question:\s*"([\s\S]*?)",\s*answer:\s*"([\s\S]*?)",\s*answeredBy:\s*"([^"]*)",\s*date:\s*"([^"]+)"\s*,?\s*\}/g;
  let q;
  while ((q = re.exec(m[1]))) {
    out.push({
      id: q[1], user: q[2], question: q[3], answer: q[4], answeredBy: q[5], date: q[6],
    });
  }
  return out;
}
function getImages(raw) {
  const m = raw.match(/images:\s*\[([^\]]*?)\]/);
  if (!m) return [];
  return Array.from(m[1].matchAll(/img\("([^"]+)"\)/g)).map((x) => x[1]);
}

// ---------- Products ----------
out.push("-- ===== Products =====");
let productCount = 0;
for (const pb of productBlocks) {
  const raw = pb.raw;
  const slug = getField(raw, "slug");
  const name = getField(raw, "name");
  const brandName = getField(raw, "brand");
  const category = getField(raw, "category");
  const gender = getField(raw, "gender");
  const concentration = getField(raw, "concentration");
  const description = getField(raw, "description") || "";
  const brandStory = getField(raw, "brandStory") || "";
  const longevity = getField(raw, "longevity");
  const sillage = getField(raw, "sillage");
  const rating = getFieldNum(raw, "rating") || 0;
  const reviewCount = getFieldNum(raw, "reviewCount") || 0;
  const isNew = getFieldBool(raw, "isNew");
  const isBestseller = getFieldBool(raw, "isBestseller");
  const isFeatured = getFieldBool(raw, "isFeatured");
  const isOnSale = getFieldBool(raw, "isOnSale");
  const originalPrice = getFieldNum(raw, "originalPrice");
  const scentFamilies = getArrayField(raw, "scentFamily");
  const topNotes = getArrayField(raw, "topNotes");
  const heartNotes = getArrayField(raw, "heartNotes");
  const baseNotes = getArrayField(raw, "baseNotes");
  const tags = getArrayField(raw, "tags");
  const variants = getNestedArray(raw, "variants");
  const images = getImages(raw);
  const reviews = getReviews(raw);
  const qa = getQA(raw);

  out.push(
    `insert into public.products (slug, name, brand_id, category, gender, concentration, scent_families, description, brand_story, top_notes, heart_notes, base_notes, longevity, sillage, rating, review_count, is_new, is_bestseller, is_featured, is_on_sale, original_price, tags, images) values (${esc(slug)}, ${esc(name)}, (select id from public.brands where name = ${esc(brandName)} limit 1), ${esc(category)}::product_category, ${esc(gender)}::gender_t, ${esc(concentration)}::concentration, ${arr(scentFamilies)}, ${esc(description)}, ${esc(brandStory)}, ${arr(topNotes)}, ${arr(heartNotes)}, ${arr(baseNotes)}, ${esc(longevity)}::longevity_t, ${esc(sillage)}::sillage_t, ${rating}, ${reviewCount}, ${isNew}, ${isBestseller}, ${isFeatured}, ${isOnSale}, ${originalPrice === null ? "NULL" : originalPrice}, ${arr(tags)}, ${arr(images)});`
  );
  productCount++;

  for (const v of variants) {
    out.push(
      `insert into public.product_variants (product_id, size, price, stock) values ((select id from public.products where slug = ${esc(slug)} limit 1), ${esc(v.size)}, ${v.price}, ${v.stock});`
    );
  }
  for (const r of reviews) {
    out.push(
      `insert into public.product_reviews (product_id, user_name, avatar, rating, review_date, title, body, photos, verified, helpful, unhelpful) values ((select id from public.products where slug = ${esc(slug)} limit 1), ${esc(r.user)}, ${esc(r.avatar)}, ${r.rating}, ${esc(r.date)}::date, ${esc(r.title)}, ${esc(r.body)}, ${arr(r.photos)}, ${r.verified}, ${r.helpful}, ${r.unhelpful});`
    );
  }
  for (const q of qa) {
    out.push(
      `insert into public.product_qa (product_id, user_name, question, answer, answered_by, qa_date) values ((select id from public.products where slug = ${esc(slug)} limit 1), ${esc(q.user)}, ${esc(q.question)}, ${esc(q.answer)}, ${esc(q.answeredBy)}, ${esc(q.date)}::date);`
    );
  }
}
out.push("");

// Promo codes (hard-coded — only 4)
out.push("-- ===== Promo codes =====");
out.push(
  `insert into public.promo_codes (code, type, value, min_order, description, expires_at) values ('WELCOME10', 'percent', 10, 50, '10% off your first order over $50', '2026-12-31 23:59:59+00');`
);
out.push(
  `insert into public.promo_codes (code, type, value, min_order, description, expires_at) values ('SCENT20', 'percent', 20, 150, '20% off orders over $150', '2026-12-31 23:59:59+00');`
);
out.push(
  `insert into public.promo_codes (code, type, value, min_order, description, expires_at) values ('GIFT15', 'fixed', 15, 75, '$15 off gift sets over $75', '2026-12-31 23:59:59+00');`
);
out.push(
  `insert into public.promo_codes (code, type, value, min_order, description, expires_at) values ('OUD25', 'percent', 25, 200, '25% off oud collection over $200', '2026-12-31 23:59:59+00');`
);
out.push("");

out.push("commit;");
out.push("");
out.push(`-- ${brandRows.length} brands, ${productCount} products seeded.`);

const sql = out.join("\n");
const outPath = path.join(
  __dirname,
  "..",
  "supabase",
  "migrations",
  "08_seed.sql"
);
fs.writeFileSync(outPath, sql, "utf8");
console.log(`Wrote ${outPath} — ${brandRows.length} brands, ${productCount} products, ${out.length} lines.`);
