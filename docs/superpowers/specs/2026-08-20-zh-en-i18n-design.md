# 中英双语国际化设计

## 背景与目标

数字孪生简历展馆目前只有中文：HUD、展项面板、手机降级页、加载屏、3D 全息/看板文案，以及 `resume-data.json` 驱动的 PDF/Word，全部写死中文。海外投递和英文招聘方无法阅读完整履历。

目标是提供中英两套完整体验：界面、履历正文、3D 标签与投递文档一起切换。中文保持现有表述与视觉；英文是完整专业翻译，不是按钮级对照。

## 已确认决策

| 项 | 选择 |
|---|---|
| 覆盖范围 | 整站：UI + 履历正文 + 3D 标签/看板 |
| 投递文档 | 英文模式下下载英文 PDF/Word |
| 切换方式 | HUD `中 \| EN` 开关；`?lang=` 优先，其次 localStorage，默认中文 |
| 英文名 | Daopin Fu |
| 英文职位 | Senior Java Engineer |
| 运行时 | `i18next` + `react-i18next` |
| 履历数据 | 平行文件 `resume-data.zh.json` / `resume-data.en.json`，结构与现网 JSON 相同 |
| 不采用 | 浏览器语言自动跳转、`/en` 路径、同一 JSON 内 `{zh,en}` 字段、运行时机器翻译 |

## 架构

```text
web/src/i18n/
  index.ts                 # i18next 初始化、locale 解析、URL/document 同步
  locale.ts                # Locale 类型、normalizeLocale、resolveLocale、syncUrl
  LanguageSwitcher.tsx     # 中 | EN 分段按钮
  locales/zh/ui.json       # 中文界面与 3D 提示
  locales/en/ui.json       # 英文界面与 3D 提示

web/src/data/
  resume-data.zh.json      # 现网 resume-data.json 改名
  resume-data.en.json      # 英文履历，id/结构与中文对齐
  resume-data.ts           # 类型 + getResumeData(locale)
  model-representations.ts # 按 locale 导出模型说明
  engineering-console.ts   # 按 locale 导出终端文案

tools/generate_resume.py   # --lang zh|en|all，中英 chrome 字典
```

职责边界：

- **i18next** 只管理扁平/嵌套的界面文案（按钮、标题、提示、加载日志、全息提示、无障碍、document title）。
- **履历 JSON** 继续作为网页、DOCX、PDF 的结构化事实源，不拆成 i18n key。
- **scene-layout.ts** 只保留几何与语言无关字段（`id`、`position`、`shortLabel`、`accent`、`zone`）。展位显示名从 `ui.json` 的 `exhibits.<id>` 读取。
- **3D 纹理工厂** 继续接收字符串参数绘图，不直接依赖 i18next。由 React 层在 locale 变化时传入新文案并重绘。
- **App** 继续拥有体验模式、加载、入场、展项选择；语言由 i18next 单例持有，不另造一份 locale Context。

`main.tsx` 在 `createRoot` 之前初始化 i18n。Canvas 外的组件通过 `useTranslation()` 取 UI 文案，通过 `getResumeData(i18n.resolvedLanguage)` 取履历。R3F 子树禁止使用 `useTranslation()`；`App` 把 `locale` 作为 prop 传入 `MuseumScene`。场景内用 `locale` 调用 `getResumeData`、`getExhibitLabel` 或 `i18n.getFixedT(locale)` 取文案。纹理工厂本身只接收字符串，不 import i18next。

## 语言解析

合法 locale 仅为 `zh` 与 `en`。

规范化：

- `zh`、`zh-CN`、`zh-Hans` → `zh`
- `en`、`en-US`、`en-GB` → `en`
- 其他值视为无效，忽略

解析顺序（只执行一次启动，之后以用户点击为准）：

1. URL 查询参数 `lang`
2. `localStorage` 键 `i18nextLng`（i18next 默认缓存键）
3. 默认 `zh`

不读取 `navigator.language`。不安装 `i18next-browser-languagedetector`。

切换语言时：

1. 调用 `i18n.changeLanguage(next)`
2. i18next 写入 `i18nextLng`
3. 用 `history.replaceState` 更新 URL：切到 `en` 时设置 `lang=en`；切到 `zh` 时删除 `lang`。必须保留其余查询参数（如 `mode=fallback`）
4. 设置 `document.documentElement.lang` 为 `zh-CN` 或 `en`
5. 用 `ui.json` 的 `meta.title` / `meta.description` 更新 `<title>` 和 description

`index.html` 增加一段不依赖 React 的内联脚本：按同样顺序读取 URL `lang` 与 `i18nextLng`，若为英文则在首屏把 title、description、初始加载文案换成英文，减少中文闪一下。

## 界面与开关

`LanguageSwitcher` 是唯一切换入口，用于：

- 桌面 `MuseumHud` 命令区，放在「核心履历」和 PDF 之间
- 手机 `MobileResume` Hero 操作区，与下载 PDF 并列

外观：两个相邻按钮 `中` / `EN`，当前语言使用现有 `text-command--cyan` 高亮。`aria-pressed` 标记当前项；英文态 `aria-label` 为 “Switch to Chinese”，中文态为 “切换到英文”。

加载屏、手机提示、展项面板、总览弹窗、工程终端、3D 标牌不放置第二套开关，全部跟随当前 locale。

下载链接：

| locale | href |
|---|---|
| zh | `/resume/付道品-高级Java开发工程师.pdf` |
| en | `/resume/Daopin-Fu-Senior-Java-Engineer.pdf` |

该路径放在 `ui.json` 的 `resume.pdfHref`，避免组件硬编码文件名。

## 履历与场景数据

