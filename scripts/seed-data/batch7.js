const I = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;
module.exports = [
  {
    slug: "finetuning-llm-lora-qlora-pme-budget",
    title: "Fine-tuner un LLM avec 500 euros : LoRA, QLoRA et datasets qui marchent",
    excerpt: "Une RTX 4090, 10 000 paires instruction-reponse, 6 heures d'entrainement. Le fine-tuning a portee de PME.",
    category: "AI & Cloud", premium: false, lang: "fr",
    image: I("photo-1485827404703-89b55fcc595e"), imageAlt: "Robot humanoide blanc",
    content: "<p>Pas besoin d'un cluster : un 8B quantifie en 4 bits, des adaptateurs LoRA rang 16 et 10 000 exemples metier suffisent a depasser le modele generaliste sur vos taches. Budget total : 500 euros de GPU cloud.</p><h2>La recette validee</h2><p>Base 8B instruct, QLoRA 4-bit, 3 epoques, learning rate 2e-4, eval toutes les 200 steps sur 300 exemples geles. Le secret n'est pas le rang, c'est la qualite des paires : 1 000 exemples parfaits battent 50 000 approximatifs.</p><ul><li>Budget : ~500 euros, 6h sur 1xH100.</li><li>Dataset : 10 000 paires, dedupliquees.</li><li>Fusion LoRA volontairement retardee.</li></ul><p>Gardez le socle fige et versionnez les adaptateurs par metier : le rollback prend 30 secondes.</p>"
  },
  {
    slug: "serverless-gpu-inference-scale-to-zero-2026",
    title: "Serverless GPU inference in 2026: scale-to-zero without the cold-start pain",
    excerpt: "1.2s cold starts on 70B, per-second billing, snapshot pools. When serverless GPUs beat dedicated instances.",
    category: "AI & Cloud", premium: false, lang: "en",
    image: I("photo-1518432031352-d6fc5c10da5a"), imageAlt: "Abstract compute visualization",
    content: "<p>Serverless GPUs finally cross the chasm: snapshot pools hold warm weight shards, so a 70B model answers its first token in 1.2 seconds from zero — billed per second. Spiky traffic (demos, batch nights) now costs a third of reserved instances.</p><h2>When it wins</h2><p>Utilization under 35 percent, spiky or scheduled traffic, multi-region failover without idle fleets. Above 60 percent sustained, reserved capacity still wins — run the math quarterly.</p><ul><li>1.2s cold start on 70B class models.</li><li>Per-second billing, zero idle cost.</li><li>Snapshot pools across 12 regions.</li></ul><p>Keep one reserved pool for the baseline, burst the rest to serverless.</p>"
  },
  {
    slug: "observabilite-llm-langfuse-tracing-couts",
    title: "Observabilite LLM : tracer chaque token avec Langfuse sans exploser les couts",
    excerpt: "Latence par etape, cout par user, dataset d'evals auto. L'observabilite qui rend les agents debuggables.",
    category: "AI & Cloud", premium: true, lang: "fr",
    image: I("photo-1551288049-bebda4e38f71"), imageAlt: "Dashboard d'observabilite",
    content: "<p>Un agent qui echoue sans trace est indebuggable. L'observabilite LLM instrumente chaque etape : latence, tokens, cout, score de pertinence. Les equipes qui l'adoptent divisent par trois leur MTTR sur les incidents IA.</p><h2>Le setup minimal qui change tout</h2><p>Trace par conversation, span par tool-call, attributs metier (tenant, use-case), echantillonnage 100 % sur erreurs et 5 % sinon. Alertes sur cout par utilisateur et taux de refus de l'evaluateur.</p><ul><li>MTTR incidents IA divise par 3.</li><li>Cout/token/user suivi en temps reel.</li><li>Evals auto sur 10 % du trafic.</li></ul><p>Contenu Premium : dashboards prets a l'emploi, budgets d'erreur par agent et runbooks d'incident.</p>"
  },
  {
    slug: "terraform-opentofu-state-management-2026",
    title: "Terraform vs OpenTofu in 2026: state, drift and the migration decision",
    excerpt: "License scars healed, backends matured. A decision framework plus the zero-downtime migration path.",
    category: "AI & Cloud", premium: false, lang: "en",
    image: I("photo-1555066931-4365d14bab8c"), imageAlt: "Infrastructure code on screen",
    content: "<p>Two years after the fork, OpenTofu matches Terraform feature-for-feature with state encryption and provider iteration that some teams prefer. The choice now hinges on registry, support contracts and team habits — not capability gaps.</p><h2>Decision framework</h2><p>Stay if Sentinel policies and vendor support anchor your compliance; move if MPL licensing and community velocity matter more. Either way: remote state with locking, drift detection nightly, plan on every PR.</p><ul><li>Zero-downtime migration: state mv in place.</li><li>Drift detection nightly, alert on unmanaged.</li><li>Module pinning with SHA, always.</li></ul><p>The tool matters less than the discipline: small blast radiuses beat clever backends.</p>"
  }
];
