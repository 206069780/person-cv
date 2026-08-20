import { Briefcase, Download, Home, Map, RotateCcw, SkipForward, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getResumeData } from '../data/resume-data';
import { useLocale } from '../i18n';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';
import { EXHIBITS } from '../scene/scene-layout';
import { ResumeOverviewModal } from './ResumeOverviewModal';

interface MuseumHudProps {
  activeExhibit: string | null;
  introActive: boolean;
  onReturnHome: () => void;
  onSelectExhibit: (id: string) => void;
  onSkipIntro: () => void;
}

export function MuseumHud({
  activeExhibit,
  introActive,
  onReturnHome,
  onSelectExhibit,
  onSkipIntro,
}: MuseumHudProps) {
  const [overviewOpen, setOverviewOpen] = useState(false);
  const locale = useLocale();
  const { t } = useTranslation();
  const resumeData = getResumeData(locale);
  const activeIndex = EXHIBITS.findIndex((exhibit) => exhibit.id === activeExhibit);
  const active = activeIndex >= 0 ? EXHIBITS[activeIndex] : null;

  const triggerZoomIn = () => window.dispatchEvent(new CustomEvent('museum-zoom-in'));
  const triggerZoomOut = () => window.dispatchEvent(new CustomEvent('museum-zoom-out'));
  const triggerZoomReset = () => window.dispatchEvent(new CustomEvent('museum-zoom-reset'));

  return (
    <div className="museum-hud">
      <a className="skip-link" href="#project-index">{t('hud.skipToIndex')}</a>

      <header
        className="museum-hud__identity"
        style={{ cursor: 'pointer' }}
        onClick={() => setOverviewOpen(true)}
        title={t('hud.identityTitle')}
      >
        <p className="eyebrow">SMART WATER / BACKEND ENGINEERING</p>
        <h1>{resumeData.profile.name}</h1>
        <p>{resumeData.profile.title}</p>
        <span>{resumeData.profile.experience}</span>
      </header>

      <section className="museum-hud__metric" aria-label={t('hud.metricAria')}>
        <span>GLOBAL WATER NETWORK</span>
        <strong>10w+</strong>
        <p>{t('hud.waterStations')}</p>
      </section>

      <div className="museum-hud__commands">
        {introActive && (
          <button className="text-command" type="button" onClick={onSkipIntro}>
            <SkipForward size={18} /> {t('hud.skipIntro')}
          </button>
        )}
        <button
          className="text-command text-command--cyan"
          type="button"
          onClick={() => setOverviewOpen(true)}
          title={t('hud.coreResumeTitle')}
        >
          <Briefcase size={17} /> {t('hud.coreResume')}
        </button>
        <button className="icon-command" type="button" onClick={onReturnHome} aria-label={t('hud.home')} title={t('hud.home')}>
          <Home size={19} />
        </button>
        <LanguageSwitcher />
        <a className="text-command text-command--safety" href={t('resume.pdfHref')} download>
          <Download size={18} /> PDF
        </a>
      </div>

      {/* 视野缩放与视角控制组 */}
      <div className="museum-hud__zoom-controls" aria-label={t('hud.zoomAria')}>
        <button
          type="button"
          className="icon-command zoom-btn"
          onClick={triggerZoomIn}
          title={t('hud.zoomInTitle')}
          aria-label={t('hud.zoomIn')}
        >
          <ZoomIn size={17} />
        </button>
        <button
          type="button"
          className="icon-command zoom-btn"
          onClick={triggerZoomOut}
          title={t('hud.zoomOutTitle')}
          aria-label={t('hud.zoomOut')}
        >
          <ZoomOut size={17} />
        </button>
        <button
          type="button"
          className="icon-command zoom-btn"
          onClick={triggerZoomReset}
          title={t('hud.zoomResetTitle')}
          aria-label={t('hud.zoomReset')}
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="museum-hud__status" aria-hidden="true">
        <span className="live-dot" />
        <span>
          {active ? t('hud.statusActive') : t('hud.statusIdle')}
        </span>
      </div>

      <nav className="project-index" id="project-index" aria-label={t('hud.indexAria')}>
        <div className="project-index__title">
          <Map size={17} />
          <span>{active ? `${String(activeIndex + 1).padStart(2, '0')} / ${active.shortLabel}` : t('hud.index')}</span>
        </div>
        <div className="project-index__items">
          {EXHIBITS.map((exhibit, index) => (
            <button
              type="button"
              key={exhibit.id}
              className={activeExhibit === exhibit.id ? 'is-active' : ''}
              onClick={() => onSelectExhibit(exhibit.id)}
              aria-current={activeExhibit === exhibit.id ? 'location' : undefined}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{t(`exhibits.${exhibit.id}`)}</strong>
              <i aria-hidden="true"><b /></i>
            </button>
          ))}
        </div>
      </nav>

      <ResumeOverviewModal isOpen={overviewOpen} onClose={() => setOverviewOpen(false)} />
    </div>
  );
}
