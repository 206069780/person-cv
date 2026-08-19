import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { detectExperienceMode, ExperienceMode } from './app/experience';
import { CyberLoadingScreen } from './components/CyberLoadingScreen';
import { ExhibitPanel } from './components/ExhibitPanel';
import { MobileNotice } from './components/MobileNotice';
import { MobileResume } from './components/MobileResume';
import { MuseumHud } from './components/MuseumHud';

const loadMuseumScene = () => import('./scene/MuseumScene');
const MuseumScene = lazy(() => loadMuseumScene().then((module) => ({ default: module.MuseumScene })));

function initialMode(): ExperienceMode {
  const queryMode = new URLSearchParams(window.location.search).get('mode');
  if (queryMode === 'fallback' || queryMode === 'reduced' || queryMode === 'museum') return queryMode;
  return detectExperienceMode();
}

// 提前触发 3D 展馆 chunk 预加载，打破网络瀑布流
if (typeof window !== 'undefined' && initialMode() !== 'fallback') {
  loadMuseumScene();
}

export default function App() {
  const [mode, setMode] = useState<ExperienceMode>(initialMode);
  const [mobileNoticeOpen, setMobileNoticeOpen] = useState(() => mode === 'fallback' && window.innerWidth < 768);
  const [loading, setLoading] = useState(mode !== 'fallback');
  const [sceneReady, setSceneReady] = useState(false);
  const [introActive, setIntroActive] = useState(mode === 'museum');
  const [activeExhibit, setActiveExhibit] = useState<string | null>(null);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [sceneKey, setSceneKey] = useState(0);
  const motionEnabled = mode === 'museum';

  const finishIntro = useCallback(() => setIntroActive(false), []);
  const fallback = useCallback(() => {
    setMode('fallback');
    setLoading(false);
    setSceneReady(false);
    setIntroActive(false);
    setMobileNoticeOpen(window.innerWidth < 768);
  }, []);

  const handleSceneReady = useCallback(() => {
    setSceneReady(true);
  }, []);

  const handleLoadingFinish = useCallback(() => {
    setLoading(false);
  }, []);

  const handleSelectExhibit = useCallback((id: string | null) => {
    setActiveExhibit(id);
    setPanelCollapsed(false);
  }, []);

  const returnHome = useCallback(() => {
    setActiveExhibit(null);
    setPanelCollapsed(false);
    setSceneKey((value) => value + 1);
  }, []);

  const togglePanelCollapse = useCallback(() => {
    setPanelCollapsed((prev) => !prev);
  }, []);

  const fallbackContent = useMemo(() => (
    <div className="fallback-shell">
      {mobileNoticeOpen && <MobileNotice onContinue={() => setMobileNoticeOpen(false)} />}
      <MobileResume />
    </div>
  ), [mobileNoticeOpen]);

  if (mode === 'fallback') return fallbackContent;

  const isPanelOpen = Boolean(activeExhibit && !panelCollapsed);

  return (
    <main className="museum-shell" id="main-content">
      <Suspense fallback={null}>
        <MuseumScene
          key={sceneKey}
          activeExhibit={activeExhibit}
          panelOpen={isPanelOpen}
          introActive={introActive}
          motionEnabled={motionEnabled}
          onIntroComplete={finishIntro}
          onReady={handleSceneReady}
          onFallback={fallback}
          onSelectExhibit={handleSelectExhibit}
        />
      </Suspense>
      <MuseumHud
        activeExhibit={activeExhibit}
        introActive={introActive}
        onReturnHome={returnHome}
        onSelectExhibit={handleSelectExhibit}
        onSkipIntro={finishIntro}
      />
      {activeExhibit && (
        <ExhibitPanel
          exhibitId={activeExhibit}
          collapsed={panelCollapsed}
          onToggleCollapse={togglePanelCollapse}
          onClose={() => setActiveExhibit(null)}
        />
      )}
      {loading && <CyberLoadingScreen ready={sceneReady} onFinish={handleLoadingFinish} />}
    </main>
  );
}
