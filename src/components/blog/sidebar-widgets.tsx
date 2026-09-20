"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, Clock, Crown, Megaphone } from "lucide-react";

import type { PostCategory, PostSummary } from "@/lib/wordpress";
import { useTranslation } from "@/lib/i18n";

/**
 * Shared editorial sidebar blocks: Premium upsell, category index,
 * premium picks and sponsor slot. Client components so every label follows
 * the reader's language; interactions stay pure CSS.
 */

/** Premium upsell card for sidebars: gradient rule, benefits, CTA. */
export function PremiumUpsellCard() {
  const { t, tList } = useTranslation();
  const benefits = tList("blog.sidebar.benefits");

  return (
    <aside
      aria-labelledby="sidebar-premium-heading"
      className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-primary/30 bg-card p-6 shadow-xl shadow-primary/10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-[#818cf8] to-primary"
      />
      <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/40">
        <Crown className="size-5" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 id="sidebar-premium-heading" className="text-lg font-semibold tracking-tight text-foreground">
          {t("blog.sidebar.premiumHeading")}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("blog.sidebar.premiumBody")}
        </p>
      </div>
      <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2.5">
            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/subscribe"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors duration-300 hover:bg-primary/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {t("blog.sidebar.ctaPremium")}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </aside>
  );
}

/** Category index with story counts, linking to each desk archive. */
export function CategoryListCard({ categories }: { categories: PostCategory[] }) {
  const { t } = useTranslation();

  if (categories.length === 0) return null;

  return (
    <nav
      aria-labelledby="sidebar-categories-heading"
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
    >
      <h2
        id="sidebar-categories-heading"
        className="text-[0.7rem] font-semibold tracking-[0.22em] text-primary uppercase"
      >
        {t("blog.sidebar.categoriesHeading")}
      </h2>
      <ul className="flex flex-col gap-1">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/blog/category/${category.slug}`}
              className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-300 hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="font-medium text-foreground transition-colors duration-300 group-hover:text-link">
                {category.name}
              </span>
              <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-muted-foreground tabular-nums">
                {category.count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Premium picks: up to 3 premium stories, newest stories as fallback. */
export function PremiumPicksCard({ posts }: { posts: PostSummary[] }) {
  const { t } = useTranslation();
  const premium = posts.filter((post) => post.isPremium).slice(0, 3);
  const picks = premium.length > 0 ? premium : posts.slice(0, 3);

  if (picks.length === 0) return null;

  return (
    <aside
      aria-labelledby="sidebar-picks-heading"
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
    >
      <div className="flex flex-col gap-1.5">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.14em] text-link uppercase">
          <Crown className="size-3" aria-hidden="true" />
          {t("common.premium")}
        </span>
        <h2 id="sidebar-picks-heading" className="text-lg font-semibold tracking-tight text-foreground">
          {t("blog.sidebar.picksHeading")}
        </h2>
      </div>
      <ul className="flex flex-col gap-4">
        {picks.map((post) => (
          <li key={post.id}>
            <Link
              href={post.href}
              className="group flex gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="relative block size-16 shrink-0 overflow-hidden rounded-xl bg-surface">
                <Image
                  src={post.image.src}
                  alt=""
                  fill
                  unoptimized={post.image.unoptimized}
                  sizes="64px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="line-clamp-2 text-sm leading-snug font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover:text-link">
                  {post.title}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3" aria-hidden="true" />
                  {t("common.minutesRead", { count: post.readingTime })}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/subscribe"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-link transition-colors duration-300 hover:text-foreground"
      >
        {t("blog.sidebar.unlockAll")}
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </Link>
    </aside>
  );
}

/** Sponsor slot: dashed partner banner linking to the contact page. */
export function SponsorSlot() {
  const { t } = useTranslation();

  return (
    <aside
      aria-label={t("blog.sidebar.sponsorEyebrow")}
      className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card/70 p-6 text-center"
    >
      <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
        <Megaphone className="size-3.5" aria-hidden="true" />
        {t("blog.sidebar.sponsorEyebrow")}
      </span>
      <p className="text-base font-semibold tracking-tight text-foreground">
        {t("blog.sidebar.sponsorTitle")}
      </p>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {t("blog.sidebar.sponsorBody")}
      </p>
      <Link
        href="/contact"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-link transition-colors duration-300 hover:text-foreground"
      >
        {t("blog.sidebar.sponsorCta")}
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </Link>
    </aside>
  );
}

/**
 * Combined sidebar widgets for category and article pages.
 */
export function SidebarWidgets({ categories, posts }: { categories: PostCategory[]; posts: PostSummary[] }) {
  return (
    <div className="flex flex-col gap-6">
      <PremiumUpsellCard />
      <CategoryListCard categories={categories} />
      <PremiumPicksCard posts={posts} />
      <SponsorSlot />
    </div>
  );
}