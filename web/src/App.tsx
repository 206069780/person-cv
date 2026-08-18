import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { detectExperienceMode, ExperienceMode } from './app/experience';
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

function LoadingScreen({ ready, onFinish }: { ready: boolean; onFinish: () => void }) {
  const [stage, setStage] = useState('初始化孪生引擎...');
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStage('构建水务数字展馆...'), 180);
    const t2 = setTimeout(() => setStage('编译着色器与就绪...'), 380);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (ready) {
      setFading(true);
      const timer = setTimeout(onFinish, 350);
      return () => clearTimeout(timer);
    }
  }, [ready, onFinish]);

  return (
    <div className={`loading-screen ${fading ? 'is-fading' : ''}`} role="status" aria-live="polite">
      <div className="loading-screen__mark" aria-hidden="true"><i /><i /><i /></div>
      <p className="eyebrow">LITREE DIGITAL TWIN</p>
      <strong>{ready ? '展馆就绪 · 进入场景' : stage}</strong>
      <div className="loading-screen__track"><span /></div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState<ExperienceMode>(initialMode);
  const [mobileNoticeOpen, setMobileNoticeOpen] = useState(() => mode === 'fallback' && window.innerWidth < 768);
  const [loading, setLoading] = useState(mode !== 'fallback');
  const [sceneReady, setSceneReady] = useState(false);
  const [introActive, setIntroActive] = useState(mode === 'museum');
  const [activeExhibit, setActiveExhibit] = useState<string | null>(null);
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
          onReady={handleSceneReady}
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
      {loading && <LoadingScreen ready={sceneReady} onFinish={handleLoadingFinish} />}
    </main>
  );
}
