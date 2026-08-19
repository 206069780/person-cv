import { describe, expect, it } from 'vitest';

import { EXHIBIT_IDS, EXHIBITS, getZoneFocus } from './scene-layout';

describe('industrial exhibit layout', () => {
  it('keeps the public exhibit identifiers stable and unique', () => {
    expect(EXHIBIT_IDS).toEqual([
      'litree-overview',
      'litree-aiot',
      'litree-agent',
      'oa-hr',
      'welink-search',
      'welink-data',
      'senge-gateway',
      'senge-platform',
    ]);
    expect(new Set(EXHIBIT_IDS).size).toBe(EXHIBIT_IDS.length);
    expect(EXHIBITS.map(({ id }) => id)).toEqual(EXHIBIT_IDS);
  });

  it('assigns a meaningful industrial zone to every exhibit', () => {
    expect(EXHIBITS.map((exhibit) => exhibit.zone)).toEqual([
      'core', 'protocol', 'agent', 'oa', 'search', 'search', 'plant', 'plant',
    ]);
  });

  it('strengthens the active zone and dims unrelated zones', () => {
    expect(getZoneFocus(null, 'litree-aiot')).toEqual({ intensity: 1, interactive: true });
    expect(getZoneFocus('litree-aiot', 'litree-aiot')).toEqual({ intensity: 1.35, interactive: true });
    expect(getZoneFocus('litree-aiot', 'litree-agent')).toEqual({ intensity: 0.32, interactive: true });
  });
});
