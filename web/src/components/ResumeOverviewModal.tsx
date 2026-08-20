import { Briefcase, Cpu, Download, Mail, Phone, Sparkles, X } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { getResumeData } from '../data/resume-data';
import { useLocale } from '../i18n';

interface ResumeOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResumeOverviewModal({ isOpen, onClose }: ResumeOverviewModalProps) {
  const locale = useLocale();
  const { t } = useTranslation();
  const resumeData = getResumeData(locale);

  useEffect(() => {
    if (!isOpen) return;

    document.documentElement.dataset.modalOpen = 'true';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      delete document.documentElement.dataset.modalOpen;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allStack = Array.from(
    new Set([
      ...resumeData.projects.flatMap((p) => [
        ...(p.stack || []),
        ...p.topics.flatMap((topic) => topic.stack || []),
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
            <h2 id="overview-modal-title">{resumeData.profile.name} · {t('overview.titleSuffix')}</h2>
            <p className="overview-sub">{resumeData.profile.title} · {resumeData.profile.experience}</p>
          </div>
          <div className="resume-overview-card__actions">
            <a
              className="text-command text-command--safety"
              href={t('resume.pdfHref')}
              download
              title={t('overview.downloadTitle')}
            >
              <Download size={17} /> {t('overview.download')}
            </a>
            <button
              type="button"
              className="icon-command"
              onClick={onClose}
              aria-label={t('overview.close')}
              title={t('panel.close')}
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
              <h3>{t('overview.position')}</h3>
            </div>
            <p className="overview-summary-text">{resumeData.profile.summary}</p>
          </section>

          {/* A1 核心能力矩阵 */}
          <section className="overview-section">
            <div className="overview-section__title">
              <Cpu size={16} />
              <h3>{t('overview.strengths')}</h3>
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
              <h3>{t('overview.experience')}</h3>
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
              <h3>{t('overview.stack')}</h3>
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
              <span>{t('overview.museum')}: {resumeData.profile.website}</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
