import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CyberLoadingScreenProps {
  ready: boolean;
  onFinish: () => void;
}

interface LogEntry {
  id: string;
  tag: string;
  text: string;
  status: 'pending' | 'active' | 'done';
}

export function CyberLoadingScreen({ ready, onFinish }: CyberLoadingScreenProps) {
  const { t } = useTranslation();

  const bootLogs = useMemo<readonly Omit<LogEntry, 'status'>[]>(
    () => [
      { id: 'engine', tag: 'KERNEL', text: t('loading.logs.engine') },
      { id: 'topology', tag: 'AIoT', text: t('loading.logs.topology') },
      { id: 'mesh', tag: 'ARCH', text: t('loading.logs.mesh') },
      { id: 'optics', tag: 'OPTICS', text: t('loading.logs.optics') },
      { id: 'neural', tag: 'SYSTEM', text: t('loading.logs.neural') },
    ],
    [t],
  );

  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const [warpFlash, setWarpFlash] = useState(false);
  const currentProgressRef = useRef(0);
  const finishedRef = useRef(false);

  // 平滑进度仿真引擎
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const updateProgress = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const target = ready ? 100 : 92;
      const speed = ready ? 140 : (100 - currentProgressRef.current) * 1.8 + 15;

      if (currentProgressRef.current < target) {
        currentProgressRef.current = Math.min(target, currentProgressRef.current + speed * dt);
        setProgress(Math.round(currentProgressRef.current));
      }

      if (currentProgressRef.current >= 100 && ready && !finishedRef.current) {
        finishedRef.current = true;
        setWarpFlash(true);
        setTimeout(() => {
          setFading(true);
        }, 180);
        setTimeout(() => {
          onFinish();
        }, 580);
        return;
      }

      animId = requestAnimationFrame(updateProgress);
    };

    animId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animId);
  }, [ready, onFinish]);

  // 根据进度动态激活的日志
  const visibleLogs = useMemo<LogEntry[]>(() => {
    return bootLogs.map((item, idx) => {
      const threshold = (idx + 1) * 18;
      let status: LogEntry['status'] = 'pending';
      if (progress >= threshold) {
        status = 'done';
      } else if (progress >= threshold - 16) {
        status = 'active';
      }
      return { ...item, status };
    });
  }, [bootLogs, progress]);

  // 16 格分段能量指示器
  const segments = useMemo(() => Array.from({ length: 16 }, (_, i) => i), []);
  const activeSegmentsCount = Math.floor((progress / 100) * 16);

  return (
    <div
      className={`cyber-loading-screen ${fading ? 'is-fading' : ''} ${warpFlash ? 'is-warping' : ''}`}
      role="status"
      aria-live="polite"
    >
      {/* 赛博网格与全息粒子背景 */}
      <div className="cyber-loading__bg-grid" aria-hidden="true" />
      <div className="cyber-loading__scanline" aria-hidden="true" />
      <div className="cyber-loading__ambient-glow" aria-hidden="true" />

      {/* 四角赛博定位瞄准标角 */}
      <div className="cyber-loading__corner top-left" aria-hidden="true" />
      <div className="cyber-loading__corner top-right" aria-hidden="true" />
      <div className="cyber-loading__corner bottom-left" aria-hidden="true" />
      <div className="cyber-loading__corner bottom-right" aria-hidden="true" />

      {/* 顶部遥测状态栏 */}
      <header className="cyber-loading__header">
        <div className="cyber-loading__brand">
          <span className="cyber-loading__pulse-dot" />
          <span className="cyber-loading__brand-title">DIGITAL TWIN ARCHITECTURE OS</span>
          <span className="cyber-loading__badge">v3.8 · PROD</span>
        </div>
        <div className="cyber-loading__sysinfo">
          <span>GRAPHICS: WEBGL 2.0 PBR</span>
          <span>LATENCY: 1.2ms</span>
          <span>NODE: 0x7F001</span>
        </div>
      </header>

      {/* 中央全息多层自旋反应炉与能量核 */}
      <div className="cyber-loading__center-stage">
        <div className="cyber-loading__reactor" aria-hidden="true">
          {/* 最外层刻度环 */}
          <div className="cyber-loading__ring ring-outer" />
          {/* 逆向旋转多边形骨骼 */}
          <div className="cyber-loading__ring ring-mid-rev" />
          {/* 高速能量轮 */}
          <div className="cyber-loading__ring ring-inner" />
          {/* 4 向能量聚光点 */}
          <div className="cyber-loading__emitters">
            <span className="emitter-n" />
            <span className="emitter-s" />
            <span className="emitter-w" />
            <span className="emitter-e" />
          </div>
          {/* 核心发光数据晶体与动态百分比 */}
          <div className="cyber-loading__core">
            <span className="cyber-loading__percent-val">{progress}</span>
            <span className="cyber-loading__percent-sym">%</span>
          </div>
        </div>

        {/* 主标题与当前阶段指示 */}
        <div className="cyber-loading__title-wrap">
          <p className="eyebrow cyber-loading__sub-label">
            {ready ? t('loading.subReady') : t('loading.subIdle')}
          </p>
          <h2 className="cyber-loading__main-title">
            {ready ? t('loading.titleReady') : t('loading.titleIdle')}
          </h2>
        </div>

        {/* 16段高能等离子矩阵进度条 */}
        <div className="cyber-loading__meter-wrap" aria-hidden="true">
          <div className="cyber-loading__meter-info">
            <span className="meter-info-left">STREAM: 2.4 GB/S</span>
            <span className="meter-info-right">{progress === 100 ? 'READY' : 'LOADING ASSETS...'}</span>
          </div>
          <div className="cyber-loading__segments-track">
            {segments.map((idx) => {
              const isActive = idx < activeSegmentsCount;
              const isCurrent = idx === activeSegmentsCount;
              return (
                <div
                  key={idx}
                  className={`cyber-loading__segment ${isActive ? 'is-active' : ''} ${isCurrent ? 'is-current' : ''}`}
                />
              );
            })}
          </div>
        </div>

        {/* 动态系统自检指令终端流水 */}
        <div className="cyber-loading__terminal" aria-hidden="true">
          <div className="cyber-loading__terminal-bar">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">BOOT_DIAGNOSTICS_CONSOLE.SH</span>
          </div>
          <div className="cyber-loading__terminal-body">
            {visibleLogs.map((log) => (
              <div key={log.id} className={`cyber-loading__log-line is-${log.status}`}>
                <span className="log-prefix">&gt;</span>
                <span className="log-tag">[{log.tag}]</span>
                <span className="log-text">{log.text}</span>
                <span className="log-status">
                  {log.status === 'done' ? '[OK]' : log.status === 'active' ? '[LOAD...]' : '[WAIT]'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部版权与架构声明 */}
      <footer className="cyber-loading__footer">
        <span>FU DAOPIN · SENIOR JAVA & DISTRIBUTED SYSTEMS ARCHITECT</span>
        <span>SECURE BOOT // TLS 1.3 // HIGH CONCURRENCY ENGINE</span>
      </footer>
    </div>
  );
}
