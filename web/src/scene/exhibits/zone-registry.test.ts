import { describe, expect, it } from 'vitest';

import { EXHIBIT_IDS } from '../scene-layout';
import { EXHIBIT_VISUALS } from './zone-registry';

describe('exhibit visual registry', () => {
  it('maps every exhibit ID exactly once', () => {
    expect(Object.keys(EXHIBIT_VISUALS)).toEqual(EXHIBIT_IDS);
    expect(new Set(Object.values(EXHIBIT_VISUALS)).size).toBe(EXHIBIT_IDS.length);
  });
});
