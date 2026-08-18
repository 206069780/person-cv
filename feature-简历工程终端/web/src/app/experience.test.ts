import { describe, expect, it } from 'vitest';

import { selectExperienceMode } from './experience';

describe('selectExperienceMode', () => {
  it('uses fallback on phones or without WebGL', () => {
    expect(selectExperienceMode({ width: 375, webgl: true, reducedMotion: false })).toBe('fallback');
    expect(selectExperienceMode({ width: 1440, webgl: false, reducedMotion: false })).toBe('fallback');
  });

  it('uses reduced mode when requested on desktop', () => {
    expect(selectExperienceMode({ width: 1440, webgl: true, reducedMotion: true })).toBe('reduced');
  });

  it('uses the museum on capable desktop', () => {
    expect(selectExperienceMode({ width: 1440, webgl: true, reducedMotion: false })).toBe('museum');
  });
});
