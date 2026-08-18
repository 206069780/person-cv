import { Download, Home, Map, SkipForward } from 'lucide-react';

import { resumeData } from '../data/resume-data';
import { EXHIBITS } from '../scene/scene-layout';

interface MuseumHudProps {
  activeExhibit: string | null;
  introActive: boolean;
  onReturnHome: () => void;
  onSelectExhibit: (id: string) => void;
  onSkipIntro: () => void;
}

export function MuseumHud({ activeExhibit, introActive, onReturnHome, onSelectExhibit, onSkipIntro }: MuseumHudProps) {
  return (
    <div className="museum-hud">
      <a className="skip-link" href="#project-index">跳到项目索引</a>

      <header className="museum-hud__identity">
        <p className="eyebrow">SMART WATER / BACKEND ENGINEERING</p>
        <h1>{resumeData.profile.name}</h1>
        <p>{resumeData.profile.title}</p>
        <span>{resumeData.profile.experience}</span>
      </header>

      <section className="museum-hud__metric" aria-label="项目规模">
        <span>GLOBAL WATER NETWORK</span>
        <strong>10,000+</strong>
        <p>国内外水站</p>
      </section>

      <div className="museum-hud__commands">
        {introActive && (
          <button className="text-command" type="button" onClick={onSkipIntro}>
            <SkipForward size={18} /> 跳过动画
          </button>
        )}
        <button className="icon-command" type="button" onClick={onReturnHome} aria-label="返回中央馆" title="返回中央馆">
          <Home size={19} />
        </button>
        <a className="text-command text-command--safety" href="/resume/付道品-高级Java开发工程师.pdf" download>
          <Download size={18} /> PDF
        </a>
      </div>

      <div className="museum-hud__status" aria-hidden="true">
        <span className="live-dot" />
        DIGITAL TWIN ONLINE
      </div>

      <nav className="project-index" id="project-index" aria-label="项目索引">
        <div className="project-index__title">
          <Map size={17} />
          <span>展馆索引</span>
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
              <strong>{exhibit.label}</strong>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
