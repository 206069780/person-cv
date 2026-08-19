import { ChevronDown, Download, Mail, Phone } from 'lucide-react';

import { MOBILE_SECTION_ACCENTS } from '../app/mobile-scroll';
import { resumeData } from '../data/resume-data';
import { EngineeringConsole } from './EngineeringConsole';
import { ScrollProgress } from './ScrollProgress';
import { ScrollReveal } from './ScrollReveal';

export function MobileResume() {
  const allStack = Array.from(
    new Set([
      ...resumeData.projects.flatMap((p) => [
        ...(p.stack || []),
        ...p.topics.flatMap((t) => t.stack || []),
      ]),
    ])
  );

  return (
    <main className="mobile-resume" id="main-content">
      <ScrollProgress markers={resumeData.projects.length + 4} />
      <header className="mobile-resume__hero mobile-module mobile-module--hero">
        <div className="mobile-module__impact" aria-hidden="true" />
        <span className="mobile-module__watermark mobile-module__watermark--hero" aria-hidden="true">00</span>
        <div className="mobile-module__rail" aria-hidden="true" />
        <div className="mobile-module__status" aria-hidden="true"><i /> PROFILE / 00</div>
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
        <ChevronDown className="mobile-resume__continuation" size={22} aria-hidden="true" />
      </header>

      {/* A1 核心能力矩阵 */}
      <ScrollReveal className="mobile-module mobile-module--strengths">
        <section className="mobile-resume__section" aria-labelledby="mobile-strengths">
          <div className="mobile-module__impact" aria-hidden="true" />
          <span className="mobile-module__watermark" aria-hidden="true">A1</span>
          <div className="mobile-module__rail" aria-hidden="true" />
          <div className="section-heading">
            <span>A1</span>
            <h2 id="mobile-strengths">核心能力矩阵</h2>
          </div>
          <div className="strengths-grid">
            {resumeData.strengths.map((strength, index) => (
              <ScrollReveal
                key={strength.title}
                className="strength-card"
                delay={Math.min(index * 60, 180)}
                variant="item"
              >
                <article>
                  <h3>{strength.title}</h3>
                  <p>{strength.evidence}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* SYS 工程终端 */}
      <ScrollReveal className="mobile-module mobile-module--terminal" variant="terminal">
        <div className="mobile-module__impact" aria-hidden="true" />
        <span className="mobile-module__watermark" aria-hidden="true">SYS</span>
        <div className="mobile-module__rail" aria-hidden="true" />
        <EngineeringConsole variant="inline" motionEnabled />
      </ScrollReveal>

      {/* A2 工作经历 */}
      <ScrollReveal className="mobile-module mobile-module--experience">
        <section className="mobile-resume__section" aria-labelledby="mobile-experience">
          <div className="mobile-module__impact" aria-hidden="true" />
          <span className="mobile-module__watermark" aria-hidden="true">A2</span>
          <div className="mobile-module__rail" aria-hidden="true" />
          <div className="section-heading">
            <span>A2</span>
            <h2 id="mobile-experience">工作经历</h2>
          </div>
          <div className="experience-list">
            {resumeData.experiences.map((experience, experienceIndex) => (
              <ScrollReveal
                key={`${experience.company}-${experience.period}`}
                className="experience-reveal"
                delay={Math.min(experienceIndex * 70, 180)}
                variant="item"
              >
                <article className="experience-row">
                  <p className="experience-row__period">{experience.period}</p>
                  <h3>{experience.company}</h3>
                  <p className="experience-row__role">{experience.title}</p>
                  <p>{experience.summary}</p>
                  <ul>
                    {experience.achievements.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* 核心项目 */}
      {resumeData.projects.map((project, projectIndex) => {
        const accent = MOBILE_SECTION_ACCENTS[projectIndex % MOBILE_SECTION_ACCENTS.length];

        return (
          <ScrollReveal
            className={`mobile-module mobile-module--project mobile-module--accent-${accent}`}
            key={project.id}
          >
            <section
              className="mobile-resume__section"
              data-accent={accent}
              aria-labelledby={`mobile-${project.id}`}
            >
              <div className="mobile-module__impact" aria-hidden="true" />
              <span className="mobile-module__watermark" aria-hidden="true">
                {String(projectIndex + 1).padStart(2, '0')}
              </span>
              <div className="mobile-module__rail" aria-hidden="true" />
              <div className="section-heading">
                <span>{String(projectIndex + 1).padStart(2, '0')}</span>
                <h2 id={`mobile-${project.id}`}>{project.name}</h2>
              </div>
              <p className="project-lead">{project.summary}</p>
              <div className="mobile-background">
                <ScrollReveal variant="item">
                  <article><span>业务场景</span><p>{project.businessContext}</p></article>
                </ScrollReveal>
                <ScrollReveal delay={60} variant="item">
                  <article><span>现有痛点</span><ul>{project.painPoints.map((item) => <li key={item}>{item}</li>)}</ul></article>
                </ScrollReveal>
                <ScrollReveal delay={120} variant="item">
                  <article><span>建设目标</span><ul>{project.buildGoals.map((item) => <li key={item}>{item}</li>)}</ul></article>
                </ScrollReveal>
              </div>
              <div className="topic-list">
                {project.topics.map((topic, topicIndex) => (
                  <ScrollReveal
                    key={topic.id}
                    delay={Math.min(topicIndex * 80, 160)}
                    variant="item"
                  >
                    <article className="topic-row">
                      <p className="topic-row__index">模块 {String(topicIndex + 1).padStart(2, '0')}  ·  {topic.id.toUpperCase()}</p>
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
                  </ScrollReveal>
                ))}
              </div>
            </section>
          </ScrollReveal>
        );
      })}

      {/* 技术域索引 */}
      <ScrollReveal className="mobile-module mobile-module--stack">
        <section className="mobile-resume__section" aria-labelledby="mobile-stack">
          <div className="mobile-module__impact" aria-hidden="true" />
          <span className="mobile-module__watermark" aria-hidden="true">STK</span>
          <div className="mobile-module__rail" aria-hidden="true" />
          <div className="section-heading">
            <span>STK</span>
            <h2 id="mobile-stack">技术域索引</h2>
          </div>
          <div className="stack-cloud">
            {allStack.map((item) => (
              <span key={item} className="stack-chip">{item}</span>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal className="mobile-module mobile-module--footer" variant="footer">
        <footer className="mobile-resume__footer">
          <span className="mobile-module__watermark" aria-hidden="true">END</span>
          <div className="mobile-module__rail" aria-hidden="true" />
          <strong>{resumeData.profile.name}</strong>
          <span>{resumeData.profile.phone}</span>
          <span>{resumeData.profile.email}</span>
        </footer>
      </ScrollReveal>
    </main>
  );
}
