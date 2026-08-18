# 简历视觉升级 Implementation Plan

> **For agentic workers:** 在当前会话内逐项执行；本任务禁止提交或暂存简历相关文件。

**Goal:** 将付道品高级 Java 开发工程师简历升级为 10 页可检索工程案例册，并将网页升级为可部署的工业数字孪生 3D 展馆。

**Architecture:** `web/src/data/resume-data.json` 继续作为网页、DOCX 与 PDF 的统一事实源。PDF 由 ReportLab 直接绘制可搜索文本，网页由 React HUD 与 React Three Fiber 程序化场景分别负责信息与空间叙事，并保留移动端、WebGL 失败和减少动态三种降级路径。

**Tech Stack:** Python、ReportLab、python-docx、React 19、TypeScript、Vite、React Three Fiber、Three.js、GSAP、Vitest、Docker/Nginx。

## Global Constraints

- 目标岗位固定为“高级 Java 开发工程师”。
- 当前经历固定为“2023.10 至今 立升净水科技 | 高级 Java 开发工程师”。
- Litree 固定为国内外 `10w+` 水站，3-8 页是同一个项目的六个工程专题。
- 第 9 页为“华为 WeLink”，第 10 页为“森格智慧水务平台 0-1 建设”。
- 不虚构设备数、并发量、性能提升比例、项目金额和团队人数。
- PDF 必须恰好 10 页，正文可直接搜索；网页不得使用数字人、语音介绍、紫色通用 AI 渐变或无业务含义的装饰粒子。
- 手机端先提示“建议使用电脑端浏览，以获得完整 3D 展馆体验”，确认后展示完整纵向简历且不加载 Three.js。
- 最终文件同步到 `D:\CV\付道品-高级Java开发工程师`，不执行 Git 暂存或提交。

---

### Task 1: 建立统一事实层

**Files:**
- Modify: `web/src/data/resume-data.json`
- Modify: `web/src/data/resume-data.ts`
- Test: `web/src/data/resume-data.test.ts`

**Interfaces:**
- Consumes: 已确认的经历、项目归属、量化事实与设计稿背景口径。
- Produces: 每个项目/专题可用的 `businessContext`、`painPoints`、`buildGoals`、`flow`、`engineeringBoundary` 字段。

- [ ] 先在 `resume-data.test.ts` 增加 Litree、WeLink、森格背景结构和禁止虚构指标的断言。
- [ ] 运行 `npm test -- --run src/data/resume-data.test.ts`，确认新增断言先失败。
- [ ] 补齐三类项目背景，Litree 六个专题共享项目背景并分别描述专题问题。
- [ ] 再次运行同一测试，确认事实层通过。

### Task 2: 重绘 10 页工程案例册

**Files:**
- Modify: `tools/generate_resume.py`
- Output: `付道品-高级Java开发工程师.pdf`
- Output: `付道品-高级Java开发工程师.docx`

**Interfaces:**
- Consumes: Task 1 的 JSON 事实源。
- Produces: 10 页 A4、文本可搜索、含章节轨道/交付链路/结果条/技术矩阵的 PDF，以及内容同步的 DOCX。

- [ ] 运行一次 PDF 编辑操作标记命令。
- [ ] 将封面改为石墨黑非对称工程构图，突出姓名、岗位和 `10w+` 水站。
- [ ] 将正文页改为白底工程案例布局，加入左侧章节轨道、三段背景、链路图、双栏实现/难点、深色结果条和技术矩阵。
- [ ] 生成 PDF/DOCX，并在生成器内检查项目页底部边界。
- [ ] 将 PDF 渲染为逐页 PNG，检查 10 页无截断、重叠和低对比文本。
- [ ] 提取 PDF 文本，确认姓名、岗位、立升、`10w+`、WeLink、森格、OA/HR、Agent 均可检索。

### Task 3: 升级工业数字孪生场景

**Files:**
- Modify: `web/src/scene/scene-layout.ts`
- Modify: `web/src/scene/MuseumScene.tsx`
- Modify: `web/src/scene/IntroSequence.tsx`
- Modify: `web/src/scene/ExhibitHotspots.tsx`
- Create: `web/src/scene/IndustrialAssets.tsx`
- Test: `web/src/scene/scene-layout.test.ts`

**Interfaces:**
- Consumes: 8 个展区数据和当前 `activeId`。
- Produces: 中央水务数据核心、设备/协议/GIS/OA/Agent/WeLink/森格专属程序化几何，以及可测试的展区聚焦配置。

- [ ] 先为展区坐标、主题类型和聚焦亮度增加失败测试。
- [ ] 运行场景配置测试并确认失败。
- [ ] 实现共享 PBR 材质、环形步道、管线数据脉冲和各展区专属工业构件。
- [ ] 将 `activeId` 映射为当前展区强化、非当前展区降亮，并保持热点可访问性。
- [ ] 调整入场镜头为入口、地下管网、中央核心、全馆的 6-8 秒序列；减少动态时直接落位。
- [ ] 运行场景配置测试并确认通过。

### Task 4: 升级 HUD 与项目面板

**Files:**
- Modify: `web/src/components/MuseumHud.tsx`
- Modify: `web/src/components/ExhibitPanel.tsx`
- Modify: `web/src/components/MobileResume.tsx`
- Modify: `web/src/styles.css`

**Interfaces:**
- Consumes: Task 1 的结构化背景和 Task 3 的 `activeId`。
- Produces: 轨道式展馆索引、渐进展开项目背景、业务链路/工程边界面板和完整移动端简历。

- [ ] 重构桌面 HUD 层级与轨道导航，控制按钮使用 Lucide 并保留工具提示/焦点态。
- [ ] 项目面板首屏突出角色与结果，背景按业务场景、现有痛点、建设目标渐进展开。
- [ ] 重做颜色、排版、玻璃/金属边界与响应式样式，不引入紫色渐变和装饰光球。
- [ ] 保持小于 768px 的提示、44px 触控目标、无横向滚动和 PDF 下载入口。

### Task 5: 聚焦验证与交付

**Files:**
- Output: `web/dist/**`
- Modify: `README.md`
- Modify: `task.md`

**Interfaces:**
- Consumes: Tasks 1-4 的最终产物。
- Produces: 可通过 Docker/Nginx 或静态服务器部署的交付包，以及完成归档的 Litree 任务。

- [ ] 运行核心 Vitest 与 `npm run build`，不扩展无关测试。
- [ ] 在桌面视口检查 canvas 非空、构图、热点聚焦和项目面板；在手机视口检查提示与完整纵向简历。
- [ ] 检查减少动态和 WebGL 降级路径仍可访问全部文本与 PDF。
- [ ] 将 PDF 放入 `web/public/resume` 后重新构建，并同步最终交付到 `D:\CV\付道品-高级Java开发工程师`。
- [ ] 确认 PDF 10 页、关键文本可检索、无禁止指标，且 `git diff --cached --name-only` 为空。
- [ ] 勾选 `task.md` 验收项并运行 `task.py archive docs-简历视觉升级`。
