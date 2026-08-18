import { Download, Mail, Phone } from 'lucide-react';

import { resumeData } from '../data/resume-data';

export function MobileResume() {
  return (
    <main className="mobile-resume" id="main-content">
      <header className="mobile-resume__hero">
        <p className="eyebrow">JAVA BACKEND / SMART WATER</p>
        <h1>{resumeData.profile.name}</h1>
        <h2>{resumeData.profile.title}</h2>
        <p className="mobile-resume__summary">{resumeData.profile.summary}</p>
        <div className="mobile-resume__metric">
          <strong>10w+</strong>
          <span>国内外水站</span>
        </div>
        <div className="mobile-resume__actions">
          <a className="primary-command" href="/resume/付道品-高级Java开发工程师.pdf" download>
            <Download size={18} /> 下载 PDF
          </a>
          <a className="icon-command" href={`tel:${resumeData.profile.phone}`} aria-label={`拨打电话 ${resumeData.profile.phone}`}>
            <Phone size={19} />
          </a>
          <a className="icon-command" href={`mailto:${resumeData.profile.email}`} aria-label={`发送邮件至 ${resumeData.profile.email}`}>
            <Mail size={19} />
          </a>
        </div>
      </header>

      <section className="mobile-resume__section" aria-labelledby="mobile-experience">
        <div className="section-heading">
          <span>01</span>
          <h2 id="mobile-experience">工作经历</h2>
        </div>
        <div className="experience-list">
          {resumeData.experiences.map((experience) => (
            <article className="experience-row" key={`${experience.company}-${experience.period}`}>
              <p className="experience-row__period">{experience.period}</p>
              <h3>{experience.company}</h3>
              <p className="experience-row__role">{experience.title}</p>
              <p>{experience.summary}</p>
              <ul>
                {experience.achievements.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {resumeData.projects.map((project, projectIndex) => (
        <section className="mobile-resume__section" key={project.id} aria-labelledby={`mobile-${project.id}`}>
          <div className="section-heading">
            <span>{String(projectIndex + 2).padStart(2, '0')}</span>
            <h2 id={`mobile-${project.id}`}>{project.name}</h2>
          </div>
          <p className="project-lead">{project.summary}</p>
          <div className="mobile-background">
            <article><span>业务场景</span><p>{project.businessContext}</p></article>
            <article><span>现有痛点</span><ul>{project.painPoints.map((item) => <li key={item}>{item}</li>)}</ul></article>
            <article><span>建设目标</span><ul>{project.buildGoals.map((item) => <li key={item}>{item}</li>)}</ul></article>
          </div>
          <div className="topic-list">
            {project.topics.map((topic) => (
              <article className="topic-row" key={topic.id}>
                <p className="topic-row__index">{topic.id.toUpperCase()}</p>
                <h3>{topic.title}</h3>
                <p>{topic.role}</p>
                <p className="topic-row__flow"><strong>业务链路</strong>{topic.flow}</p>
                <p className="topic-row__flow"><strong>工程边界</strong>{topic.engineeringBoundary}</p>
                <ul>
                  {topic.implementation.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <p className="topic-row__outcome"><strong>落地结果</strong>{topic.outcome}</p>
                <div className="stack-line">{topic.stack.join(' / ')}</div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <footer className="mobile-resume__footer">
        <strong>{resumeData.profile.name}</strong>
        <span>{resumeData.profile.phone}</span>
        <span>{resumeData.profile.email}</span>
      </footer>
    </main>
  );
}
