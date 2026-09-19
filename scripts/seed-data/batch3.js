const I = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;
module.exports = [
  {
    slug: "react-20-server-components-actions-guide",
    title: "React 20 : Server Components et Actions, le guide de migration sans douleur",
    excerpt: "Le rendu serveur devient la defaut. Comment migrer route par route sans casser votre app ni votre SEO.",
    category: "Development", premium: false, lang: "fr",
    image: I("photo-1633356122544-f134324a6cee"), imageAlt: "Code React sur ecran",
    content: "<p>React 20 inverse la logique : tout est Server Component par defaut, le client devient l'exception. Resultat : des bundles divises par deux sur les apps migrees avec methode. Voici la strategie route par route qui evite le big-bang.</p><h2>La methode en 4 etapes</h2><p>1) Isolez les ilots interactifs avec 'use client'. 2) Remplacez vos fetch useEffect par des Server Components async. 3) Migrez les formulaires vers les Server Actions avec useActionState. 4) Cachez avec unstable_cache et revalidez par tag.</p><ul><li>-52 % de JS median constate sur 40 apps auditees.</li><li>Server Actions + validation Zod cote serveur.</li><li>Streaming avec Suspense par section.</li></ul><p>Piege classique : mettre 'use client' trop haut. Descendez la frontiere au plus pres du bouton, pas de la page.</p>"
  },
  {
    slug: "typescript-7-native-port-performance",
    title: "TypeScript 7's native port is 10x faster — what to change on Monday",
    excerpt: "The Go-based compiler rewrites your CI budget. Migration checklist, breaking changes and new knobs.",
    category: "Development", premium: false, lang: "en",
    image: I("photo-1461749280684-dccba630e2f6"), imageAlt: "Code editor with TypeScript",
    content: "<p>TypeScript 7 (native port, Go-based) cuts check times by an order of magnitude. A 200k-line monorepo that took 4 minutes now checks in 24 seconds. But the new engine is stricter in three places.</p><h2>Monday migration checklist</h2><p>Bump to TS 7, set moduleResolution to bundler, enable erasableSyntaxOnly if you target isolatedDeclarations, then delete half your tsconfig workarounds. Keep tsc --noEmit in CI — it is now cheap enough to run on every push.</p><ul><li>10x faster cold checks, 3x faster watch.</li><li>Stricter narrowing on discriminated unions.</li><li>verbatimModuleSyntax becomes the sane default.</li></ul><p>Biggest win: type-aware linting without the 10-minute penalty. Turn it back on.</p>"
  },
  {
    slug: "nextjs-16-cache-components-partial-prerendering",
    title: "Next.js 16 : Cache Components et PPR, le rendu hybride enfin stable",
    excerpt: "Statique, dynamique et streaming dans la meme page. Patterns concrets pour adopter le PPR sans cauchemar du cache.",
    category: "Development", premium: true, lang: "fr",
    image: I("photo-1555066931-4365d14bab8c"), imageAlt: "Code sur ecran sombre",
    content: "<p>Next.js 16 stabilise les Cache Components et le Partial Prerendering : la coquille statique part en CDN, les ilots dynamiques streament ensuite. Sur TechPulse, le TTFB a chuté de 62 % sur les pages articles.</p><h2>Les 3 patterns qui marchent</h2><p>Suspense par section avec fallback squelette, cacheLife par fraicheur metier ('minutes', 'hours'), et cacheTag + revalidateTag au webhook CMS. Le header de session ne doit jamais contaminer le shell statique : isolez-le dans son propre boundary.</p><ul><li>TTFB -62 % sur pages articles.</li><li>Stale-while-revalidate par tag metier.</li><li>Instrumentation avec connection() et headers().</li></ul><p>Contenu Premium : mise en cache par segment d'audience, jamais dans le shell public.</p>"
  },
  {
    slug: "postgres-18-async-io-vector-search",
    title: "Postgres 18: async I/O and real vector search keep the boring database winning",
    excerpt: "2x read throughput, disk-based HNSW at scale, zero-downtime majors. Why Postgres still eats everything.",
    category: "Development", premium: false, lang: "en",
    image: I("photo-1544383835-bda2bc66a55d"), imageAlt: "Database servers",
    content: "<p>Postgres 18 lands async I/O for 2x read throughput and production-grade disk-based HNSW indexes. Combined with zero-downtime major upgrades, the boring database keeps absorbing workloads that used to need three systems.</p><h2>What to adopt first</h2><p>pgvector 0.9 with iterative scan tuning for RAG under 50ms p99, declarative partitioning defaults, and logical replication slot failover for HA pairs. Skip the exotic extensions until you have measured.</p><ul><li>2x sequential read throughput via async I/O.</li><li>HNSW on disk: 10M vectors per node.</li><li>Zero-downtime major version upgrades.</li></ul><p>Postgres is not exciting. That is the feature.</p>"
  }
];
