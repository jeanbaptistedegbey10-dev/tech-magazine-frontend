const I = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;
module.exports = [
  {
    slug: "rust-2026-serveurs-actix-tokio-retour-experience",
    title: "Rust en 2026 : 2 millions de requetes/seconde avec Actix et Tokio",
    excerpt: "Retour d'experience : comment une API de notifications a divise sa facture EC2 par 6 en passant a Rust.",
    category: "Development", premium: false, lang: "fr",
    image: I("photo-1515879218367-8466d910aaa4"), imageAlt: "Code colore sur ecran",
    content: "<p>Deux millions de requetes par seconde sur 8 vCPU, 40 ms p99, zero GC pause : le passage de Node a Rust (Actix-web + Tokio) a divise par six la facture EC2 d'une API de notifications temps reel. Voici ce qui a vraiment compte.</p><h2>Ce qui a tout change</h2><p>Zero-copy avec bytes::Bytes du socket au broker, backpressure native via bounded channels, et tracing structure avec OpenTelemetry des le jour un. Le borrow checker a ralenti la semaine 1, puis accelere les semaines 4 a 12.</p><ul><li>2M req/s sur 8 vCPU, 40 ms p99.</li><li>Facture EC2 divisee par 6.</li><li>3 incidents memoire elimines par construction.</li></ul><p>Contre-indication : CRUD admin simple. Rust paie sur le chaud, pas sur le tiède.</p>"
  },
  {
    slug: "tailwind-v4-css-first-config-guide",
    title: "Tailwind v4 is CSS-first: theme variables, cascade layers and what to delete",
    excerpt: "No config file, @theme in CSS, automatic content detection. The migration guide in 15 minutes.",
    category: "Development", premium: false, lang: "en",
    image: I("photo-1507721999472-8ed4421c4af2"), imageAlt: "CSS code close-up",
    content: "<p>Tailwind v4 deletes tailwind.config.js: theme tokens live in CSS via @theme, content detection is automatic, and the engine is 5x faster. Migration takes an afternoon if you follow the order.</p><h2>Migration in order</h2><p>Move tokens to @theme, replace @apply-heavy files with utilities, convert plugins to CSS-first variants, then drop autoprefixer. Dynamic utilities like grid-cols-15 now just work.</p><ul><li>5x faster builds, 100x faster incremental.</li><li>@theme with real CSS variables.</li><li>First-party Vite plugin, no PostCSS needed.</li></ul><p>Keep one rule: if you fight the cascade, you are holding it wrong — use @layer.</p>"
  },
  {
    slug: "tests-contrats-pact-microservices-2026",
    title: "Microservices : les tests de contrat (Pact) qui eliminent 80 % des incidents d'integration",
    excerpt: "L'integration continue casse a chaque deploiement ? Les tests consumer-driven changent la donne. Tutoriel complet.",
    category: "Development", premium: true, lang: "fr",
    image: I("photo-1551288049-bebda4e38f71"), imageAlt: "Dashboard de monitoring",
    content: "<p>Quatre equipes, douze services, un deploiement qui casse le checkout chaque vendredi : le classique. Six semaines apres l'adoption des tests de contrat Pact, les incidents d'integration ont chuté de 80 %. Mode d'emploi.</p><h2>Le workflow consumer-driven</h2><p>Le consumer ecrit le contrat attendu (Pact), le provider le verifie a chaque build, le broker bloque tout deploiement incompatible. Can-i-deploy devient la porte de sortie unique du pipeline.</p><ul><li>-80 % d'incidents d'integration en 6 semaines.</li><li>Deploiements independants par equipe.</li><li>Versionnement des contrats dans le broker.</li></ul><p>Contenu Premium : matrices de compatibilite et strategie de deprecation des champs GraphQL.</p>"
  },
  {
    slug: "webassembly-edge-image-processing-rust",
    title: "WebAssembly at the edge: realtime image processing in Rust, 12ms worldwide",
    excerpt: "Same WASM binary on Cloudflare, Fastly and AWS. Architecture, cold starts and cost math inside.",
    category: "Development", premium: false, lang: "en",
    image: I("photo-1518432031352-d6fc5c10da5a"), imageAlt: "Abstract network visualization",
    content: "<p>Resize, AVIF-encode and watermark every image within 12ms at the 300 nearest PoPs: one Rust codebase compiled to WASM runs unchanged on three edge platforms. Bandwidth savings paid for the project in five weeks.</p><h2>Architecture notes</h2><p>wasm32-wasip2 target, 2 MB binary budget, streaming decode to cap memory at 64 MB, SIMD enabled where the host allows. Cold starts under 1ms make per-request isolation free.</p><ul><li>12ms p50 image pipeline worldwide.</li><li>-71 % origin bandwidth.</li><li>One binary, three edge vendors.</li></ul><p>WASI 0.2 finally makes the filesystem, clocks and sockets boring — in the best way.</p>"
  }
];
