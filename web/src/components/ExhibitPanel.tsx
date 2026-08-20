import { AlertTriangle, Boxes, ChevronLeft, ChevronRight, Cpu, Database, Download, Layers, PanelRightClose, Route, ShieldCheck, Sparkles, Target, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { getModelRepresentation } from '../data/model-representations';
import { getProject, getResumeData, getTopic } from '../data/resume-data';
import { useLocale } from '../i18n';

interface ExhibitPanelProps {
  exhibitId: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose: () => void;
}

export function ExhibitPanel({ exhibitId, collapsed = false, onToggleCollapse, onClose }: ExhibitPanelProps) {
  const locale = useLocale();
  const { t } = useTranslation();
  const resumeData = getResumeData(locale);
  const topic = getTopic(exhibitId, locale);
  const project = resumeData.projects.find((item) => item.topics.some((entry) => entry.id === exhibitId)) ?? getProject(exhibitId, locale);
  const model = getModelRepresentation(exhibitId, locale);

  if (!topic || !project) return null;

  return (
    <>
      {/* 折叠时浮动在屏幕右侧的精巧展开把手 */}
      {collapsed && (
        <button
          type="button"
          className="exhibit-panel__expand-pill"
          onClick={onToggleCollapse}
          title={t('panel.expandTitle')}
          aria-label={t('panel.expand')}
        >
          <ChevronLeft size={16} />
          <span>{t('panel.expand')}</span>
        </button>
      )}

      <aside
        className={`exhibit-panel ${collapsed ? 'is-collapsed' : ''}`}
        role="dialog"
        aria-modal="false"
        aria-labelledby="exhibit-title"
        aria-hidden={collapsed}
      >
        <div className="exhibit-panel__rail" aria-hidden="true" />

        {/* 侧边栏左边缘折叠把手 */}
        {onToggleCollapse && (
          <button
            type="button"
            className="exhibit-panel__collapse-toggle"
            onClick={onToggleCollapse}
            title={t('panel.collapseTitle')}
            aria-label={t('panel.collapse')}
          >
            <ChevronRight size={16} />
          </button>
        )}

        <header className="exhibit-panel__header">
          <div>
            <p className="eyebrow">{project.company} / {project.period}</p>
            <h2 id="exhibit-title">{topic.title}</h2>
            <p className="exhibit-panel__project">{project.name}</p>
          </div>
          <div className="exhibit-panel__actions">
            {onToggleCollapse && (
              <button
                className="icon-command"
                type="button"
                onClick={onToggleCollapse}
                aria-label={t('panel.collapsePanel')}
                title={t('panel.collapsePanelTitle')}
              >
                <PanelRightClose size={18} />
              </button>
            )}
            <a className="icon-command" href={t('resume.pdfHref')} download aria-label={t('panel.downloadPdf')} title={t('panel.downloadPdf')}>
              <Download size={19} />
            </a>
            <button className="icon-command" type="button" onClick={onClose} aria-label={t('panel.closeExhibit')} title={t('panel.close')}>
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="exhibit-panel__body">
          {model && (
            <section className="exhibit-panel__model-spec">
              <div className="model-spec__badge">
                <Boxes size={15} />
                <span>3D DIGITAL TWIN · MODEL [{model.order}] · {model.shortLabel}</span>
                <span className="live-dot" />
              </div>

              <div className="model-spec__entity">
                <div className="model-spec__label">
                  <Sparkles size={15} />
                  <strong>{t('panel.modelRepresents')}</strong>
                </div>
                <p className="model-spec__name">{model.entityName}</p>
                <p className="model-spec__desc">{model.entityDescription}</p>
              </div>

              <div className="model-spec__metaphor">
                <div className="model-spec__label">
                  <Layers size={15} />
                  <strong>{t('panel.modelMetaphor')}</strong>
                </div>
                <div className="model-spec__components">
                  {model.components.map((comp) => (
                    <div key={comp.name} className="model-spec__component-item">
                      <span className="comp-tag">{comp.name}</span>
                      <span className="comp-metaphor">{comp.metaphor}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="model-spec__metrics">
                {model.keyMetrics.map((metric) => (
                  <span key={metric} className="metric-pill">{metric}</span>
                ))}
              </div>
            </section>
          )}

          <section className="exhibit-panel__result">
            <span>DELIVERY RESULT</span>
            <p>{topic.outcome}</p>
          </section>
          <section className="exhibit-panel__role">
            <div className="exhibit-panel__section-title"><ShieldCheck size={17} /><h3>{t('panel.role')}</h3></div>
            <p>{topic.role}</p>
          </section>
          <section>
            <div className="exhibit-panel__section-title"><Target size={17} /><h3>{t('panel.background')}</h3></div>
            <p className="topic-context">{topic.background}</p>
            <div className="background-steps">
              <article>
                <span>{t('panel.business')}</span>
                <p>{project.businessContext}</p>
              </article>
              <article>
                <span>{t('panel.pain')}</span>
                <ul>{project.painPoints.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
              <article>
                <span>{t('panel.goals')}</span>
                <ul>{project.buildGoals.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            </div>
          </section>
          <section className="exhibit-panel__flow">
            <div className="exhibit-panel__section-title"><Route size={17} /><h3>{t('panel.flow')}</h3></div>
            <div className="flow-nodes">
              {topic.flow.split('→').map((item, index) => <span key={`${item}-${index}`}>{item.trim()}</span>)}
            </div>
            <p className="boundary-line"><strong>{t('panel.boundary')}</strong>{topic.engineeringBoundary}</p>
          </section>
          <section>
            <div className="exhibit-panel__section-title"><Cpu size={17} /><h3>{t('panel.implementation')}</h3></div>
            <ul>{topic.implementation.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <section>
            <div className="exhibit-panel__section-title"><AlertTriangle size={17} /><h3>{t('panel.challenges')}</h3></div>
            <ul>{topic.challenges.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <section className="exhibit-stack" aria-label={t('panel.stack')}>
            <div className="exhibit-panel__section-title"><Database size={17} /><h3>{t('panel.stack')}</h3></div>
            {topic.stack.map((item) => <span key={item}>{item}</span>)}
          </section>
        </div>
      </aside>
    </>
  );
}
