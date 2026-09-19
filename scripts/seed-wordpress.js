#!/usr/bin/env node
/* TechPulse Phase 1 seed — assembles batches then injects via WP REST. */
const fs = require("fs");
const path = require("path");

const DEFAULT_BASE_URL = "https://dev-tech-pulse-cms.pantheonsite.io";
const PREMIUM_TAG = { name: "Premium", slug: "premium" };
const TIMEOUT_MS = 15000;
const PAUSE_MS = 300;

const argv = process.argv.slice(2);
const flag = (n) => {
  const p = "--" + n + "=";
  const h = argv.find((a) => a.startsWith(p));
  return h ? h.slice(p.length).trim() : undefined;
};
const CFG = {
  dryRun: argv.includes("--dry-run"),
  skipMedia: argv.includes("--skip-media"),
  limit: Math.max(1, parseInt(flag("limit") || "1000", 10) || 1000),
  baseUrl: (flag("base-url") || process.env.WP_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, ""),
  user: (process.env.WP_USERNAME || process.env.WP_USER || "").trim(),
  pass: (process.env.WP_APP_PASSWORD || process.env.WP_PASSWORD || "").trim(),
  status: (flag("status") || process.env.WP_STATUS || "publish").trim() || "publish",
};

const dir = path.join(__dirname, "seed-data");
const ALL_POSTS = fs.readdirSync(dir).filter((f) => f.endsWith(".js")).sort()
  .flatMap((f) => require(path.join(dir, f)));

function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function req(url, opts = {}, auth = true) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), TIMEOUT_MS);
  try {
    const headers = { ...(opts.headers || {}) };
    if (auth) headers.Authorization = "Basic " + Buffer.from(CFG.user + ":" + CFG.pass).toString("base64");
    const res = await fetch(url, { ...opts, headers, signal: c.signal });
    let data = null;
    try { data = await res.json(); } catch { data = null; }
    return { res, data };
  } finally { clearTimeout(t); }
}

async function findTerm(kind, slug) {
  const { res, data } = await req(`${CFG.baseUrl}/wp-json/wp/v2/${kind}?slug=${encodeURIComponent(slug)}&per_page=1`);
  if (!res.ok) throw new Error(`lookup ${kind}:${slug} -> HTTP ${res.status}`);
  return Array.isArray(data) && data.length ? data[0] : null;
}
async function ensureTerm(kind, name, slug) {
  const found = await findTerm(kind, slug);
  if (found) return { id: found.id, created: false };
  const { res, data } = await req(`${CFG.baseUrl}/wp-json/wp/v2/${kind}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, slug }),
  });
  if (!res.ok) throw new Error(`create ${kind}:${slug} -> HTTP ${res.status} ${JSON.stringify(data).slice(0, 300)}`);
  return { id: data.id, created: true };
}
async function sideloadImage(url, title) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), TIMEOUT_MS);
  let buf, type = "image/jpeg";
  try {
    const r = await fetch(url, { signal: c.signal, headers: { "User-Agent": "TechPulseSeed/1.0" } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    type = (r.headers.get("content-type") || "").split(";")[0] || type;
    buf = Buffer.from(await r.arrayBuffer());
  } finally { clearTimeout(t); }
  if (!buf || buf.length < 1024) throw new Error("downloaded file too small");
  const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
  const { res, data } = await req(`${CFG.baseUrl}/wp-json/wp/v2/media`, {
    method: "POST",
    headers: { "Content-Type": type, "Content-Disposition": `attachment; filename="techpulse-${Date.now()}.${ext}"` },
    body: buf,
  });
  if (!res.ok) throw new Error(`media upload -> HTTP ${res.status} ${JSON.stringify(data).slice(0, 300)}`);
  await req(`${CFG.baseUrl}/wp-json/wp/v2/media/${data.id}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, alt_text: title }),
  }, true).catch(() => null);
  return data.id;
}
async function findPost(slug) {
  const { res, data } = await req(`${CFG.baseUrl}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&per_page=1&status=publish,draft,private,future,pending`);
  if (!res.ok) throw new Error(`lookup post:${slug} -> HTTP ${res.status}`);
  return Array.isArray(data) && data.length ? data[0] : null;
}

