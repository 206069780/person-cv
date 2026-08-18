import { useEffect, useRef } from 'react';

import { calculateParallaxOffset, calculateScrollProgress } from '../app/mobile-scroll';

interface ScrollProgressProps {
  markers?: number;
}

export function ScrollProgress({ markers = 0 }: ScrollProgressProps) {
  const barRef = useRef<HTMLSpanElement>(null);
  const markersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const root = document.documentElement;
      const progress = calculateScrollProgress(root.scrollTop, root.scrollHeight, root.clientHeight);
      const heroProgress = Math.min(1, root.scrollTop / Math.max(1, root.clientHeight * 0.7));
      const parallaxOffset = calculateParallaxOffset(root.scrollTop);

      barRef.current?.style.setProperty('--scroll-progress', String(progress));
      root.style.setProperty('--mobile-hero-progress', String(heroProgress));
      root.style.setProperty('--mobile-hero-offset', `${heroProgress * -12}px`);
      root.style.setProperty('--mobile-hero-opacity', String(1 - heroProgress * 0.08));
      root.style.setProperty('--mobile-grid-offset', `${parallaxOffset}px`);
      root.style.setProperty('--mobile-depth-offset', `${parallaxOffset * -0.35}px`);
      markersRef.current?.querySelectorAll<HTMLElement>('.scroll-progress__node').forEach((node, index) => {
        node.dataset.passed = progress >= (index + 1) / (markers + 1) ? 'true' : 'false';
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
      document.documentElement.style.removeProperty('--mobile-hero-progress');
      document.documentElement.style.removeProperty('--mobile-hero-offset');
      document.documentElement.style.removeProperty('--mobile-hero-opacity');
      document.documentElement.style.removeProperty('--mobile-grid-offset');
      document.documentElement.style.removeProperty('--mobile-depth-offset');
    };
  }, [markers]);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span ref={barRef} />
      <div className="scroll-progress__markers" ref={markersRef}>
        {Array.from({ length: markers }, (_, index) => (
          <i
            className="scroll-progress__node"
            data-passed="false"
            key={index}
            style={{ left: `${((index + 1) / (markers + 1)) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
