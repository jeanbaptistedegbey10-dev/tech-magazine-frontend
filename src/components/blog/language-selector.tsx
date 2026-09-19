"use client";

import { Globe } from "lucide-react";
import { LOCALE_NAMES, LOCALES, type Locale, useTranslation } from "@/lib/i18n";

/**
 * Language switcher — `src/components/blog/language-selector.tsx`.
 *
 * Reads and writes the locale through the `TranslationProvider` context
 * (`setLocale`), so flipping FR / EN / DE re-renders every translated string in
 * place: no `window.location.reload()`, no lost scroll position. The provider
 * persists the choice to `localStorage["techpulse-locale"]` and keeps
 * `<html lang>` in sync.
 */
export function LanguageSelector() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className="flex items-center gap-1.5">
      <Globe className="size-4 text-muted-foreground" aria-hidden="true" />
      <select
        aria-label={t("header.language")}
        value={locale}
        onChange={(event) => {
          const nextLocale = event.target.value as Locale;

          if (nextLocale !== locale) {
            setLocale(nextLocale);
          }
        }}
        className="cursor-pointer rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium text-foreground transition-colors duration-300 hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_NAMES[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