async function main() {
  const BATCH = Number.parseInt(process.env.SEED_BATCH || flag("batch") || "0", 10) || 0;
  const BATCH_SIZE = Math.max(1, Number.parseInt(process.env.SEED_BATCH_SIZE || flag("batch-size") || "1000", 10) || 1000);
  const POSTS = ALL_POSTS.slice(0, CFG.limit);
  const batches = BATCH > 0 ? chunk(POSTS, BATCH_SIZE) : [POSTS];
  const batchIndex = BATCH > 0 ? (BATCH - 1) % batches.length : 0;
  const queue = BATCH > 0 ? batches[batchIndex] : POSTS;
  const cats = ["Tech News", "Development", "Design", "AI & Cloud"];
  const premium = queue.filter((p) => p.premium).length;
  console.log(`TechPulse seed: ${POSTS.length} stories total, processing batch ${BATCH > 0 ? `${batchIndex + 1}/${batches.length} (${queue.length} stories)` : `all (${queue.length})`}, ${premium} premium in scope.`);
  console.log(`Target: ${CFG.baseUrl} | status=${CFG.status}${CFG.dryRun ? " | DRY-RUN" : ""}${CFG.skipMedia ? " | skip-media" : ""}`);
  const dupes = POSTS.map((p) => p.slug).filter((s, i, a) => a.indexOf(s) !== i);
  if (dupes.length) throw new Error("duplicate slugs: " + dupes.join(", "));
  if (CFG.dryRun) {
    for (const p of queue) console.log(` - [${p.premium ? "PREMIUM" : "free"}] ${p.slug} (${p.category}, ${p.lang})`);
    console.log("Dry-run OK: dataset valid, nothing written.");
    return;
  }
  if (!CFG.user || !CFG.pass) {
    console.error("Missing credentials. Set WP_USERNAME + WP_APP_PASSWORD (or WP_USER/WP_PASSWORD), or run with --dry-run.");
    process.exitCode = 1; return;
  }
  const me = await req(`${CFG.baseUrl}/wp-json/wp/v2/users/me`);
  if (!me.res.ok) throw new Error(`auth failed (HTTP ${me.res.status}). Check user + application password. Body: ${JSON.stringify(me.data).slice(0, 300)}`);
  console.log(`Auth OK: ${me.data.slug || me.data.name} (id ${me.data.id}).`);
  const catIds = {};
  for (const name of cats) {
    const slug = name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const r = await ensureTerm("categories", name, slug);
    catIds[name] = r.id;
    console.log(`${r.created ? "Created" : "Found"} category ${name} (id ${r.id}).`);
    await sleep(PAUSE_MS);
  }
  const tag = await ensureTerm("tags", PREMIUM_TAG.name, PREMIUM_TAG.slug);
  console.log(`${tag.created ? "Created" : "Found"} tag Premium (id ${tag.id}).`);
  let created = 0, updated = 0, mediaOk = 0, failed = 0;
  for (const p of queue) {
    try {
      const existing = await findPost(p.slug);
      let mediaId = existing ? existing.featured_media || 0 : 0;
      if (!CFG.skipMedia && (!mediaId || !existing)) {
        try { mediaId = await sideloadImage(p.image, p.title); mediaOk++; }
        catch (e) { console.warn(`  [media] ${p.slug}: ${e.message} (fallback image will be used)`); }
      }
      const payload = {
        title: p.title, slug: p.slug, content: p.content, excerpt: p.excerpt,
        status: CFG.status, categories: [catIds[p.category]], tags: p.premium ? [tag.id] : [],
        featured_media: mediaId || undefined, meta: { techpulse_lang: p.lang },
      };
      let res, data;
      if (existing) {
        ({ res, data } = await req(`${CFG.baseUrl}/wp-json/wp/v2/posts/${existing.id}`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        }));
        if (!res.ok) throw new Error(`update -> HTTP ${res.status} ${JSON.stringify(data).slice(0, 300)}`);
        updated++;
        console.log(`  updated ${p.slug} (id ${existing.id})${p.premium ? " [PREMIUM]" : ""}`);
      } else {
        ({ res, data } = await req(`${CFG.baseUrl}/wp-json/wp/v2/posts`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        }));
        if (!res.ok) throw new Error(`create -> HTTP ${res.status} ${JSON.stringify(data).slice(0, 300)}`);
        created++;
        console.log(`  created ${p.slug} (id ${data.id})${p.premium ? " [PREMIUM]" : ""}`);
      }
    } catch (e) { failed++; console.error(`  FAILED ${p.slug}: ${e.message}`); }
    await sleep(PAUSE_MS);
  }
  console.log(`Done: ${created} created, ${updated} updated, ${mediaOk} images sideloaded, ${failed} failed.`);
  console.log(`Verify: ${CFG.baseUrl}/graphql (posts, categories, tags) then npm run build.`);
  if (failed) process.exitCode = 1;
}
main().catch((e) => { console.error("Seed failed:", e.message); process.exitCode = 1; });


