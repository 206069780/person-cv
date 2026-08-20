import { describe, expect, it } from 'vitest';

import { getResumeData } from './resume-data';

const zh = getResumeData('zh');
const en = getResumeData('en');

describe('resume facts', () => {
  it('uses the confirmed current employer and platform scale', () => {
    expect(zh.experiences[0].company).toBe('立升净水科技');
    expect(zh.highlights).toContain('覆盖国内外 10w+ 水站');
  });

  it('organizes four systems instead of flattening modules into independent projects', () => {
    expect(zh.projects.map((project) => project.id)).toEqual(['litree', 'oa', 'welink', 'senge']);
    expect(zh.projects.map((project) => project.pageSpan)).toEqual([2, 1, 1, 1]);
    expect(zh.projects[0].name).toBe('立升智慧水务云平台');
    expect(zh.projects[1].name).toBe('立升 OA / HR 业务系统');
    expect(zh.projects[2].name).toBe('华为 WeLink');
    expect(zh.projects[3].name).toBe('森格智慧水务平台');
    expect(zh.projects[0].topics.map((topic) => topic.id)).toEqual([
      'litree-overview',
      'litree-aiot',
      'litree-agent',
    ]);
    expect(zh.projects[1].topics.map((topic) => topic.id)).toEqual(['oa-hr', 'oa-sync']);
  });

  it('keeps Agent engineering inside Litree and OA as its own system', () => {
    const litreeText = JSON.stringify(zh.projects[0]);
    const oaText = JSON.stringify(zh.projects[1]);

    expect(litreeText).toContain('AgentScope Java 2.0');
    expect(litreeText).toContain('NL2SQL');
    expect(litreeText).not.toContain('考勤规则引擎');
    expect(oaText).toContain('考勤规则引擎');
    expect(oaText).toContain('绩效考核');
    expect(oaText).toContain('独立于智慧水务');
    expect(oaText).not.toContain('AgentScope');
  });

  it('contains no forbidden unsupported metrics or former employer', () => {
    const text = JSON.stringify(zh);

    expect(text).not.toContain('北京智能信通科技');
    expect(text).not.toMatch(/并发量|项目金额|团队人数|性能提升\s*\d+%/);
  });

  it('provides structured project backgrounds for casebook and exhibition views', () => {
    for (const project of zh.projects) {
      expect(project.businessContext.length).toBeGreaterThan(40);
      expect(project.painPoints.length).toBeGreaterThan(0);
      expect(project.buildGoals.length).toBeGreaterThan(0);
      expect(project.role.length).toBeGreaterThan(10);
      expect(project.flow.length).toBeGreaterThan(10);
      expect(project.pageSpan).toBeGreaterThan(0);
    }

    expect(zh.projects[0].businessContext).toContain('10w+');
    expect(zh.projects[1].businessContext).toContain('考勤');
    expect(zh.projects[2].businessContext).toContain('人员、群组和聊天记录');
    expect(zh.projects[2].painPoints.join('')).toContain('实时变更');
    expect(zh.projects[3].businessContext).toContain('0-1 建设阶段');
  });

  it('summarizes the full AIoT protocol family without collapsing to UsrCloud only', () => {
    const aiot = zh.projects[0].topics.find((topic) => topic.id === 'litree-aiot');
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

  it('keeps English resume structurally aligned and uses Daopin Fu', () => {
    expect(en.profile.name).toBe('Daopin Fu');
    expect(en.profile.title).toBe('Senior Java Engineer');
    expect(en.experiences.map((item) => item.company)).toEqual([
      'Litree Water Purification Technology',
      'Adecco',
      'Senge Automation Technology',
    ]);
    expect(en.projects.map((project) => project.id)).toEqual(zh.projects.map((project) => project.id));
    expect(en.projects.map((project) => project.pageSpan)).toEqual(zh.projects.map((project) => project.pageSpan));
    expect(en.projects.map((project) => project.topics.map((topic) => topic.id)))
      .toEqual(zh.projects.map((project) => project.topics.map((topic) => topic.id)));
    expect(en.highlights).toHaveLength(zh.highlights.length);
    expect(en.strengths).toHaveLength(zh.strengths.length);
    expect(JSON.stringify(en)).toContain('AgentScope Java 2.0');
    expect(JSON.stringify(en)).toContain('10w+');
    expect(JSON.stringify(en)).toContain('NL2SQL');
    expect(JSON.stringify(en)).not.toContain('北京智能信通科技');
  });
});
