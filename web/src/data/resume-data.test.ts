import { describe, expect, it } from 'vitest';

import { resumeData } from './resume-data';

describe('resume facts', () => {
  it('uses the confirmed current employer and platform scale', () => {
    expect(resumeData.experiences[0].company).toBe('立升净水科技');
    expect(resumeData.highlights).toContain('覆盖国内外 10w+ 水站');
  });

  it('organizes four systems instead of flattening modules into independent projects', () => {
    expect(resumeData.projects.map((project) => project.id)).toEqual(['litree', 'oa', 'welink', 'senge']);
    expect(resumeData.projects.map((project) => project.pageSpan)).toEqual([2, 1, 1, 1]);
    expect(resumeData.projects[0].name).toBe('立升智慧水务云平台');
    expect(resumeData.projects[1].name).toBe('立升 OA / HR 业务系统');
    expect(resumeData.projects[2].name).toBe('华为 WeLink');
    expect(resumeData.projects[3].name).toBe('森格智慧水务平台');
    expect(resumeData.projects[0].topics.map((topic) => topic.id)).toEqual([
      'litree-overview',
      'litree-aiot',
      'litree-agent',
    ]);
    expect(resumeData.projects[1].topics.map((topic) => topic.id)).toEqual(['oa-hr', 'oa-sync']);
  });

  it('keeps Agent engineering inside Litree and OA as its own system', () => {
    const litreeText = JSON.stringify(resumeData.projects[0]);
    const oaText = JSON.stringify(resumeData.projects[1]);

    expect(litreeText).toContain('AgentScope Java 2.0');
    expect(litreeText).toContain('NL2SQL');
    expect(litreeText).not.toContain('考勤规则引擎');
    expect(oaText).toContain('考勤规则引擎');
    expect(oaText).toContain('绩效考核');
    expect(oaText).toContain('独立于智慧水务');
    expect(oaText).not.toContain('AgentScope');
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
      expect(project.role.length).toBeGreaterThan(10);
      expect(project.flow.length).toBeGreaterThan(10);
      expect(project.pageSpan).toBeGreaterThan(0);
    }

    expect(resumeData.projects[0].businessContext).toContain('10w+');
    expect(resumeData.projects[1].businessContext).toContain('考勤');
    expect(resumeData.projects[2].businessContext).toContain('人员、群组和聊天记录');
    expect(resumeData.projects[2].painPoints.join('')).toContain('实时变更');
    expect(resumeData.projects[3].businessContext).toContain('0-1 建设阶段');
  });

  it('summarizes the full AIoT protocol family without collapsing to UsrCloud only', () => {
    const aiot = resumeData.projects[0].topics.find((topic) => topic.id === 'litree-aiot');
    const text = JSON.stringify(aiot);

    expect(text).toContain('有人云');
    expect(text).toContain('MQTT');
    expect(text).toContain('Modbus');
    expect(text).toContain('TCP/UDP');
    expect(text).toContain('繁易');
    expect(text).toContain('迈拓');
    expect(text).toContain('巨控 OPC/HTTP');
    expect(aiot?.role).toContain('负责有人云/MQTT/Modbus/TCP/UDP/OPC');
    expect(aiot?.engineeringBoundary).toContain('全链路接入');
    expect(text).not.toContain('团队');
  });
});
