import { describe, expect, it } from 'vitest';

import { resumeData } from './resume-data';

describe('resume facts', () => {
  it('uses the confirmed current employer and platform scale', () => {
    expect(resumeData.experiences[0].company).toBe('立升净水科技');
    expect(resumeData.highlights).toContain('覆盖国内外 10w+ 水站');
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

  it('provides structured project backgrounds for casebook and exhibition views', () => {
    for (const project of resumeData.projects) {
      expect(project.businessContext.length).toBeGreaterThan(40);
      expect(project.painPoints.length).toBeGreaterThan(0);
      expect(project.buildGoals.length).toBeGreaterThan(0);
    }

    expect(resumeData.projects[0].businessContext).toContain('OA 站点主数据');
    expect(resumeData.projects[0].businessContext).toContain('10w+');
    expect(resumeData.projects[1].businessContext).toContain('人员、群组和聊天记录');
    expect(resumeData.projects[1].painPoints.join('')).toContain('实时变更');
    expect(resumeData.projects[2].businessContext).toContain('现场设备、服务端和客户端');
  });
});
