# Engineering Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use test-driven-development while implementing each task. Do not commit or stage resume files.

**Goal:** Add an interactive, evidence-backed Java/AIoT/Agent terminal cluster to the existing resume museum without changing its factual resume content or mobile fallback behavior.

**Architecture:** Keep the Three.js scene unchanged. Store terminal content and reducer state in a typed data module, render it through one reusable React component, and mount that component as a desktop HUD overlay plus a compact mobile inline view.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, existing Lucide icons and CSS.

## Global Constraints

- Work only in `.ai/feature-简历工程终端` until archive.
- Do not edit `docs/` or `01-评审/`.
- Do not commit or stage resume-related files.
- Keep the confirmed wording `覆盖国内外 10w+ 水站`; it is project coverage, not a live metric.
- Do not invent device counts, concurrency, performance percentages, project value, team size or live service health.
- Preserve the desktop museum, mobile computer-experience notice, full vertical resume and reduced-motion behavior.
- Add no dependency and run only focused tests, type checking, production build and targeted visual checks.

---

### Task 1: Terminal Data Contract And State

**Files:**
- Create: `web/src/data/engineering-console.test.ts`
- Create: `web/src/data/engineering-console.ts`

**Interfaces:**
- Produces: `TerminalId`, `EngineeringCommand`, `EngineeringTerminal`, `EngineeringConsoleState`, `engineeringTerminals`, `initialEngineeringConsoleState`, `engineeringConsoleReducer`.
- Every command produces a target `exhibitId` that exists in `EXHIBITS`.

- [ ] **Step 1: Write the failing data and reducer test**

```ts
import { describe, expect, it } from 'vitest';
import { EXHIBITS } from '../scene/scene-layout';
import {
  engineeringConsoleReducer,
  engineeringTerminals,
  initialEngineeringConsoleState,
} from './engineering-console';

describe('engineering console', () => {
  it('exposes three evidence terminals with valid exhibit targets', () => {
    expect(engineeringTerminals.map((item) => item.id)).toEqual(['java', 'aiot', 'agent']);
    const exhibits = new Set(EXHIBITS.map((item) => item.id));
    const commands = engineeringTerminals.flatMap((item) => item.commands);
    expect(new Set(commands.map((item) => item.id)).size).toBe(commands.length);
    expect(commands.every((item) => exhibits.has(item.exhibitId))).toBe(true);
  });

  it('keeps confirmed facts and explicit ownership boundaries', () => {
    const text = JSON.stringify(engineeringTerminals);
    expect(text).toContain('10w+');
    expect(text).toContain('项目覆盖口径');
    expect(text).toContain('有人云');
    expect(text).toContain('团队');
    expect(text).toContain('AgentScope Java 2.0');
    expect(text).not.toMatch(/QPS|并发量|项目金额|团队人数|性能提升\\s*\\d+%|SYSTEM ONLINE/);
  });

  it('switches focus, command and inline expansion predictably', () => {
    const focused = engineeringConsoleReducer(initialEngineeringConsoleState, { type: 'focus', terminalId: 'agent' });
    expect(focused.focusedTerminal).toBe('agent');
    const command = engineeringConsoleReducer(focused, { type: 'run', terminalId: 'agent', commandId: 'agent-ai-coding' });
    expect(command.activeCommandByTerminal.agent).toBe('agent-ai-coding');
    const collapsed = engineeringConsoleReducer(command, { type: 'toggle-inline', terminalId: 'java' });
    expect(collapsed.inlineOpenTerminal).toBeNull();
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- --run src/data/engineering-console.test.ts`

Expected: fail because `./engineering-console` does not exist.

- [ ] **Step 3: Implement the typed data and reducer**

Use these exact reducer actions:

```ts
export type EngineeringConsoleAction =
  | { type: 'focus'; terminalId: TerminalId }
  | { type: 'run'; terminalId: TerminalId; commandId: string }
  | { type: 'toggle-inline'; terminalId: TerminalId };
```

