import { useEffect, useRef } from 'react';

import { calculateScrollProgress } from '../app/mobile-scroll';

interface ScrollProgressProps {
  markers?: number;
}

export function ScrollProgress({ markers = 0 }: ScrollProgressProps) {
  const barRef = useRef<HTMLSpanElement>(null);
  const markersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let lastPassedIndex = -1;

    const update = () => {
      frame = 0;
      const root = document.documentElement;
      const scrollTop = Math.max(0, root.scrollTop);
      const progress = calculateScrollProgress(scrollTop, root.scrollHeight, root.clientHeight);

      // 直接操作进度条变换，零全局 Style Recalculation 开销
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }

      // 仅在跨越节点阈值时才局部更新 marker 节点状态，避免高频 DOM 遍历
      const currentPassedIndex = Math.floor(progress * (markers + 1)) - 1;
      if (currentPassedIndex !== lastPassedIndex && markersRef.current) {
        lastPassedIndex = currentPassedIndex;
        const nodes = markersRef.current.children;
        for (let i = 0; i < nodes.length; i++) {
          const isPassed = i <= currentPassedIndex;
          const targetPassedStr = isPassed ? 'true' : 'false';
          const node = nodes[i] as HTMLElement;
          if (node.dataset.passed !== targetPassedStr) {
            node.dataset.passed = targetPassedStr;
          }
        }
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
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