`resume-data.zh.json` 是现网文件的改名，内容不改事实。`resume-data.en.json` 字段、数组长度、`projects[].id`、`topics[].id`、`pageSpan` 必须与中文一致，只替换可翻译文本。电话、邮箱、网站、技术栈专有名词保持原样。

英文固定译名：

| 中文 | 英文 |
|---|---|
| 付道品 | Daopin Fu |
| 高级 Java 开发工程师 | Senior Java Engineer |
| 立升净水科技 | Litree Water Purification Technology |
| 立升智慧水务云平台 | Litree Smart Water Cloud |
| 立升 OA / HR 业务系统 | Litree OA / HR System |
| 外企德科 | Adecco |
| 森格自动化科技 | Senge Automation Technology |
| 森格智慧水务平台 | Senge Smart Water Platform |
| 华为 WeLink | Huawei WeLink |

技术专有名词（Spring Cloud、PostGIS、AgentScope、NL2SQL、Modbus、OPC 等）不翻译。英文正文按海外简历习惯用动词开头、可核验的事实句，并压缩到现有 7 页 PDF 槽位能装下，不为此次改 PDF 版式或页数。

`getResumeData(locale)` 只在 `zh`/`en` 间选择；测试和生成脚本不得再 import 已删除的 `resume-data.json`。

模型说明与工程终端：在现有模块内按 locale 分支导出，`id`、`order`、`shortLabel`、`accentColor`、`exhibitId`、命令 `command` 字符串保持语言无关。中文测试继续断言中文事实句；英文另测姓名、公司译名和专有名词仍在。

展位显示名（现 `EXHIBITS[].label`）迁入 `ui.json`：

| id | zh | en |
|---|---|---|
| litree-overview | 微服务与数据底座 | Microservices & Data Foundation |
| litree-aiot | AIoT 与空间拓扑 | AIoT & Spatial Topology |
| litree-agent | 水务智能体 | Water Data Agent |
| oa-hr | 立升 OA / HR | Litree OA / HR |
| welink-search | WeLink 统一搜索 | WeLink Unified Search |
| welink-data | WeLink 双路数据湖 | WeLink Dual-Path Data Lake |
| senge-gateway | 森格实时通信网关 | Senge Realtime Gateway |
| senge-platform | 森格 0-1 平台架构 | Senge 0-to-1 Platform |

`shortLabel`（ARCH / AIoT / AGENT 等）中英共用。

## 3D 纹理

不卸载 `Canvas`，不递增 `sceneKey`（`sceneKey` 仍只用于「返回中央馆」）。

locale 变化时：

1. React 用新字符串调用 `createBillboardTexture`、`createProfileHologramTexture`、全息标牌工厂
2. `useMemo` 依赖 locale 与文案；返回新 `THREE.CanvasTexture` 前对旧纹理调用 `dispose()`
3. 标牌缓存 key 带 locale，例如 `en:litree-overview`，禁止中英共用同一张 Canvas

需要随语言重绘的文案包括：墙面看板副标题、主全息屏姓名/职位/指标说明、未选中/选中全息标牌的状态句与点击提示。几何、颜色、动画参数不变。

## PDF / Word

`generate_resume.py` 增加 `--lang`，缺省为 `all`：

- `zh`：读 `resume-data.zh.json`，写出 `付道品-高级Java开发工程师.pdf/.docx`，并复制到 `web/public/resume/`
- `en`：读 `resume-data.en.json`，写出 `Daopin-Fu-Senior-Java-Engineer.pdf/.docx`，同样复制到 `web/public/resume/`
- `all`（默认）：先后生成两套，一次命令更新四份投递文件

脚本内的中文章节标题、页眉页脚、封面词条抽成 `CHROME[lang]` 字典（如「核心能力矩阵」→ `Core Competency Matrix`，「工作经历」→ `Work Experience`，「本人角色」→ `Role`）。不改 7 页结构、配色和自适应字号算法。中英都继续用 Microsoft YaHei，避免版心度量漂移。

README 的数据路径和生成命令同步修改；README 正文不翻译成英文。

## 测试

1. `locale.ts`：URL > localStorage > `zh`；`zh-CN`/`en-US` 规范化；非法值忽略；切语言时保留 `mode` 等其他 query。
2. 中英 JSON：`projects[].id`、`topics[].id`、`pageSpan`、数组长度一致；中文保留现有公司/规模/禁词断言；英文断言 `profile.name === 'Daopin Fu'`、三家雇主译名、以及 `AgentScope Java 2.0` / `10w+` / `NL2SQL` 仍在。
3. `ui.json`：中英 key 集合相等，叶子值为非空字符串。
4. 工程终端：中文事实断言不变；`getEngineeringTerminals('en')` 的 command `exhibitId` 仍全部落在 `EXHIBITS`。
5. 生成脚本：`--lang en` 读取英文 JSON 且输出路径含 `Daopin-Fu-Senior-Java-Engineer`。可用轻量单测或脚本内断言函数，不强制渲染比对 PDF 像素。

## 明确不做

- 第三种语言
- 按浏览器语言自动进入英文
- `/en` 路径或独立英文站点
- 翻译 README、代码注释、设计文档全文
- 改展馆视觉、相机、模型几何、入场镜头
- 为英文重排 PDF 页数或版式
- 运行时机器翻译

## 成功标准

- 桌面 HUD 与手机 Hero 都能立刻切中/英，不刷新页面、不重载 WebGL
- `/?lang=en` 直接进入英文；刷新后语言保持；`/?mode=fallback&lang=en` 降级页也是英文
- 英文态姓名为 Daopin Fu，下载英文 PDF；中文态仍为付道品和现有中文 PDF
- 展位名、面板、加载日志、全息标牌、墙面看板、工程终端一起切换
- 两份履历 JSON 结构对齐，事实与现网中文稿一致
