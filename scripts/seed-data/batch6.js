const I = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;
module.exports = [
  {
    slug: "motion-design-micro-interactions-framer-motion",
    title: "Motion design : 5 micro-interactions qui rendent une app premium",
    excerpt: "Spring physics, stagger au scroll, zoom image 500ms. Les recettes Framer Motion qui vendent la qualite.",
    category: "Design", premium: false, lang: "fr",
    image: I("photo-1550745165-9bc0b252726f"), imageAlt: "Materiel retro eclaire au neon",
    content: "<p>Les utilisateurs jugent la qualite d'une app en 50 millisecondes, largement sur le mouvement. Cinq micro-interactions font 90 % de l'effet premium : apparition stagger, zoom image au survol, ressort sur les toggles, squelettes qui streament, transitions de page partagees.</p><h2>Les recettes qui marchent</h2><p>Duree 200-500ms, easing easeOut, une seule propriete animee a la fois (transform ou opacity). Respectez prefers-reduced-motion : aucun mouvement decoratif sans alternative statique.</p><ul><li>Fade-up 28px, 550ms, stagger 80ms max.</li><li>Zoom image scale-105 sur 500ms.</li><li>Zero layout-shift pendant l'animation.</li></ul><p>Le motion est un feedback, pas un spectacle : chaque animation doit expliquer un changement d'etat.</p>"
  },
  {
    slug: "design-system-accessibility-audit-checklist",
    title: "Design system accessibility audit: the 25-point checklist we run quarterly",
    excerpt: "Focus order, forced colors, touch targets, motion. The quarterly audit that keeps lawsuits away.",
    category: "Design", premium: true, lang: "en",
    image: I("photo-1572044162444-ad60f128bdea"), imageAlt: "Designer reviewing interface",
    content: "<p>One demand letter costs more than four quarterly audits. Our 25-point checklist covers keyboard paths, forced-colors mode, 44px targets, live-region announcements and reduced-motion fallbacks — with owners and SLAs per item.</p><h2>How the audit runs</h2><p>Automated axe pass on every component, manual screen-reader run on critical flows, forced-colors and 400-percent zoom on release candidates. Findings become versioned ADRs, not Slack threads.</p><ul><li>25 checks, 4 severity levels, 30-day SLA.</li><li>axe + manual NVDA/VoiceOver passes.</li><li>Forced-colors screenshots in CI.</li></ul><p>Premium detail: the full checklist matrix and remediation priority scoring are inside the subscriber edition.</p>"
  },
  {
    slug: "rag-production-chunking-evaluation-fr",
    title: "RAG en production : chunking, evaluation et garde-fous (le guide complet)",
    excerpt: "512 tokens avec overlap, evals toutes les nuits, citations obligatoires. L'architecture RAG qui tient la charge.",
    category: "AI & Cloud", premium: true, lang: "fr",
    image: I("photo-1620712943543-bcc4688e7485"), imageAlt: "Reseau de neurones lumineux",
    content: "<p>Un RAG de demo repond bien ; un RAG de production doit prouver chaque reponse. L'architecture qui tient : chunks de 512 tokens avec 15 % d'overlap, hybride dense + BM25, re-ranking, citations inline obligatoires et evals nocturnes sur golden dataset.</p><h2>Les decisions qui comptent</h2><p>Le chunking semantique bat le fixe sur la doc technique (+18 % de recall). Le re-ranker cross-encoder coute 40ms mais divise par deux les hallucinations citees. Sans evals versionnees, chaque changement de prompt est un saut dans le vide.</p><ul><li>Chunks 512 tokens, overlap 15 %.</li><li>Hybride dense + BM25, re-rank top-50.</li><li>Evals nocturnes : faithfulness + recall.</li></ul><p>Contenu Premium : templates d'evals, seuils d'alerte et strategie de refresh des embeddings.</p>"
  },
  {
    slug: "kubernetes-cost-optimization-karpenter-guide",
    title: "Kubernetes bills keep growing? Karpenter, rightsizing and the 40% cut",
    excerpt: "Bin-packing, spot consolidation, idle namespace hunts. The FinOps playbook that actually shrinks the invoice.",
    category: "AI & Cloud", premium: false, lang: "en",
    image: I("photo-1451187580459-43490279c0fa"), imageAlt: "Cloud infrastructure from above",
    content: "<p>The average cluster runs at 28 percent CPU request utilization — you pay for air. Karpenter consolidation plus VPA-guided rightsizing cut one SaaS bill by 41 percent in six weeks without a single incident.</p><h2>The playbook</h2><p>Consolidate with Karpenter disruption budgets, move batch to spot with checkpointing, expire idle namespaces automatically, and charge back per team with OpenCost. Requests must mirror p95 usage, not guesses.</p><ul><li>-41 % compute in six weeks.</li><li>Spot for batch, on-demand for serving.</li><li>OpenCost chargeback per team.</li></ul><p>FinOps is a weekly habit, not a yearly negotiation.</p>"
  }
];
