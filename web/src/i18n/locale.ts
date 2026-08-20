export type Locale = 'zh' | 'en';

const ALIASES: Record<string, Locale> = {
  zh: 'zh',
  'zh-cn': 'zh',
  'zh-hans': 'zh',
  en: 'en',
  'en-us': 'en',
  'en-gb': 'en',
};

export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;
  return ALIASES[value.trim().toLowerCase()] ?? null;
}

export function resolveLocale(search: string, stored: string | null): Locale {
  const query = search.startsWith('?') ? search.slice(1) : search;
  const fromUrl = normalizeLocale(new URLSearchParams(query).get('lang'));
  if (fromUrl) return fromUrl;
  return normalizeLocale(stored) ?? 'zh';
}

export function syncUrl(locale: Locale, search: string): string {
  const query = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(query);
  if (locale === 'en') params.set('lang', 'en');
  else params.delete('lang');
  const next = params.toString();
  return next ? `?${next}` : '';
}

export function persistLocale(locale: Locale, storage: { setItem(k: string, v: string): void } | null) {
  try {
    storage?.setItem('i18nextLng', locale);
  } catch {
    /* ignore quota / private mode */
  }
}
