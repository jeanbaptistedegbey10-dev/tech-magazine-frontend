import { WORDPRESS_GRAPHQL_ENDPOINT } from "@/lib/wordpress";
import { SiteFooterContent } from "@/components/blog/footer-content";

/**
 * Magazine footer shared by every route.
 *
 * Server component so the CMS endpoint keeps coming straight from the data
 * layer; the translatable body lives in the client `SiteFooterContent`. It
 * mirrors the masthead container (`max-w-[1600px]`) so the edges stay aligned
 * with `<main>`, and both share `PRIMARY_NAV` so the links can never drift.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-10 sm:px-8 lg:px-16">
        <SiteFooterContent endpoint={WORDPRESS_GRAPHQL_ENDPOINT} />
      </div>
    </footer>
  );
}
