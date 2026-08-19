import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

import { observeRevealOnce } from '../app/mobile-scroll';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: 'section' | 'item' | 'terminal' | 'footer';
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  variant = 'section',
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (!elementRef.current || revealed) return;

    return observeRevealOnce(elementRef.current, () => setRevealed(true));
  }, [revealed]);

  return (
    <div
      ref={elementRef}
      className={`scroll-reveal scroll-reveal--${variant} ${className}`.trim()}
      data-revealed={revealed ? 'true' : 'false'}
      style={delay > 0 ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
