import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

import { type Locale, normalizeLocale, persistLocale, resolveLocale, syncUrl } from './locale';
import enUi from './locales/en/ui.json';
import zhUi from './locales/zh/ui.json';

function readStoredLocale(): string | null {
  try {
    return window.localStorage.getItem('i18nextLng');
  } catch {
    return null;
  }
}

export function currentLocale(resolved = i18n.resolvedLanguage): Locale {
  return normalizeLocale(resolved) ?? 'zh';
}

export function useLocale(): Locale {
  const { i18n: instance } = useTranslation();
  return currentLocale(instance.resolvedLanguage);
}

export function applyDocumentMeta(locale: Locale) {
  const t = i18n.getFixedT(locale);
  document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN';
  document.title = t('meta.title');
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', t('meta.description'));
}

export async function changeAppLanguage(next: Locale) {
  await i18n.changeLanguage(next);
  persistLocale(next, typeof window === 'undefined' ? null : window.localStorage);
  const url = new URL(window.location.href);
  url.search = syncUrl(next, url.search);
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  applyDocumentMeta(next);
}

const initialLng = typeof window === 'undefined'
  ? 'zh'
  : resolveLocale(window.location.search, readStoredLocale());

void i18n.init({
  lng: initialLng,
  fallbackLng: 'zh',
  supportedLngs: ['zh', 'en'],
  ns: ['ui'],
  defaultNS: 'ui',
  resources: {
    zh: { ui: zhUi },
    en: { ui: enUi },
  },
  interpolation: { escapeValue: false },
});

if (typeof window !== 'undefined') {
  applyDocumentMeta(currentLocale());
  i18n.on('languageChanged', (lng) => {
    applyDocumentMeta(currentLocale(lng));
  });
}

export { i18n };
