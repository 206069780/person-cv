import { lazy, Suspense, useCallback, useMemo, useState } from 'react';

import { detectExperienceMode, ExperienceMode } from './app/experience';
import { ExhibitPanel } from './components/ExhibitPanel';
import { MobileNotice } from './components/MobileNotice';
import { MobileResume } from './components/MobileResume';
import { MuseumHud } from './components/MuseumHud';

const MuseumScene = lazy(() => import('./scene/MuseumScene').then((module) => ({ default: module.MuseumScene })));

function initialMode(): ExperienceMode {
  const queryMode = new URLSearchParams(window.location.search).get('mode');
  if (queryMode === 'fallback' || queryMode === 'reduced' || queryMode === 'museum') return queryMode;
  return detectExperienceMode();
}

function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-screen__mark" aria-hidden="true"><i /><i /><i /></div>
      <p className="eyebrow">LITREE DIGITAL TWIN</p>
      <strong>初始化展馆</strong>
      <div className="loading-screen__track"><span /></div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState<ExperienceMode>(initialMode);
  const [mobileNoticeOpen, setMobileNoticeOpen] = useState(() => mode === 'fallback' && window.innerWidth < 768);
  const [loading, setLoading] = useState(mode !== 'fallback');
  const [introActive, setIntroActive] = useState(mode === 'museum');
  const [activeExhibit, setActiveExhibit] = useState<string | null>(null);
  const [sceneKey, setSceneKey] = useState(0);
  const motionEnabled = mode === 'museum';

  const finishIntro = useCallback(() => setIntroActive(false), []);
  const fallback = useCallback(() => {
    setMode('fallback');
    setLoading(false);
    setIntroActive(false);
    setMobileNoticeOpen(window.innerWidth < 768);
  }, []);
  const returnHome = useCallback(() => {
    setActiveExhibit(null);
    setSceneKey((value) => value + 1);
  }, []);

  const fallbackContent = useMemo(() => (
    <div className="fallback-shell">
      {mobileNoticeOpen && <MobileNotice onContinue={() => setMobileNoticeOpen(false)} />}
      <MobileResume />
    </div>
  ), [mobileNoticeOpen]);

  if (mode === 'fallback') return fallbackContent;

  return (
    <main className="museum-shell" id="main-content">
      <Suspense fallback={null}>
        <MuseumScene
          key={sceneKey}
          activeExhibit={activeExhibit}
          introActive={introActive}
          motionEnabled={motionEnabled}
          onIntroComplete={finishIntro}
          onReady={() => setLoading(false)}
          onFallback={fallback}
          onSelectExhibit={setActiveExhibit}
        />
      </Suspense>
      <MuseumHud
        activeExhibit={activeExhibit}
        introActive={introActive}
        onReturnHome={returnHome}
        onSelectExhibit={setActiveExhibit}
        onSkipIntro={finishIntro}
      />
      {activeExhibit && <ExhibitPanel exhibitId={activeExhibit} onClose={() => setActiveExhibit(null)} />}
      {loading && <LoadingScreen />}
    </main>
  );
}
