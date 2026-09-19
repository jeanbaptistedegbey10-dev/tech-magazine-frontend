const I = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;
module.exports = [
  {
    slug: "design-system-tokens-figma-code-gouvernance",
    title: "Design system : des tokens Figma au code, la gouvernance qui tient",
    excerpt: "Style Dictionary, alias semantiques, CI qui casse quand le token derive. Le pipeline qui reconcilie designers et devs.",
    category: "Design", premium: false, lang: "fr",
    image: I("photo-1561070791-2526d30994b5"), imageAlt: "Outils de design sur bureau",
    content: "<p>Le design system meurt toujours au meme endroit : entre Figma et le code. La parade : un pipeline de tokens versionnes (Style Dictionary), des alias semantiques stables et une CI qui casse quand un token derive sans spec.</p><h2>Le pipeline en 3 couches</h2><p>Primitifs (indigo-500), semantiques (bg-brand), composants (button-bg). Figma Variables exporte les primitifs, Style Dictionary genere CSS, iOS et Android. Un diff de tokens commente automatiquement la PR.</p><ul><li>1 source de verite : Tokens Studio + GitHub.</li><li>Contraste AA verifie en CI sur chaque alias.</li><li>Dark mode = alias, jamais de valeur en dur.</li></ul><p>Regle d'or : on ne debats plus des hexadecimaux en revue, seulement des usages.</p>"
  },
  {
    slug: "ux-ai-chatbots-patterns-that-work",
    title: "Chatbot UX in 2026: 7 patterns that actually keep users",
    excerpt: "Suggested actions beat blank inputs, citations beat confidence. What 40 audited AI assistants teach us.",
    category: "Design", premium: false, lang: "en",
    image: I("photo-1581291518857-4e27b48ff24e"), imageAlt: "UX wireframes and interface sketches",
    content: "<p>We audited 40 AI assistants: the ones users keep share seven patterns — from suggestion chips to inline citations. The blank prompt box alone loses 60 percent of first-time users.</p><h2>Patterns that retain</h2><p>Start with three suggested tasks, stream with graceful skeletons, cite every factual claim inline, and always offer a one-click human handoff. Undo must work on every AI action, no exceptions.</p><ul><li>+34 % activation with starter suggestions.</li><li>Citations cut perceived errors by half.</li><li>Undo on all AI writes, always.</li></ul><p>The best AI UX hides the AI: users remember outcomes, not models.</p>"
  },
  {
    slug: "dark-mode-accessibilite-contrastes-2026",
    title: "Dark mode et accessibilite : le guide des contrastes qui passent vraiment l'audit",
    excerpt: "Vos gris sur fond sombre echouent au WCAG AA ? Methode, palette et outils pour un dark mode inclusif.",
    category: "Design", premium: true, lang: "fr",
    image: I("photo-1558655146-9f40138edfeb"), imageAlt: "Palette de design sombre",
    content: "<p>80 % des dark modes audites echouent au contraste AA sur les textes secondaires. Le piege : un gris qui passe sur blanc s'effondre sur fond #0F172A. Voici la methode pour une palette sombre qui passe l'audit du premier coup.</p><h2>La methode 3 paliers</h2><p>Texte principal a 15:1 minimum, secondaire a 7:1 (visez AAA, l'AA a 4.5:1 est un plancher), desactive jamais sous 3:1 avec icone de renfort. Testez a 200 % de zoom et en plein soleil simule.</p><ul><li>Secondaires : #94A3B8 sur #0F172A = 7:1, valide.</li><li>Focus visible : anneau 2px + offset, toujours.</li><li>Ne communiquez jamais par la couleur seule.</li></ul><p>Contenu Premium : matrice complete des 24 alias valides et script d'audit CI.</p>"
  },
  {
    slug: "typography-scale-editorial-interfaces",
    title: "Editorial typography for dashboards: a scale that survives real data",
    excerpt: "Fluid type scales, tabular numerals, line-length guards. Make dense interfaces readable again.",
    category: "Design", premium: false, lang: "en",
    image: I("photo-1618005182384-a83a8bd57fbe"), imageAlt: "Abstract 3D typography render",
    content: "<p>Dashboards inherit marketing type scales and collapse under real data: truncated labels, jittery numbers, 200-character lines. A four-step editorial scale fixes it — if you enforce the guards.</p><h2>The scale</h2><p>Display for empty states only, headline for sections, title for cards, body capped at 68 characters. Tabular numerals everywhere numbers align; never animate layout with font swaps.</p><ul><li>Fluid clamp() scale, 4 steps max.</li><li>tabular-nums on tables and KPIs.</li><li>max-width 68ch on every prose block.</li></ul><p>Typography is the cheapest performance and accessibility win you are not shipping.</p>"
  }
];
