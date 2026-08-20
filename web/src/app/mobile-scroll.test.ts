import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { MobileResume } from '../components/MobileResume';
import { ScrollProgress } from '../components/ScrollProgress';
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
    let observerOptions: IntersectionObserverInit | undefined;
    const Observer = class {
      constructor(next: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        callback = next;
        observerOptions = options;
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
    expect(observerOptions?.rootMargin).toBe('0px 0px -8% 0px');
  });

  it('falls back to visible content without IntersectionObserver', () => {
    const reveal = vi.fn();

    observeRevealOnce({} as Element, reveal, undefined);

    expect(reveal).toHaveBeenCalledOnce();
  });

  it('falls back to visible content when observer setup fails', () => {
    const reveal = vi.fn();
    const BrokenObserver = class {
      constructor() {
        throw new Error('observer unavailable');
      }
    } as unknown as typeof IntersectionObserver;

    expect(() => observeRevealOnce({} as Element, reveal, BrokenObserver)).not.toThrow();
    expect(reveal).toHaveBeenCalledOnce();
  });

  it('renders mobile progress and visible reveal content on the server', () => {
    const html = renderToStaticMarkup(createElement(MobileResume));

    expect(html).toContain('class="scroll-progress"');
    expect(html).toContain('data-revealed="true"');
    expect(html).toContain('data-motion="full"');
  });

  it('rotates project accents without using one hue throughout', () => {
    const accents = (mobileScroll as unknown as Record<string, unknown>).MOBILE_SECTION_ACCENTS;

    expect(accents).toEqual(['cyan', 'green', 'orange']);
  });

  it('limits background parallax to twenty-four pixels', () => {
    const calculate = (mobileScroll as unknown as Record<string, unknown>).calculateParallaxOffset;

    expect(calculate).toBeTypeOf('function');
    expect((calculate as (scrollTop: number) => number)(0)).toBe(0);
    expect((calculate as (scrollTop: number) => number)(600)).toBe(12);
    expect((calculate as (scrollTop: number) => number)(2400)).toBe(24);
  });

  it('renders one progress pulse node for every major section', () => {
    const html = renderToStaticMarkup(createElement(ScrollProgress, { markers: 5 }));

    expect(html.match(/scroll-progress__node/g)).toHaveLength(5);
  });

  it('keeps the mobile resume on the document scroller', () => {
    const entry = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
    const css = [...entry.matchAll(/@import '(.+)';/g)]
      .map(([, path]) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'))
      .join('');
    const rules = [
      css.match(/^html\s*\{([^}]+)\}/m)?.[1],
      css.match(/^body\s*\{([^}]+)\}/m)?.[1],
      css.match(/\.fallback-shell\s*\{([^}]+)\}/)?.[1],
    ];

    expect(rules.every(Boolean)).toBe(true);

    // overflow-x:hidden 会把未声明的 overflow-y 计算成 auto。
    // 写在 html/body 上会和视口各产生一条滚动条；写在内容外壳上会形成嵌套滚动，手机端手势被截住。
    for (const rule of rules) {
      expect(rule).not.toMatch(/overflow(?:-x|-y)?\s*:/);
      expect(rule).not.toMatch(/overscroll-behavior/);
      expect(rule).not.toMatch(/-webkit-overflow-scrolling/);
    }
  });
});
