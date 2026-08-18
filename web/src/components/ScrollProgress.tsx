import { useEffect, useRef } from 'react';

import { calculateScrollProgress } from '../app/mobile-scroll';

export function ScrollProgress() {
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const root = document.documentElement;
      const progress = calculateScrollProgress(root.scrollTop, root.scrollHeight, root.clientHeight);
      const heroProgress = Math.min(1, root.scrollTop / Math.max(1, root.clientHeight * 0.7));

      barRef.current?.style.setProperty('--scroll-progress', String(progress));
      root.style.setProperty('--mobile-hero-progress', String(heroProgress));
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
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span ref={barRef} />
    </div>
  );
}
