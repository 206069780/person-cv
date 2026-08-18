# 付道品数字简历展馆与 10 页投递简历实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task in the current session. Do not dispatch subagents and do not create Git commits for resume-related work.

**Goal:** 交付一套共享真实履历数据的电影级 3D 网页展馆、10 页可检索 PDF 和可编辑 DOCX，并提供可直接部署的 Docker/Nginx 配置。

**Architecture:** 在任务目录内建立独立的 Vite/React/TypeScript 前端，使用 React Three Fiber/Three.js 渲染全屏数字孪生展馆，使用 GSAP 管理可跳过的入场镜头。履历事实集中在 `resume-data.ts`，网页、移动降级页与文档生成脚本都从该文件对应的数据结构读取，避免重复维护。

**Tech Stack:** Vite、React、TypeScript、React Three Fiber、Three.js、GSAP、Lucide React、Vitest、Python、python-docx、ReportLab/LibreOffice、Poppler、Docker、Nginx。

## Global Constraints

- 不提交或暂存任何简历相关文件。
- 所有工作只发生在 `.ai/docs-Litree简历整理/`。
- 最终验证通过后，将交付副本整理到 `D:\CV\付道品-高级Java开发工程师\`，不覆盖 `D:\CV` 下其他内容。
- 目标岗位固定为“高级 Java 开发工程师”。
- `2023.10 至今` 经历固定为“立升净水科技”，删除“北京智能信通科技”。
- Litree 平台规模只写“覆盖国内外 10,000+ 水站”，不得扩写为个人独立交付量。
- 不虚构设备数、并发量、性能提升比例、项目金额或团队人数。
- Litree 第 3-8 页是同一个项目的六个专题，不拆成六个项目。
- 不使用语音或数字人；手机先提示电脑端体验更佳，再提供完整纵向简历。
- 网页主场景全屏无边框，采用已批准的电影级数字孪生方向；Agent 展厅才使用更强赛博效果。
- PDF 必须恰好 10 页、文本可检索；同时输出可编辑 DOCX。

## File Structure

- `web/package.json`：前端依赖与 test/build/check 脚本。
- `web/src/data/resume-data.ts`：网页唯一履历事实源及 TypeScript 类型。
- `web/src/data/resume-data.test.ts`：公司、规模、项目归属与禁用表述测试。
- `web/src/app/experience.ts`：设备能力、移动端、减少动态和 WebGL 降级判定。
- `web/src/app/experience.test.ts`：体验模式判定测试。
- `web/src/App.tsx`：加载、入场、探索、内容面板和降级页状态编排。
- `web/src/scene/MuseumScene.tsx`：全屏 3D 建筑、中央核心与展厅装置。
- `web/src/scene/IntroSequence.tsx`：可中断的相机入场序列。
- `web/src/scene/ExhibitHotspots.tsx`：展厅热点与项目导航事件。
- `web/src/components/MuseumHud.tsx`：姓名、指标、迷你地图、索引、下载与控制提示。
- `web/src/components/ExhibitPanel.tsx`：项目专题内容面板。
- `web/src/components/MobileResume.tsx`：手机/WebGL 降级纵向简历。
- `web/src/components/MobileNotice.tsx`：电脑端最佳体验提示。
- `web/src/styles.css`：批准后的视觉令牌、布局、响应式和减少动态规则。
- `web/public/resume/付道品-高级Java开发工程师.pdf`：网页下载的最终 PDF。
- `web/Dockerfile`、`web/nginx.conf`：静态部署配置。
- `documents/resume_content.json`：由网页事实源导出的文档中间数据。
- `documents/generate_resume.py`：生成 DOCX 和 10 页 PDF 的脚本。
- `documents/test_resume_content.py`：内容事实、页数和禁用表述测试。
- `documents/付道品-高级Java开发工程师.docx`：可编辑简历。
- `documents/付道品-高级Java开发工程师.pdf`：最终投递简历。
- `artifacts/web/`：桌面端、移动端和降级模式截图。
- `artifacts/pdf-pages/`：PDF 十页渲染图。

---

### Task 1: 建立履历事实源与约束测试

**Files:**
- Create: `.ai/docs-Litree简历整理/web/src/data/resume-data.ts`
- Create: `.ai/docs-Litree简历整理/web/src/data/resume-data.test.ts`
- Create: `.ai/docs-Litree简历整理/web/package.json`
- Create: `.ai/docs-Litree简历整理/web/tsconfig.json`
- Create: `.ai/docs-Litree简历整理/web/vite.config.ts`

**Interfaces:**
- Produces: `ResumeData`, `Project`, `Topic` types and `resumeData: ResumeData`.
- `resumeData.projects[0].topics` must contain exactly six Litree topics; later UI and document tasks consume this invariant.

- [ ] **Step 1: 写事实约束测试**

```ts
import { describe, expect, it } from 'vitest';
import { resumeData } from './resume-data';

