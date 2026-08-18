import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { MobileResume } from '../components/MobileResume';
import * as mobileScroll from './mobile-scroll';
import { calculateScrollProgress, observeRevealOnce } from './mobile-scroll';

describe('mobile scroll effects', () => {
  it('clamps document progress between zero and one', () => {
    expect(calculateScrollProgress(0, 2000, 500)).toBe(0);
    expect(calculateScrollProgress(750, 2000, 500)).toBe(0.5);
    expect(calculateScrollProgress(1800, 2000, 500)).toBe(1);
    expect(calculateScrollProgress(20, 500, 500)).toBe(1);
  });

  it('reveals once after intersection and disconnects', () => {
    const reveal = vi.fn();
    const disconnect = vi.fn();
    let callback: IntersectionObserverCallback = () => undefined;
    const Observer = class {
      constructor(next: IntersectionObserverCallback) {
        callback = next;
      }

      observe = vi.fn();
      disconnect = disconnect;
      unobserve = vi.fn();
      takeRecords = vi.fn(() => []);
      root = null;
      rootMargin = '';
      thresholds = [];
    } as unknown as typeof IntersectionObserver;
    const element = {} as Element;

    observeRevealOnce(element, reveal, Observer);
    callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

    expect(reveal).toHaveBeenCalledOnce();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('falls back to visible content without IntersectionObserver', () => {
    const reveal = vi.fn();

    observeRevealOnce({} as Element, reveal, undefined);

    expect(reveal).toHaveBeenCalledOnce();
  });

  it('renders mobile progress and visible reveal content on the server', () => {
    const html = renderToStaticMarkup(createElement(MobileResume));

    expect(html).toContain('class="scroll-progress"');
    expect(html).toContain('data-revealed="true"');
  });

  it('rotates project accents without using one hue throughout', () => {
    const accents = (mobileScroll as unknown as Record<string, unknown>).MOBILE_SECTION_ACCENTS;

    expect(accents).toEqual(['cyan', 'green', 'orange']);
  });
});
