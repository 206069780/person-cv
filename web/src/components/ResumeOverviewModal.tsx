import { Briefcase, Cpu, Download, Mail, Phone, Sparkles, X } from 'lucide-react';
import { useEffect } from 'react';

import { resumeData } from '../data/resume-data';

interface ResumeOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResumeOverviewModal({ isOpen, onClose }: ResumeOverviewModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allStack = Array.from(
    new Set([
      ...resumeData.projects.flatMap((p) => [
        ...(p.stack || []),
        ...p.topics.flatMap((t) => t.stack || []),
      ]),
    ])
  );

  return (
    <div
      className="resume-overview-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="overview-modal-title"
      onWheel={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="resume-overview-card" onWheel={(e) => e.stopPropagation()}>
        <header className="resume-overview-card__header">
          <div>
            <p className="eyebrow">CAREER MATRIX & WORK EXPERIENCE</p>
            <h2 id="overview-modal-title">{resumeData.profile.name} · 核心简历档案</h2>
            <p className="overview-sub">{resumeData.profile.title} · {resumeData.profile.experience}</p>
          </div>
          <div className="resume-overview-card__actions">
            <a
              className="text-command text-command--safety"
              href="/resume/付道品-高级Java开发工程师.pdf"
              download
              title="下载最新 PDF 简历"
            >
              <Download size={17} /> 下载 PDF
            </a>
            <button
              type="button"
              className="icon-command"
              onClick={onClose}
              aria-label="关闭档案面板"
              title="关闭"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="resume-overview-card__body">
          {/* 职业定位 */}
          <section className="overview-section">
            <div className="overview-section__title">
              <Sparkles size={16} />
              <h3>职业定位</h3>
            </div>
            <p className="overview-summary-text">{resumeData.profile.summary}</p>
          </section>

          {/* A1 核心能力矩阵 */}
          <section className="overview-section">
            <div className="overview-section__title">
              <Cpu size={16} />
              <h3>A1 · 核心能力矩阵</h3>
            </div>
            <div className="overview-strengths-grid">
              {resumeData.strengths.map((item, index) => (
                <article key={item.title} className="overview-strength-box" data-accent={index === 3 ? 'safety' : 'cyan'}>
                  <h4>{item.title}</h4>
                  <p>{item.evidence}</p>
                </article>
              ))}
            </div>
          </section>

          {/* A2 工作经历 */}
          <section className="overview-section">
            <div className="overview-section__title">
              <Briefcase size={16} />
              <h3>A2 · 工作经历</h3>
            </div>
            <div className="overview-experience-list">
              {resumeData.experiences.map((exp) => (
                <article key={exp.company} className="overview-experience-box">
                  <div className="overview-experience-header">
                    <span className="exp-period">{exp.period}</span>
                    <strong className="exp-company">{exp.company}</strong>
                    <span className="exp-title">{exp.title}</span>
                  </div>
                  <p className="exp-summary">{exp.summary}</p>
                  <ul className="exp-achievements">
                    {exp.achievements.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          {/* 技术域索引 */}
          <section className="overview-section">
            <div className="overview-section__title">
              <Sparkles size={16} />
              <h3>技术域索引</h3>
            </div>
            <div className="overview-stack-cloud">
              {allStack.map((tech) => (
                <span key={tech} className="overview-stack-chip">
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* 联系方式 */}
          <footer className="resume-overview-card__footer">
            <div className="contact-item">
              <Phone size={15} />
              <span>{resumeData.profile.phone}</span>
            </div>
            <div className="contact-item">
              <Mail size={15} />
              <span>{resumeData.profile.email}</span>
            </div>
            <div className="contact-item">
              <span>3D 展馆: {resumeData.profile.website}</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
