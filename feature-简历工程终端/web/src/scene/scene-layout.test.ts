import { describe, expect, it } from 'vitest';

import { EXHIBITS, getZoneFocus } from './scene-layout';

describe('industrial exhibit layout', () => {
  it('assigns a meaningful industrial zone to every exhibit', () => {
    expect(EXHIBITS.map((exhibit) => exhibit.zone)).toEqual([
      'core', 'device', 'protocol', 'gis', 'oa', 'agent', 'search', 'plant',
    ]);
  });

  it('strengthens the active zone and dims unrelated zones', () => {
    expect(getZoneFocus(null, 'litree-gis')).toEqual({ intensity: 1, interactive: true });
    expect(getZoneFocus('litree-gis', 'litree-gis')).toEqual({ intensity: 1.35, interactive: true });
    expect(getZoneFocus('litree-gis', 'litree-agent')).toEqual({ intensity: 0.28, interactive: false });
  });
});
