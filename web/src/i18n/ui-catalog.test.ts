import { describe, expect, it } from 'vitest';

import en from './locales/en/ui.json';
import zh from './locales/zh/ui.json';

function leafPaths(value: unknown, prefix = ''): string[] {
  if (typeof value === 'string') return [prefix];
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([key, child]) => leafPaths(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [];
}

describe('ui catalogs', () => {
  it('keeps zh and en keys aligned with non-empty leaves', () => {
    const zhPaths = leafPaths(zh).sort();
    const enPaths = leafPaths(en).sort();
    expect(enPaths).toEqual(zhPaths);
    for (const path of zhPaths) {
      const zhValue = path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown>)[key], zh);
      const enValue = path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown>)[key], en);
      expect(zhValue, path).toEqual(expect.any(String));
      expect(enValue, path).toEqual(expect.any(String));
      expect(String(zhValue).length, path).toBeGreaterThan(0);
      expect(String(enValue).length, path).toBeGreaterThan(0);
    }
  });
});
