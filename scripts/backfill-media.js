#!/usr/bin/env node
/* Backfills featured images for seeded posts missing one. Runs detached; logs progress. */
const fs = require("fs");
const path = require("path");
const BASE = (process.env.WP_BASE_URL || "https://dev-tech-pulse-cms.pantheonsite.io").replace(/\/+$/, "");
const USER = (process.env.WP_USERNAME || "").trim();
const PASS = (process.env.WP_APP_PASSWORD || "").trim();
const TIMEOUT = 20000;
const dir = path.join(__dirname, "seed-data");
const POSTS = fs.readdirSync(dir).filter((f) => f.endsWith(".js")).sort().flatMap((f) => require(path.join(dir, f)));
const bySlug = new Map(POSTS.map((p) => [p.slug, p]));
const auth = "Basic " + Buffer.from(USER + ":" + PASS).toString("base64");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function gql(query) {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), TIMEOUT);
  try {
    const r = await fetch(BASE + "/graphql", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }), signal: c.signal });
    return r.json();
  } finally { clearTimeout(t); }
}
async function rest(p, opts = {}) {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), TIMEOUT);
  try {
    const r = await fetch(BASE + "/wp-json/wp/v2" + p, { ...opts, headers: { Authorization: auth, ...(opts.headers || {}) }, signal: c.signal });
    let d = null; try { d = await r.json(); } catch { d = null; }
    return { r, d };
  } finally { clearTimeout(t); }
}
(async () => {
  const j = await gql("{ posts(first: 100) { nodes { databaseId slug featuredImage { node { sourceUrl } } } } }");
  const missing = j.data.posts.nodes.filter((n) => !n.featuredImage && bySlug.has(n.slug));
  console.log(`backfill: ${missing.length} seeded posts without featured image`);
  let ok = 0, fail = 0;
  for (const n of missing) {
    const seed = bySlug.get(n.slug);
    try {
      const c = new AbortController(); const t = setTimeout(() => c.abort(), TIMEOUT);
      let buf, type = "image/jpeg";
      try {
        const dl = await fetch(seed.image, { signal: c.signal, headers: { "User-Agent": "TechPulseSeed/1.0" } });
        if (!dl.ok) throw new Error("img HTTP " + dl.status);
        type = (dl.headers.get("content-type") || "").split(";")[0] || type;
        buf = Buffer.from(await dl.arrayBuffer());
      } finally { clearTimeout(t); }
      const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
      const up = await rest("/media", { method: "POST", headers: { "Content-Type": type, "Content-Disposition": `attachment; filename="techpulse-${n.databaseId}.${ext}"` }, body: buf });
      if (!up.r.ok) throw new Error("upload HTTP " + up.r.status);
      const upd = await rest(`/posts/${n.databaseId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ featured_media: up.d.id }) });
      if (!upd.r.ok) throw new Error("attach HTTP " + upd.r.status);
      ok++;
      console.log(`  ok ${n.slug} (media ${up.d.id})`);
    } catch (e) { fail++; console.log(`  FAIL ${n.slug}: ${e.message}`); }
    await sleep(400);
  }
  console.log(`backfill done: ${ok} attached, ${fail} failed`);
})().catch((e) => { console.error("backfill crashed:", e.message); process.exitCode = 1; });
