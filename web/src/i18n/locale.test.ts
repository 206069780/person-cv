import { describe, expect, it } from 'vitest';

import { normalizeLocale, resolveLocale, syncUrl } from './locale';

describe('locale resolution', () => {
  it('normalizes language tags to zh or en', () => {
    expect(normalizeLocale('zh')).toBe('zh');
    expect(normalizeLocale('zh-CN')).toBe('zh');
    expect(normalizeLocale('zh-Hans')).toBe('zh');
    expect(normalizeLocale('en')).toBe('en');
    expect(normalizeLocale('en-US')).toBe('en');
    expect(normalizeLocale('en-GB')).toBe('en');
    expect(normalizeLocale('fr')).toBeNull();
    expect(normalizeLocale('')).toBeNull();
    expect(normalizeLocale(null)).toBeNull();
  });

  it('prefers URL lang over localStorage then defaults to zh', () => {
    expect(resolveLocale('?lang=en', 'zh')).toBe('en');
    expect(resolveLocale('?mode=fallback&lang=en', null)).toBe('en');
    expect(resolveLocale('?lang=zh-CN', 'en')).toBe('zh');
    expect(resolveLocale('?lang=fr', 'en')).toBe('en');
    expect(resolveLocale('?mode=fallback', 'en-US')).toBe('en');
    expect(resolveLocale('', null)).toBe('zh');
    expect(resolveLocale('?lang=nope', null)).toBe('zh');
  });

  it('writes en to the query and strips lang for zh while keeping other params', () => {
    expect(syncUrl('en', '?mode=fallback')).toBe('?mode=fallback&lang=en');
    expect(syncUrl('en', '')).toBe('?lang=en');
    expect(syncUrl('zh', '?lang=en&mode=fallback')).toBe('?mode=fallback');
    expect(syncUrl('zh', '?lang=en')).toBe('');
  });
});
