import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";

import { PostCard } from "@/components/blog/post-card";
import { toPostSummaries } from "@/lib/wordpress";
import type { Post } from "@/lib/wordpress";
/** Home-page desk band: header, 3-card grid and view-all CTA. */
export function CategorySection({ eyebrow, title, description, categorySlug, posts }: { eyebrow: string; title: string; description: string; categorySlug: string; posts: Post[] }) {
  if (posts.length === 0) return null;
  return (
    <section aria-labelledby={`home-desk-${categorySlug}`} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div className="flex max-w-2xl flex-col gap-2">
          <span className="text-[0.7rem] font-semibold tracking-[0.22em] text-primary uppercase">{eyebrow}</span>
          <h2 id={`home-desk-${categorySlug}`} className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <Link href={`/blog/category/${categorySlug}`} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors duration-300 hover:border-primary/60 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          Tout voir
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
        {toPostSummaries(posts).slice(0, 3).map((post, index) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </div>
    </section>
  );
}

/** Wide partner banner inserted between home-page sections. */
export function HomeSponsorBanner({ title = "TechPulse Partner Zone", body = "Votre produit devant 40 000 lecteurs tech — bannière partenaire, sans traceurs." }: { title?: string; body?: string }) {
  return (
    <aside aria-label="Advertisement" className="relative flex flex-col items-center gap-3 overflow-hidden rounded-3xl border border-dashed border-border bg-card/70 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
      <span className="absolute top-4 right-6 inline-flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
        <Megaphone className="size-3.5" aria-hidden="true" />
        Ad · Advertisement
      </span>
      <div className="flex max-w-2xl flex-col gap-1.5">
        <p className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
      <Link href="/contact" className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-300 hover:border-primary/60 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        Devenir partenaire
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </aside>
  );
}
