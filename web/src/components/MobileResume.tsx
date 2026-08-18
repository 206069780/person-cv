import { ChevronDown, Download, Mail, Phone } from 'lucide-react';

import { MOBILE_SECTION_ACCENTS } from '../app/mobile-scroll';
import { resumeData } from '../data/resume-data';
import { EngineeringConsole } from './EngineeringConsole';
import { ScrollProgress } from './ScrollProgress';
import { ScrollReveal } from './ScrollReveal';

export function MobileResume() {
  return (
    <main className="mobile-resume" id="main-content">
      <ScrollProgress />
      <header className="mobile-resume__hero mobile-module mobile-module--hero">
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

      <ScrollReveal className="mobile-module mobile-module--terminal" variant="terminal">
        <div className="mobile-module__rail" aria-hidden="true" />
        <EngineeringConsole variant="inline" motionEnabled={false} />
      </ScrollReveal>

      <ScrollReveal className="mobile-module mobile-module--experience">
        <section className="mobile-resume__section" aria-labelledby="mobile-experience">
          <div className="mobile-module__rail" aria-hidden="true" />
          <div className="section-heading">
            <span>01</span>
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

      {resumeData.projects.map((project, projectIndex) => {
        const accent = MOBILE_SECTION_ACCENTS[projectIndex % MOBILE_SECTION_ACCENTS.length];

        return (
          <ScrollReveal className="mobile-module mobile-module--project" key={project.id}>
            <section
              className="mobile-resume__section"
              data-accent={accent}
              aria-labelledby={`mobile-${project.id}`}
            >
              <div className="mobile-module__rail" aria-hidden="true" />
              <div className="section-heading">
                <span>{String(projectIndex + 2).padStart(2, '0')}</span>
                <h2 id={`mobile-${project.id}`}>{project.name}</h2>
              </div>
              <p className="project-lead">{project.summary}</p>
              <div className="mobile-background">
                <ScrollReveal variant="item">
                  <article><span>业务场景</span><p>{project.businessContext}</p></article>
                </ScrollReveal>
                <ScrollReveal delay={60} variant="ite