import { Cpu, Database, Download, Network, ShieldCheck, X } from 'lucide-react';

import { getProject, getTopic, resumeData } from '../data/resume-data';

interface ExhibitPanelProps {
  exhibitId: string;
  onClose: () => void;
}

export function ExhibitPanel({ exhibitId, onClose }: ExhibitPanelProps) {
  const topic = getTopic(exhibitId);
  const project = resumeData.projects.find((item) => item.topics.some((entry) => entry.id === exhibitId)) ?? getProject(exhibitId);

  if (!topic || !project) return null;

  return (
    <aside className="exhibit-panel" role="dialog" aria-modal="false" aria-labelledby="exhibit-title">
      <div className="exhibit-panel__rail" aria-hidden="true" />
      <header className="exhibit-panel__header">
        <div>
          <p className="eyebrow">{project.company} / {project.period}</p>
          <h2 id="exhibit-title">{topic.title}</h2>
          <p className="exhibit-panel__project">{project.name}</p>
        </div>
        <div className="exhibit-panel__actions">
          <a className="icon-command" href="/resume/付道品-高级Java开发工程师.pdf" download aria-label="下载 PDF 简历" title="下载 PDF">
            <Download size={19} />
          </a>
          <button className="icon-command" type="button" onClick={onClose} aria-label="关闭展厅内容" title="关闭">
            <X size={20} />
          </button>
        </div>
      </header>

      <div className="exhibit-panel__body">
        <section>
          <div className="exhibit-panel__section-title"><Network size={17} /><h3>项目背景</h3></div>
          <p>{topic.background}</p>
        </section>
        <section>
          <div className="exhibit-panel__section-title"><ShieldCheck size={17} /><h3>本人角色</h3></div>
          <p>{topic.role}</p>
        </section>
        <section>
          <div className="exhibit-panel__section-title"><Cpu size={17} /><h3>核心实现</h3></div>
          <ul>{topic.implementation.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section>
          <div className="exhibit-panel__section-title"><Database size={17} /><h3>技术难点与结果</h3></div>
          <ul>{topic.challenges.map((item) => <li key={item}>{item}</li>)}</ul>
          <p className="outcome-line">{topic.outcome}</p>
        </section>
        <section className="exhibit-stack" aria-label="技术栈">
          {topic.stack.map((item) => <span key={item}>{item}</span>)}
        </section>
      </div>
    </aside>
  );
}
