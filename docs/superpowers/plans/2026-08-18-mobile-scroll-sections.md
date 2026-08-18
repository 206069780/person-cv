# Mobile Scroll Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将移动端纵向简历改造成边界清晰、进入视口时渐进揭示并带有克制科技感反馈的模块化滚动页面。

**Architecture:** 新增独立滚动效果模块，使用一次性 `IntersectionObserver` 管理章节揭示，并用唯一的 passive scroll listener 和 `requestAnimationFrame` 更新顶部进度及 Hero CSS 变量。`MobileResume` 只声明章节结构、强调色和揭示顺序，视觉表现集中在现有样式表中。

**Tech Stack:** React 19、TypeScript 5.9、CSS、Vitest 4、Vite 7

## Global Constraints

- 只调整移动端和 WebGL 降级模式的纵向简历，不改变桌面 3D 展馆。
- 不修改简历数据、工程终端交互、电话、邮件和 PDF 下载行为。
- 不使用整屏吸附或劫持浏览器滚动。
- 动画只使用 `transform`、`opacity` 和伪元素绘制效果，位移范围为 8 至 20 像素，持续时间为 320 至 620 毫秒。
- `prefers-reduced-motion: reduce`、缺少 `IntersectionObserver` 或 JavaScript 观察失败时，所有内容必须可见。
- 当前工作区不是 Git 仓库；所有 Commit 步骤记录预期边界，但执行时必须跳过，不初始化仓库。

---

### Task 1: 可测试的滚动效果基础逻辑

**Files:**
- Create: `web/src/app/mobile-scroll.ts`
- Create: `web/src/app/mobile-scroll.test.ts`

**Interfaces:**
- Produces: `calculateScrollProgress(scrollTop: number, scrollHeight: number, clientHeight: number): number`
- Produces: `observeRevealOnce(element: Element, onReveal: () => void, Observer?: typeof IntersectionObserver): () => void`

- [ ] **Step 1: 写进度计算和一次性观察的失败测试**

```ts
import { describe, expect, it, vi } from 'vitest';
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
      constructor(next: IntersectionObserverCallback) { callback = next; }
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
    callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);

    expect(reveal).toHaveBeenCalledOnce();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: 运行测试并确认因模块不存在而失败**

Run: `npm test -- --run src/app/mobile-scroll.test.ts`

Expected: FAIL，提示无法解析 `./mobile-scroll`。

- [ ] **Step 3: 实现最小滚动逻辑**

```ts
export function calculateScrollProgress(scrollTop: number, scrollHeight: number, clientHeight: number) {
  const distance = scrollHeight - clientHeight;
  if (distance <= 0) return 1;
  return Math.min(1, Math.max(0, scrollTop / distance));
}

export function observeRevealOnce(
  element: Element,
  onReveal: () => void,
  Observer: typeof IntersectionObserver = globalThis.IntersectionObserver,
) {
  if (!Observer) {
    onReveal();
    return () => undefined;
  }
  const observer = new Observer((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    onReveal();
    observer.disconnect();
  }, { rootMargin: '0px 0px -20% 0px', threshold: 0.08 });
  observer.observe(element);
  return () => observer.disconnect();
}
```

- [ ] **Step 4: 运行定向测试**

Run: `npm test -- --run src/app/mobile-scroll.test.ts`

Expected: PASS，2 个测试全部通过。

- [ ] **Step 5: Commit 边界**

预期提交信息：`feat: add mobile scroll effect primitives`。当前目录不是 Git 仓库，执行时跳过提交。

### Task 2: 一次性揭示容器和页面进度组件

**Files:**
- Create: `web/src/components/ScrollReveal.tsx`
- Create: `web/src/components/ScrollProgress.tsx`
- Modify: `web/src/app/mobile-scroll.test.ts`
- Modify: `web/src/components/MobileResume.tsx`

**Interfaces:**
- Consumes: `observeRevealOnce`、`calculateScrollProgress`
- Produces: `ScrollReveal({ children, className?, delay?, variant? })`
- Produces: `ScrollProgress()`

- [ ] **Step 1: 补充组件接入和无观察器降级测试**

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MobileResume } from '../components/MobileResume';

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
```

