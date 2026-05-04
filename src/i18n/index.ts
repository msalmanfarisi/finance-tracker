import en from "./en";
import id from "./id";

export type Locale = "en" | "id";
export type TranslationKeys = typeof en;

const translations: Record<Locale, TranslationKeys> = { en, id };

export function getTranslation(locale: Locale): TranslationKeys {
  return translations[locale] || translations.en;
}

export function t(locale: Locale, path: string): string {
  const keys = path.split(".");
  let current: Record<string, unknown> = translations[locale] || translations.en;

  for (const key of keys) {
    if (current[key] === undefined) return path;
    current = current[key] as Record<string, unknown>;
  }

  return current as unknown as string;
}

export { en, id };
