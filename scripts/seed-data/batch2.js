const I = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;
module.exports = [
  {
    slug: "openai-gpt-5-enterprise-agents-securite",
    title: "GPT-5 en entreprise : agents autonomes, mais gouvernance obligatoire",
    excerpt: "Les agents IA executent des workflows complets. DSI : ce qu'il faut cadrer avant de brancher GPT-5 a vos donnees.",
    category: "Tech News", premium: true, lang: "fr",
    image: I("photo-1677442136019-21780ecad995"), imageAlt: "Interface d'intelligence artificielle",
    content: "<p>Les premiers deploiements de GPT-5 en entreprise montrent des gains de 30 % sur le traitement des tickets complexes, mais aussi des derapages quand l'agent dispose d'acces trop larges. La CNIL rappelle que chaque action automatisee doit etre tracée et reversible.</p><h2>Le kit de survie du DSI</h2><p>Bac a sable par departement, revue humaine au-dela de 500 euros d'engagement, journalisation integrale des tool-calls. Les entreprises les plus avancees nomment un responsable agent attitre par direction metier.</p><ul><li>30 % de tickets resolus sans intervention humaine.</li><li>Permissions en moindre-privilege obligatoires.</li><li>Audit trimestriel des prompts systeme.</li></ul><p>Les editeurs promettent des agents certifies ISO 42001 d'ici la fin de l'annee.</p>"
  },
  {
    slug: "fairphone-6-modular-repairability-launch",
    title: "Fairphone 6 bets on repairability while flagships chase thinness",
    excerpt: "Ten-year spare parts, screwdriver in the box, mid-range price. The contrarian bet gaining ground in Europe.",
    category: "Tech News", premium: false, lang: "en",
    image: I("photo-1511707171634-5f897ff02aa9"), imageAlt: "Smartphone on a desk",
    content: "<p>While flagships shave fractions of a millimeter, Fairphone 6 ships with a screwdriver, ten years of spare parts and a five-year warranty. Sales doubled in Germany and the Netherlands last quarter.</p><h2>Regulation as tailwind</h2><p>The EU right-to-repair directive and battery rules reward exactly this design: removable back, labeled modules, publicly priced spares. Repair scores now appear next to prices in French retail.</p><ul><li>399 euros, 5 years of OS updates.</li><li>Screen swap in under 10 minutes.</li><li>Recycled tin, tungsten and fairtrade gold.</li></ul><p>The camera still trails flagships, but for one buyer in five, repairability now outweighs megapixels.</p>"
  },
  {
    slug: "datacenter-nucleaire-smr-ia-energie-france",
    title: "IA et energie : la France mise sur les mini-reacteurs pres des datacenters",
    excerpt: "Des SMR adosses aux campus GPU pour absorber la vague IA. 3 GW de projets annonces, mise en service visee 2031.",
    category: "Tech News", premium: false, lang: "fr",
    image: I("photo-1473341304170-971dccb5ac1e"), imageAlt: "Pylones electriques au coucher du soleil",
    content: "<p>Face a des campus GPU consommant chacun l'equivalent d'une ville moyenne, la France accelere les petits reacteurs modulaires installes au plus pres des datacenters. Trois gigawatts de projets sont annonces, avec une premiere mise en service visee en 2031.</p><h2>Pourquoi coller le reacteur au datacenter</h2><p>Electricite pilotable 24/7, raccordement simplifie, chaleur fatale reutilisee pour les reseaux urbains. Les hyperscalers signent des contrats de 20 ans qui securisent le financement des SMR.</p><ul><li>3 GW de projets SMR adosses au numerique.</li><li>PPA de 20 ans signes avec deux hyperscalers.</li><li>Objectif : PUE sous 1,15 avec free-cooling.</li></ul><p>Reste l'acceptabilite locale et les delais de surete, scrutés de pres par l'ASN.</p>"
  },
  {
    slug: "mistral-large-3-open-weights-europe",
    title: "Mistral Large 3 goes open-weights, Europe gets its frontier model",
    excerpt: "128k context, Apache 2.0 license, EU-hosted weights. Why CTOs are re-running their build-versus-buy math.",
    category: "Tech News", premium: true, lang: "en",
    image: I("photo-1620712943543-bcc4688e7485"), imageAlt: "AI concept with glowing network",
    content: "<p>Mistral released Large 3 under Apache 2.0: 128k context, strong multilingual scores and weights hostable inside the EU. Regulated industries suddenly have a credible on-prem frontier option.</p><h2>What changes for CTOs</h2><p>Data residency solved by construction, fine-tuning without per-token fees, and an escape hatch from single-vendor lock-in. Early benchmarks place it within 5 points of closed leaders on enterprise tasks.</p><ul><li>Apache 2.0 weights, commercial use allowed.</li><li>EU hosting with zero data retention options.</li><li>Distilled 8B and 24B siblings for edge.</li></ul><p>The moat moves up the stack: evals, guardrails and domain data now decide who wins.</p>"
  }
];