describe('resume facts', () => {
  it('uses the confirmed current employer and platform scale', () => {
    expect(resumeData.experiences[0].company).toBe('立升净水科技');
    expect(resumeData.highlights).toContain('覆盖国内外 10,000+ 水站');
  });

  it('keeps the six Litree topics under one project', () => {
    expect(resumeData.projects[0].name).toBe('Litree 智慧水务云平台');
    expect(resumeData.projects[0].topics).toHaveLength(6);
  });

  it('contains no forbidden unsupported metrics or former employer', () => {
    const text = JSON.stringify(resumeData);
    expect(text).not.toContain('北京智能信通科技');
    expect(text).not.toMatch(/并发量|项目金额|团队人数|性能提升\s*\d+%/);
  });
});
```

- [ ] **Step 2: 运行测试并确认因模块不存在而失败**

Run: `cd .ai/docs-Litree简历整理/web && npm test -- --run src/data/resume-data.test.ts`

Expected: FAIL because `resume-data.ts` does not exist.

- [ ] **Step 3: 实现类型与完整履历数据**

```ts
export interface Topic {
  id: string;
  title: string;
  background: string;
  role: string;
  implementation: string[];
  challenges: string[];
  outcome: string;
  stack: string[];
}

export interface Project {
  id: string;
  name: string;
  company: string;
  period: string;
  summary: string;
  topics: Topic[];
}

export interface ResumeData {
  profile: { name: string; title: string; phone: string; email: string; summary: string };
  highlights: string[];
  experiences: Array<{ period: string; company: string; title: string; achievements: string[] }>;
  projects: Project[];
}
```

Populate the fields from approved sections 1-3 of `design.md`; preserve evidence boundaries verbatim.

- [ ] **Step 4: 运行事实测试**

Run: `npm test -- --run src/data/resume-data.test.ts`

Expected: 3 tests PASS.

- [ ] **Step 5: 检查未暂存、未提交状态**

Run: `git status --short -- .ai/docs-Litree简历整理`

Expected: resume files remain untracked/modified only; no staging or commit command is run.

### Task 2: 实现体验模式判定与移动降级页

**Files:**
- Create: `.ai/docs-Litree简历整理/web/src/app/experience.ts`
- Create: `.ai/docs-Litree简历整理/web/src/app/experience.test.ts`
- Create: `.ai/docs-Litree简历整理/web/src/components/MobileNotice.tsx`
- Create: `.ai/docs-Litree简历整理/web/src/components/MobileResume.tsx`

**Interfaces:**
- Produces: `selectExperienceMode(input): 'museum' | 'reduced' | 'fallback'`.
- `MobileResume` consumes `resumeData` and must expose all projects as semantic HTML.

- [ ] **Step 1: 写体验模式测试**

```ts
import { describe, expect, it } from 'vitest';
import { selectExperienceMode } from './experience';