- [ ] **Step 2: 运行测试并确认页面尚未接入滚动组件**

Run: `npm test -- --run src/app/mobile-scroll.test.ts`

Expected: FAIL，断言输出中缺少 `class="scroll-progress"`。

- [ ] **Step 3: 让观察器参数可选并实现组件**

`ScrollReveal.tsx`：

```tsx
import { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import { observeRevealOnce } from '../app/mobile-scroll';

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: 'section' | 'item' | 'terminal' | 'footer';
}

export function ScrollReveal({ children, className = '', delay = 0, variant = 'section' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(() => typeof IntersectionObserver === 'undefined');
  useEffect(() => {
    if (!ref.current || revealed) return;
    return observeRevealOnce(ref.current, () => setRevealed(true));
  }, [revealed]);
  return (
    <div
      ref={ref}
      className={`scroll-reveal scroll-reveal--${variant} ${className}`.trim()}
      data-revealed={revealed ? 'true' : 'false'}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
```

`ScrollProgress.tsx`：

```tsx
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
      barRef.current?.style.setProperty('--scroll-progress', String(progress));
      root.style.setProperty('--mobile-hero-progress', String(Math.min(1, root.scrollTop / Math.max(1, root.clientHeight * 0.7))));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
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
  return <div className="scroll-progress" aria-hidden="true"><span ref={barRef} /></div>;
}
```

同时在 `MobileResume` 根节点内渲染 `<ScrollProgress />`，并用一个 `<ScrollReveal>` 包裹现有工程终端，建立最小接入点。`observeRevealOnce` 的第三个参数保持可选，并在函数内部读取 `globalThis.IntersectionObserver`。

- [ ] **Step 4: 运行定向测试和类型检查**

Run: `npm test -- --run src/app/mobile-scroll.test.ts && npm run check`

Expected: 所有测试 PASS，TypeScript 无错误。

- [ ] **Step 5: Commit 边界**

预期提交信息：`feat: add mobile reveal and progress components`。当前目录不是 Git 仓库，执行时跳过提交。

### Task 3: 将纵向简历重组为滚动章节

**Files:**
- Modify: `web/src/components/MobileResume.tsx`

**Interfaces:**
- Consumes: `ScrollReveal`、`ScrollProgress`
- Preserves: `EngineeringConsole` 的 `variant="inline"` 与 `motionEnabled={false}` 行为

- [ ] **Step 1: 添加结构约束测试**

在 `web/src/app/mobile-scroll.test.ts` 中读取静态章节定义：

```ts
import { MOBILE_SECTION_ACCENTS } from './mobile-scroll';

it('rotates project accents without using one hue throughout', () => {
  expect(MOBILE_SECTION_ACCENTS).toEqual(['cyan', 'green', 'orange']);
});
```

- [ ] **Step 2: 运行测试并确认常量不存在**

Run: `npm test -- --run src/app/mobile-scroll.test.ts`

Expected: FAIL，提示 `MOBILE_SECTION_ACCENTS` 未导出。

- [ ] **Step 3: 增加强调色常量并重组组件**

在 `mobile-scroll.ts` 导出：

```ts
export const MOBILE_SECTION_ACCENTS = ['cyan', 'green', 'orange'] as const;
```

在 `MobileResume.tsx`：

- 页面根节点顶部渲染 `<ScrollProgress />`。
- Hero 增加 `mobile-module mobile-module--hero` 类和装饰状态线。
- 使用 `<ScrollReveal variant="terminal">` 包裹工程终端。
- 工作经历章节增加 `mobile-module mobile-module--experience`，每个经历条目使用 `variant="item"`，延迟按索引限制在 180ms 内。
- 每个项目章节增加 `mobile-module mobile-module--project` 和 `data-accent={MOBILE_SECTION_ACCENTS[projectIndex % 3]}`。
- 项目前导、背景条目和专题条目分别使用 `ScrollReveal`，保证长内容可以独立出现。
- Footer 使用 `variant="footer"` 包裹。
- 为各章节添加 `mobile-module__rail` 装饰元素并标记 `aria-hidden="true"`。

