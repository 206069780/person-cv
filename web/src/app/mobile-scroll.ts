export const MOBILE_SECTION_ACCENTS = ['cyan', 'green', 'orange'] as const;

export function calculateParallaxOffset(scrollTop: number) {
  return Math.min(24, Math.max(0, scrollTop * 0.02));
}

export function calculateScrollProgress(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
) {
  const scrollDistance = scrollHeight - clientHeight;
  if (scrollDistance <= 0) return 1;

  return Math.min(1, Math.max(0, scrollTop / scrollDistance));
}

let sharedDefaultObserver: IntersectionObserver | null = null;
const revealCallbacks = new WeakMap<Element, () => void>();

export function observeRevealOnce(
  element: Element,
  onReveal: () => void,
  Observer: typeof IntersectionObserver | undefined = globalThis.IntersectionObserver,
) {
  if (!Observer) {
    onReveal();
    return () => undefined;
  }

  // 支持测试环境传入的自定义 Mock Observer
  if (Observer !== globalThis.IntersectionObserver) {
    try {
      const observer = new Observer((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        onReveal();
        observer.disconnect();
      }, {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.08,
      });

      observer.observe(element);
      return () => observer.disconnect();
    } catch {
      onReveal();
      return () => undefined;
    }
  }

  // 生产环境：采用单一全局共享 IntersectionObserver，极大减少移动端内核调度与内存开销
  try {
    if (!sharedDefaultObserver) {
      sharedDefaultObserver = new globalThis.IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const cb = revealCallbacks.get(entry.target);
            if (cb) {
              cb();
              revealCallbacks.delete(entry.target);
              sharedDefaultObserver?.unobserve(entry.target);
            }
          }
        }
      }, {
        rootMargin: '50px 0px 50px 0px', // 提前 50px 预加载，避免滑动到底部等待
        threshold: 0.02,
      });
    }

    revealCallbacks.set(element, onReveal);
    sharedDefaultObserver.observe(element);

    return () => {
      revealCallbacks.delete(element);
      sharedDefaultObserver?.unobserve(element);
    };
  } catch {
    onReveal();
    return () => undefined;
  }
}