describe('selectExperienceMode', () => {
  it('uses fallback on phones', () => expect(selectExperienceMode({ width: 375, webgl: true, reducedMotion: false })).toBe('fallback'));
  it('uses reduced mode when requested', () => expect(selectExperienceMode({ width: 1440, webgl: true, reducedMotion: true })).toBe('reduced'));
  it('uses the museum on capable desktop', () => expect(selectExperienceMode({ width: 1440, webgl: true, reducedMotion: false })).toBe('museum'));
  it('uses fallback without WebGL', () => expect(selectExperienceMode({ width: 1440, webgl: false, reducedMotion: false })).toBe('fallback'));
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- --run src/app/experience.test.ts`

Expected: FAIL because `selectExperienceMode` is missing.

- [ ] **Step 3: 实现纯函数与移动端组件**

```ts
export function selectExperienceMode(input: { width: number; webgl: boolean; reducedMotion: boolean }) {
  if (!input.webgl || input.width < 768) return 'fallback' as const;
  if (input.reducedMotion) return 'reduced' as const;
  return 'museum' as const;
}
```

`MobileNotice` displays `建议使用电脑端浏览，以获得完整 3D 展馆体验`; confirmation reveals `MobileResume` without loading the Canvas.

- [ ] **Step 4: 运行体验模式测试**

Run: `npm test -- --run src/app/experience.test.ts`

Expected: 4 tests PASS.

### Task 3: 实现电影级数字孪生场景

**Files:**
- Create: `.ai/docs-Litree简历整理/web/src/scene/MuseumScene.tsx`
- Create: `.ai/docs-Litree简历整理/web/src/scene/IntroSequence.tsx`
- Create: `.ai/docs-Litree简历整理/web/src/scene/ExhibitHotspots.tsx`
- Create: `.ai/docs-Litree简历整理/web/src/scene/scene-layout.ts`
- Create: `.ai/docs-Litree简历整理/web/src/scene/scene-layout.test.ts`

**Interfaces:**
- Produces: `EXHIBITS`, a stable array mapping project/topic ids to 3D positions and labels.
- `MuseumScene` accepts `{ activeExhibit, onSelectExhibit, introState, onIntroComplete }`.

- [ ] **Step 1: 写展厅映射测试**

```ts
import { expect, it } from 'vitest';
import { EXHIBITS } from './scene-layout';

it('maps every Litree topic plus two archive projects', () => {
  expect(EXHIBITS.filter((item) => item.projectId === 'litree')).toHaveLength(6);
  expect(EXHIBITS.map((item) => item.projectId)).toEqual(expect.arrayContaining(['welink', 'senge']));
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- --run src/scene/scene-layout.test.ts`

Expected: FAIL because `scene-layout.ts` is missing.

- [ ] **Step 3: 实现展厅坐标、建筑和装置**

Use a central cylindrical core, steel portal frames, floor rails, water/data light strips, six Litree wings and two archive bays. Use procedural Three.js geometry and PBR materials; do not use decorative HTML cards as the primary scene.

```ts
export const EXHIBITS = [
  { id: 'litree-overview', projectId: 'litree', position: [0, 1.4, -6], label: '平台总览' },
  { id: 'litree-device-data', projectId: 'litree', position: [-7, 1.4, -3], label: '设备与数据' },
  { id: 'litree-aiot', projectId: 'litree', position: [7, 1.4, -3], label: 'AIoT 协议' },
  { id: 'litree-gis', projectId: 'litree', position: [-7, 1.4, 4], label: 'GIS / DMA' },
  { id: 'litree-oa', projectId: 'litree', position: [7, 1.4, 4], label: 'OA / HR' },
  { id: 'litree-agent', projectId: 'litree', position: [0, 1.4, 8], label: 'Agent 工程化' },
  { id: 'welink', projectId: 'welink', position: [-11, 1.4, 8], label: '华为 WeLink' },
  { id: 'senge', projectId: 'senge', position: [11, 1.4, 8], label: '森格智慧水务' },
] as const;
```

- [ ] **Step 4: 实现可中断入场与控制权切换**

The camera sequence lasts 6-8 seconds, exposes `skipIntro()`, cancels GSAP tweens on unmount, and only enables free controls after completion or skip.

- [ ] **Step 5: 运行展厅映射测试**

Run: `npm test -- --run src/scene/scene-layout.test.ts`

Expected: PASS.

### Task 4: 实现 HUD、展厅内容与整站状态编排

**Files:**
- Create: `.ai/docs-Litree简历整理/web/src/components/MuseumHud.tsx`
- Create: `.ai/docs-Litree简历整理/web/src/components/ExhibitPanel.tsx`
- Create: `.ai/docs-Litree简历整理/web/src/App.tsx`
- Create: `.ai/docs-Litree简历整理/web/src/main.tsx`
- Create: `.ai/docs-Litree简历整理/web/index.html`
- Create: `.ai/docs-Litree简历整理/web/src/styles.css`
- Create: `.ai/docs-Litree简历整理/web/src/App.test.tsx`

**Interfaces:**
- `MuseumHud` emits `onSkipIntro`, `onSelectExhibit`, `onReturnHome` and PDF download actions.
- `ExhibitPanel` consumes a `Topic` or archive `Project` and remains readable without Canvas.

- [ ] **Step 1: 写关键可访问性与移动文案测试**

```tsx
it('offers skip, project navigation and PDF download', () => {
  render(<App forcedMode="reduced" />);
  expect(screen.getByRole('button', { name: '跳过入场动画' })).toBeInTheDocument();
  expect(screen.getByRole('navigation', { name: '项目索引' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '下载 PDF 简历' })).toHaveAttribute('href', '/resume/付道品-高级Java开发工程师.pdf');
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- --run src/App.test.tsx`

Expected: FAIL because `App` is missing.

- [ ] **Step 3: 实现应用状态和全屏 UI**

Use explicit states `loading | intro | exploring | exhibit | fallback`; preserve navigation and semantic content outside the Canvas. All icon-only controls use Lucide icons, tooltips and `aria-label`.

- [ ] **Step 4: 实现批准后的视觉令牌和响应式规则**

Use `#030708`, `#0A1113`, `#26343A`, `#62E8CF`, `#FF6B3D`, `#ECF5F2`, `#93A8A2`; 0-4px panel radius; 44px targets; no purple gradient, nested cards, or overlapping fixed UI.

- [ ] **Step 5: 运行组件与全部前端测试**

Run: `npm test -- --run`

Expected: all tests PASS.

### Task 5: 构建与部署配置

**Files:**
- Create: `.ai/docs-Litree简历整理/web/Dockerfile`
- Create: `.ai/docs-Litree简历整理/web/nginx.conf`
- Create: `.ai/docs-Litree简历整理/web/.dockerignore`

**Interfaces:**
- Produces a static app served on container port `80` with SPA fallback and long-lived cache headers for hashed assets.

- [ ] **Step 1: 添加生产构建脚本并运行**

Run: `cd .ai/docs-Litree简历整理/web && npm run build`

Expected: `dist/index.html` and hashed JS/CSS assets are produced with no TypeScript errors.

- [ ] **Step 2: 实现多阶段 Docker 构建**

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

- [ ] **Step 3: 验证静态服务**

Run: `npm run preview -- --host 127.0.0.1 --port 4173`

Expected: server starts at `http://127.0.0.1:4173/` and remains available for browser verification.

### Task 6: 生成同源 DOCX 与 10 页 PDF

**Files:**
- Create: `.ai/docs-Litree简历整理/documents/resume_content.json`
- Create: `.ai/docs-Litree简历整理/documents/generate_resume.py`
- Create: `.ai/docs-Litree简历整理/documents/test_resume_content.py`
- Create: `.ai/docs-Litree简历整理/documents/付道品-高级Java开发工程师.docx`
- Create: `.ai/docs-Litree简历整理/documents/付道品-高级Java开发工程师.pdf`

**Interfaces:**
- `resume_content.json` mirrors the identifiers and text in `resume-data.ts`.
- `generate_resume.py --output-dir documents` writes both final files and exits non-zero unless the PDF has exactly 10 pages.

- [ ] **Step 1: 写文档内容测试**

```python
def test_confirmed_facts(content):
    text = json.dumps(content, ensure_ascii=False)
    assert "立升净水科技" in text
    assert "国内外 10,000+ 水站" in text
    assert "北京智能信通科技" not in text
    assert len(content["pages"]) == 10
    assert content["pages"][2]["project_id"] == "litree"
    assert content["pages"][7]["project_id"] == "litree"
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `python -m pytest documents/test_resume_content.py -q`

Expected: FAIL because `resume_content.json` is missing.

- [ ] **Step 3: 编写十页结构化内容和生成脚本**

Pages: cover, core resume, Litree overview, device/data, AIoT/protocols, GIS/DMA, OA/HR, Agent engineering, Huawei WeLink, Senge 0-1. Use paragraph and table APIs, not screenshots or flattened page images.

- [ ] **Step 4: 生成 DOCX 与 PDF**

Run: `python documents/generate_resume.py --output-dir documents`

Expected: both files exist; PDF page count is exactly 10.

- [ ] **Step 5: 运行文档内容测试并复制 PDF 到网页**

Run: `python -m pytest documents/test_resume_content.py -q`

Expected: all tests PASS. Then copy the verified PDF to `web/public/resume/付道品-高级Java开发工程师.pdf`.

### Task 7: 浏览器、Canvas 与 PDF 视觉验证

**Files:**
- Create: `.ai/docs-Litree简历整理/artifacts/web/desktop-1440.png`
- Create: `.ai/docs-Litree简历整理/artifacts/web/desktop-1920.png`
- Create: `.ai/docs-Litree简历整理/artifacts/web/mobile-375.png`
- Create: `.ai/docs-Litree简历整理/artifacts/web/reduced-motion.png`
- Create: `.ai/docs-Litree简历整理/artifacts/pdf-pages/page-01.png` through `page-10.png`

**Interfaces:**
- Verification consumes the running preview server and final PDF; it produces evidence only, not new product behavior.

- [ ] **Step 1: 验证桌面端 3D 场景**

Open the preview at 1440×900 and 1920×1080. Capture screenshots after the intro and compute a Canvas non-background pixel ratio; fail if the Canvas is blank or the core is outside the viewport.

- [ ] **Step 2: 验证手机提示与纵向简历**

At 375×812, confirm the desktop-experience notice appears first, then confirm the complete vertical resume is reachable without horizontal scrolling.

- [ ] **Step 3: 验证减少动态和错误降级**

Emulate `prefers-reduced-motion: reduce` and unavailable WebGL. Confirm no cinematic camera movement runs and semantic project content plus PDF download remain available.

- [ ] **Step 4: 渲染并检查全部 PDF 页面**

Run: `pdftoppm -png -r 144 documents/付道品-高级Java开发工程师.pdf artifacts/pdf-pages/page`

Expected: exactly ten PNG files, with no clipped, overlapping, blank or mojibake content.

- [ ] **Step 5: 验证 PDF 文本提取**

Run: `pdftotext documents/付道品-高级Java开发工程师.pdf - | rg "付道品|高级 Java 开发工程师|立升净水科技|10,000\+|华为 WeLink|森格智慧水务"`

Expected: all required terms are present in extracted text.

### Task 8: 完成任务验收与归档

**Files:**
- Modify: `.ai/docs-Litree简历整理/task.md`
- Create during archive: `02-AI产出/docs-Litree简历整理/DONE.md`

- [ ] **Step 1: 运行最终验证集合**

Run: `cd .ai/docs-Litree简历整理/web && npm test -- --run && npm run build`

Run: `cd .ai/docs-Litree简历整理 && python -m pytest documents/test_resume_content.py -q`

Expected: all tests PASS and build succeeds.

- [ ] **Step 2: 对照验收标准更新 task.md**

Check each item only after the corresponding web/PDF evidence exists. Record any intentionally unsupported claim as omitted, not pending.

- [ ] **Step 3: 确认没有提交或暂存简历文件**

Run: `git status --short -- .ai/docs-Litree简历整理`

Expected: no staged entries; no Git commit is created.

- [ ] **Step 4: 整理 D:\CV 交付副本**

Copy the verified `web/`, final DOCX/PDF and a concise `README.md` into `D:\CV\付道品-高级Java开发工程师\`. Exclude `node_modules`, test caches, temporary renders and local preview artifacts.

Expected: the delivery folder contains deployable source code, Docker/Nginx files, the editable DOCX and the final 10-page PDF.

- [ ] **Step 5: 归档三态任务**

Run: `python agents/skills/litree-task/scripts/task.py archive docs-Litree简历整理`

Expected: task moves from `.ai/docs-Litree简历整理/` to `02-AI产出/docs-Litree简历整理/` and `DONE.md` is generated. Human review determines any later move to `docs/` or `01-评审/`.

## Workflow Decisions

- 不创建 `subagents.md`：网页、履历数据和 PDF 内容高度耦合，且当前会话按要求不启用子 Agent。
- 创建独立评审记录：产物跨网页、构建、部署和文档生成，超过五个文件；最终由人工结合浏览器截图、PDF 十页渲染图和测试结果评审。
- 未解决问题统一写入 `DONE.md` 的残余风险，不在简历正文保留 `TBD`、`TODO` 或占位文案。
