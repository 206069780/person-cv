export type Locale = 'zh' | 'en';

export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;
  const base = value.trim().toLowerCase().split('-')[0];
  if (base === 'zh' || base === 'en') return base;
  return null;
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