- [ ] **Step 4: 运行完整单测和类型检查**

Run: `npm test -- --run && npm run check`

Expected: 全部测试 PASS，TypeScript 无错误，已有终端与简历数据测试不回归。

- [ ] **Step 5: Commit 边界**

预期提交信息：`feat: structure mobile resume into reveal sections`。当前目录不是 Git 仓库，执行时跳过提交。

### Task 4: 科技感章节样式、减少动态效果与视觉验收

**Files:**
- Modify: `web/src/styles.css`

**Interfaces:**
- Consumes: `.scroll-reveal`、`.scroll-progress`、`.mobile-module`、`data-accent`
- Preserves: 桌面 `.museum-shell` 与 3D Canvas 样式

- [ ] **Step 1: 添加基础章节和揭示样式**

在移动简历样式附近添加：

```css
.fallback-shell {
  --mobile-accent: var(--museum-cyan);
  background: #071015;
}

.scroll-progress {
  position: fixed;
  inset: 0 0 auto;
  z-index: 90;
  height: 3px;
  background: rgba(255, 255, 255, 0.06);
  pointer-events: none;
}

.scroll-progress span {
  display: block;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, var(--museum-signal), var(--museum-cyan), var(--museum-safety));
  transform: scaleX(var(--scroll-progress, 0));
  transform-origin: left;
}

.mobile-module {
  position: relative;
  --section-accent: var(--museum-cyan);
  border-top: 1px solid color-mix(in srgb, var(--section-accent) 32%, transparent);
}

.mobile-module[data-accent="green"] { --section-accent: #62e8a4; }
.mobile-module[data-accent="orange"] { --section-accent: var(--museum-safety); }

.scroll-reveal {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 480ms ease var(--reveal-delay), transform 520ms cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay);
}

.scroll-reveal[data-revealed="true"] {
  opacity: 1;
  transform: translateY(0);
}
```

- [ ] **Step 2: 添加模块特有效果**

- Hero 使用 `--mobile-hero-progress` 实现最多 12px 的位移和轻微降亮度。
- 工程终端揭示后播放一次 620ms 扫描线，不覆盖按钮点击区域。
- 工作经历主线用伪元素从上向下缩放，每个揭示条目点亮节点。
- 项目标题边界线以 `scaleX` 展开，章节编号使用当前 `--section-accent`。
- 专题条目和背景条目保持无卡片的全宽分隔布局。
- Footer 只保留短淡入和收束边界线。

- [ ] **Step 3: 完善减少动态效果和窄屏约束**

```css
@media (prefers-reduced-motion: reduce) {
  .scroll-reveal,
  .scroll-reveal[data-revealed="true"],
  .mobile-resume__hero,
  .scroll-progress span {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
  }
}

@media (max-width: 767px) {
  .mobile-resume { padding-inline: 20px; }
  .mobile-module { scroll-margin-top: 16px; }
  .mobile-module__rail { right: -20px; }
}
```

- [ ] **Step 4: 构建并启动本地预览**

Run: `npm run build`

Expected: TypeScript 与 Vite 构建成功，无 CSS 解析错误。

Run: `npm run dev -- --host 0.0.0.0`

Expected: Vite 输出可访问的本地 URL。

- [ ] **Step 5: 浏览器视觉验收**

使用 `?mode=fallback` 分别检查 375x812 和 430x932：

- 首屏有下一章节提示，顶部进度条随滚动连续前进。
- 工程终端扫描线只播放一次，按钮和展开交互正常。
- 工作经历时间轴按顺序点亮。
- 项目强调色轮换，所有长文本完整且无重叠。
- 快速滚到底部后没有仍处于隐藏状态的正文。
- 模拟 `prefers-reduced-motion: reduce` 后所有内容立即可见且没有持续动画。

- [ ] **Step 6: 最终回归验证**

Run: `npm test -- --run && npm run check && npm run build`

Expected: 所有命令退出码为 0。

- [ ] **Step 7: Commit 边界**

预期提交信息：`feat: add mobile resume scroll storytelling`。当前目录不是 Git 仓库，执行时跳过提交。