Build command lines from the existing `resumeData` / `getTopic` facts. Java commands target `litree-overview`, `litree-oa`, and `welink-search`; AIoT commands target `litree-aiot`; Agent commands target `litree-agent`.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- --run src/data/engineering-console.test.ts`

Expected: 3 tests pass.

### Task 2: Reusable Terminal Component And Integration

**Files:**
- Create: `web/src/components/EngineeringConsole.tsx`
- Modify: `web/src/App.tsx`
- Modify: `web/src/components/MuseumHud.tsx`
- Modify: `web/src/components/MobileResume.tsx`

**Interfaces:**
- Consumes: all exports from `engineering-console.ts`.
- Produces: `EngineeringConsole({ variant, motionEnabled, onSelectExhibit })` where `variant` is `'overlay' | 'inline'` and `onSelectExhibit` is optional.

- [ ] **Step 1: Render semantic terminal windows from the tested contract**

Each terminal must include a focus button, `aria-pressed` command buttons, a keyed command line, an `aria-live="polite"` output region and an optional “查看对应展区” button. The component uses `useReducer(engineeringConsoleReducer, initialEngineeringConsoleState)` and sets `data-motion` from `motionEnabled`.

- [ ] **Step 2: Mount the overlay only in the valid museum state**

In `App.tsx`, pass `consoleVisible={!loading && !introActive && activeExhibit === null}` and `motionEnabled` to `MuseumHud`. In `MuseumHud.tsx`, render the overlay only when `consoleVisible` is true and forward `onSelectExhibit`.

- [ ] **Step 3: Mount the inline terminal in the mobile fallback**

Insert `<EngineeringConsole variant="inline" motionEnabled={false} />` after the mobile hero and before work experience. Do not change `MobileNotice` or remove any existing resume section.

- [ ] **Step 4: Run TypeScript verification**

Run: `npm run check`

Expected: exit code 0.

### Task 3: Industrial Layout And Motion

**Files:**
- Modify: `web/src/styles.css`
- Modify: `web/README.md`

- [ ] **Step 1: Add desktop overlay layout**

Use the existing museum color variables. Place the overlay below the identity/metric area and above the project index. Render a three-window deck with Java, AIoT and Agent offsets; focused window moves to the front while the separate mode rail remains clickable.

- [ ] **Step 2: Add compact and mobile layouts**

At desktop widths below `1180px`, reduce terminal width and output density without covering the bottom index. Below `768px`, the inline component shows one terminal at a time in normal document flow with 44px minimum controls and wrapping command text.

- [ ] **Step 3: Add bounded animation and reduced-motion overrides**

Use 150-300ms focus/entry transitions, short staggered output-line reveals and a finite caret blink. Disable all three both under `[data-motion='reduced']` and `@media (prefers-reduced-motion: reduce)`.

- [ ] **Step 4: Document the new terminal behavior**

Update the README to state that the console is a static career-evidence browser and that it never represents live production telemetry.

### Task 4: Focused Verification And Delivery

**Files:**
- Modify: `task.md`
- Create during archive: `DONE.md`

- [ ] **Step 1: Run focused automated verification**

Run: `npm test -- --run`, then `npm run check`, then `npm run build`.

Expected: all existing and new tests pass, type checking succeeds, and Vite creates `dist`.

- [ ] **Step 2: Run targeted browser verification**

Inspect 1440px and 1024px museum layouts, 390px fallback, plus one reduced-motion desktop capture. Confirm readable output, working command/focus buttons, no overlap with identity, project index or exhibit panel, and no browser console errors.

- [ ] **Step 3: Synchronize the delivery directory**

Copy the completed task payload to `D:\CV\付道品-高级Java开发工程师` after approval for that external write. Preserve the existing PDF and DOCX files.

- [ ] **Step 4: Complete task metadata and archive**

Check every acceptance item in `task.md`, record verification evidence in `DONE.md` through `litree-task archive`, and do not stage or commit any resume file.

