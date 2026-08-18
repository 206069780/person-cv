import { AlertTriangle, Cpu, Database, Download, Route, ShieldCheck, Target, X } from 'lucide-react';

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
        <section className="exhibit-panel__result">
          <span>DELIVERY RESULT</span>
          <p>{topic.outcome}</p>
        </section>
        <section className="exhibit-panel__role">
          <div className="exhibit-panel__section-title"><ShieldCheck size={17} /><h3>本人角色</h3></div>
          <p>{topic.role}</p>
        </section>
        <section>
          <div className="exhibit-panel__section-title"><Target size={17} /><h3>项目背景</h3></div>
          <p className="topic-context">{topic.background}</p>
          <div className="background-steps">
            <article>
              <span>01 / 业务场景</span>
              <p>{project.businessContext}</p>
            </article>
            <article>
              <span>02 / 现有痛点</span>
              <ul>{project.painPoints.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
            <article>
              <span>03 / 建设目标</span>
              <ul>{project.buildGoals.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          </div>
        </section>
        <section className="exhibit-panel__flow">
          <div className="exhibit-panel__section-title"><Route size={17} /><h3>业务链路</h3></div>
          <div className="flow-nodes">
            {topic.flow.split('→').map((item, index) => <span key={`${item}-${index}`}>{item.trim()}</span>)}
          </div>
          <p className="boundary-line"><strong>工程边界</strong>{topic.engineeringBoundary}</p>
        </section>
        <section>
          <div className="exhibit-panel__section-title"><Cpu size={17} /><h3>核心实现</h3></div>
          <ul>{topic.implementation.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section>
          <div className="exhibit-panel__section-title"><AlertTriangle size={17} /><h3>技术难点</h3></div>
          <ul>{topic.challenges.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section className="exhibit-stack" aria-label="技术栈">
          <div className="exhibit-panel__section-title"><Database size={17} /><h3>技术矩阵</h3></div>
          {topic.stack.map((item) => <span key={item}>{item}</span>)}
        </section>
      </div>
    </aside>
  );
}
