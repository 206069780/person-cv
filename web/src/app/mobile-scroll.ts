export const MOBILE_SECTION_ACCENTS = ['cyan', 'green', 'orange'] as const;

export function calculateScrollProgress(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
) {
  const scrollDistance = scrollHeight - clientHeight;
  if (scrollDistance <= 0) return 1;

  return Math.min(1, Math.max(0, scrollTop / scrollDistance));
}

export function observeRevealOnce(
  element: Element,
  onReveal: () => void,
  Observer: typeof IntersectionObserver | undefined = globalThis.IntersectionObserver,
) {
  if (!Observer) {
    onReveal();
    return () => undefined;
  }

  const observer = new Observer((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;

    onReveal();
    observer.disconnect();
  }, {
    rootMargin: '0px 0px -20% 0px',
    threshold: 0.08,
  });

  observer.observe(element);
  return () => observer.disconnect();
}
