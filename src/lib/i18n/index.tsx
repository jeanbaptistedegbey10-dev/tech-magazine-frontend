"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

import de from "./locales/de.json";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

export type Locale = "fr" | "en" | "de";

export const LOCALES: Locale[] = ["fr", "en", "de"];

export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_NAMES: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  de: "Deutsch",
};

export const SUPPORTED_LOCALES: Record<string, Locale> = {
  fr: "fr",
  en: "en",
  de: "de",
};

/** `localStorage` key holding the reader's chosen locale. */
const LOCALE_STORAGE_KEY = "techpulse-locale";

/** Same-tab change notification (`storage` only fires in *other* tabs). */
const LOCALE_CHANGE_EVENT = "techpulse:locale";

/**
 * Static JSON imports resolve at build time and keep the router free of
 * `require()` — the lint rule in this project forbids it, and all three
 * dictionaries were already bundled together before.
 */
const DICTIONARIES: Record<Locale, unknown> = { fr, en, de };

const getTranslations = (locale: Locale): unknown =>
  DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];

/**
 * Locale the browser asks for: the persisted choice first, then the browser
 * language, then the French default. Read on every store snapshot, so it never
 * goes stale.
 */
function readStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;

    if (stored && SUPPORTED_LOCALES[stored]) {
      return stored;
    }
  } catch {
    /* Storage can be unavailable (private mode, blocked cookies) — fall through. */
  }

  const browserLang = (window.navigator.language || "").toLowerCase();

  if (browserLang.startsWith("de")) return "de";
  if (browserLang.startsWith("en")) return "en";

  return DEFAULT_LOCALE;
}

/**
 * Subscribes to locale changes from the outside world: other tabs
 * (`storage`) and the in-page switch (`LOCALE_CHANGE_EVENT`).
 */
function subscribeToLocale(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(LOCALE_CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LOCALE_CHANGE_EVENT, onChange);
  };
}

/** Server / hydration snapshot: always the default locale (no mismatch). */
const getServerLocale = (): Locale => DEFAULT_LOCALE;

type TranslationContextValue = {
  locale: Locale;
  /**
   * Switches the locale for the whole application.
   *
   * Exposed on the context so the `LanguageSelector` can change the language
   * instantly — no `window.location.reload()`, no lost scroll position — while
   * the choice is persisted to `localStorage` and `<html lang>` follows.
   */
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  /** Resolves a translated array of strings (e.g. bullet lists). */
  tList: (key: string) => string[];
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}

type TranslationProviderProps = {
  children: React.ReactNode;
  defaultLocale?: Locale;
};

export function TranslationProvider({
  children,
  defaultLocale = DEFAULT_LOCALE,
}: TranslationProviderProps) {
  /**
   * An explicit switch made in this tab. The persisted preference is read
   * through `useSyncExternalStore`, which is how React wants external browser
   * state (here `localStorage` + `navigator.language`) to be subscribed to: the
   * server **and** the hydration render use `getServerLocale()`, so FR is
   * painted on both sides with no hydration mismatch, and the stored language
   * is applied right after — without a `setState` inside an effect, which the
   * `react-hooks/set-state-in-effect` rule rejects.
   */
  const [override, setOverride] = useState<Locale | null>(null);
  const stored = useSyncExternalStore(subscribeToLocale, readStoredLocale, getServerLocale);
  const locale = override ?? stored ?? defaultLocale;

  const setLocale = useCallback((next: Locale) => {
    if (!SUPPORTED_LOCALES[next]) {
      console.warn(`[i18n] Unsupported locale: ${next}`);
      return;
    }

    setOverride(next);

    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* Private mode: the switch still works for this page view. */
    }

    window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
  }, []);

  const resolve = (key: string): unknown => {
    const translations = getTranslations(locale);
    let value: unknown = translations;

    for (const k of key.split(".")) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        console.warn(`[i18n] Translation key not found: ${key}`);
        return undefined;
      }
    }

    return value;
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const value = resolve(key);

    if (typeof value !== "string") {
      if (value !== undefined) {
        console.warn(`[i18n] Translation key is not a string: ${key}`);
      }
      return key;
    }

    if (!params) {
      return value.replace(/\{\{s\}\}/g, "s");
    }

    let result = value;
    for (const [paramKey, paramValue] of Object.entries(params)) {
      /* `split`/`join` (not `replace`) so a param used twice is filled in twice. */
      result = result.split(`{{${paramKey}}}`).join(String(paramValue));
    }

    /*
     * Plural suffix for the FR / EN / DE count labels (`{{count}} story{{s}}`).
     * The dictionaries place the marker themselves, so a single unit simply
     * drops it — without this the UI printed the literal `{{s}}`.
     */
    return result.replace(/\{\{s\}\}/g, Number(params.count) === 1 ? "" : "s");
  };

  const tList = (key: string): string[] => {
    const value = resolve(key);

    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((entry): entry is string => typeof entry === "string");
  };

  /* Keep the document language in sync for a11y, SEO tooling and hyphenation. */
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t, tList }}>
      {children}
    </TranslationContext.Provider>
  );
}