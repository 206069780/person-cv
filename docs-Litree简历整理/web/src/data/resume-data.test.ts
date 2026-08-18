import { describe, expect, it } from 'vitest';

import { resumeData } from './resume-data';

describe('resume facts', () => {
  it('uses the confirmed current employer and platform scale', () => {
    expect(resumeData.experiences[0].company).toBe('立升净水科技');
    expect(resumeData.highlights).toContain('覆盖国内外 10,000+ 水站');
  });

  it('keeps the six Litree topics under one project', () => {
    expect(resumeData.projects[0].name).toBe('Litree 智慧水务云平台');
    expect(resumeData.projects[0].topics).toHaveLength(6);
  });

  it('contains no forbidden unsupported metrics or former employer', () => {
    const text = JSON.stringify(resumeData);

    expect(text).not.toContain('北京智能信通科技');
    expect(text).not.toMatch(/并发量|项目金额|团队人数|性能提升\s*\d+%/);
  });
});
