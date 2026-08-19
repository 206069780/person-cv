# Scene Component Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the oversized 3D scene and stylesheet modules into focused, typed components without changing visible behavior or interaction.

**Architecture:** Keep `App` as the state owner and reduce the two scene entry files to composition. Move camera and environment systems into dedicated modules, move each exhibit visual and its private resources into its own module, retain only truly shared Three.js resources in `exhibits/shared`, and keep CSS order through a single import manifest.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Vitest 4, Three.js 0.181, React Three Fiber 9, GSAP 3.

## Global Constraints

- Preserve the current desktop and mobile appearance.
- Preserve camera behavior, intro timing, exhibit selection, panel behavior, motion reduction, WebGL fallback, and all displayed copy.
- Preserve every Three.js geometry argument, material property, color, light, texture, and animation parameter unless a task explicitly adds resource cleanup.
- Do not add Context, a state library, a runtime plugin system, or a new production dependency.
- Keep `App` as the owner of experience mode, loading, intro, exhibit selection, and panel state.
- Keep CSS selectors, declarations, keyframes, media-query conditions, and cascade order unchanged.
- Keep shared geometries and materials at module scope so renders do not allocate replacements.
- Use `apply_patch` for manual source edits.

---

## File Map

Files created by this plan:

```text
web/src/scene/scene-types.ts
web/src/scene/camera/IntegratedCameraController.tsx
web/src/scene/environment/FloorSystem.tsx
web/src/scene/environment/StructuralFrames.tsx
web/src/scene/environment/DataStreams.tsx
web/src/scene/environment/NeonWalls.tsx
web/src/scene/textures/profile-hologram-texture.ts
web/src/scene/textures/billboard-texture.ts
web/src/scene/exhibits/IndustrialAssets.tsx
web/src/scene/exhibits/exhibit-types.ts
web/src/scene/exhibits/zone-registry.ts
web/src/scene/exhibits/zone-registry.test.ts
web/src/scene/exhibits/shared/resources.ts
web/src/scene/exhibits/shared/FlowPulses.tsx
web/src/scene/exhibits/shared/ZoneBase.tsx
web/src/scene/exhibits/shared/ZoneAtmosphericMotes.tsx
web/src/scene/exhibits/shared/CyberIndustrialPillar.tsx
web/src/scene/exhibits/zones/LitreeOverviewZone.tsx
web/src/scene/exhibits/zones/LitreeAiotZone.tsx
web/src/scene/exhibits/zones/LitreeAgentZone.tsx
web/src/scene/exhibits/zones/LitreeOaZone.tsx
web/src/scene/exhibits/zones/WelinkSearchZone.tsx
web/src/scene/exhibits/zones/WelinkDataLakeZone.tsx
web/src/scene/exhibits/zones/SengeGatewayZone.tsx
web/src/scene/exhibits/zones/SengePlatformZone.tsx
web/src/styles/base.css
web/src/styles/museum.css
web/src/styles/panels.css
web/src/styles/loading.css
web/src/styles/mobile-resume.css
web/src/styles/resume-modal.css
web/src/styles/responsive.css
```

Files modified by this plan:

```text
web/src/scene/scene-layout.ts
web/src/scene/scene-layout.test.ts
web/src/scene/MuseumScene.tsx
web/src/styles.css
```

Files removed after their exports have replacement paths:

```text
web/src/scene/IndustrialAssets.tsx
web/src/scene/NeonWalls.tsx
```

No `index.ts` barrels are added. Every consumer imports the owning module directly, which keeps dependencies visible and prevents cycles between `zones` and `shared`.

---

### Task 1: Establish Baseline And Typed Scene Contracts

**Files:**
- Modify: `web/src/scene/scene-layout.test.ts`
- Modify: `web/src/scene/scene-layout.ts`
- Create: `web/src/scene/scene-types.ts`
- Modify: `web/src/scene/MuseumScene.tsx`

**Interfaces:**
- Produces: `ExhibitId`, `MotionProps`, `ExhibitSelectionProps`, `MuseumSceneProps`, and `ExhibitVisualProps`.
- Preserves: `EXHIBITS`, `getZoneFocus()`, `SCENE_BOUNDS`, and the existing `MuseumScene` call signature.

- [ ] **Step 1: Record the automated baseline**

Run from `web/`:

```powershell
npm test -- --run
npm run check
npm run build
```

Expected: 5 test files and 23 tests pass; TypeScript exits `0`; Vite produces `dist/` and exits `0`.

- [ ] **Step 2: Write the failing exhibit-ID characterization test**

Add this test to `web/src/scene/scene-layout.test.ts` and import `EXHIBIT_IDS`:

```ts
it('keeps the public exhibit identifiers stable and unique', () => {
  expect(EXHIBIT_IDS).toEqual([
    'litree-overview',
    'litree-aiot',
    'litree-agent',
    'oa-hr',
    'welink-search',
    'welink-data',
    'senge-gateway',
    'senge-platform',
  ]);
  expect(new Set(EXHIBIT_IDS).size).toBe(EXHIBIT_IDS.length);
  expect(EXHIBITS.map(({ id }) => id)).toEqual(EXHIBIT_IDS);
});
```

- [ ] **Step 3: Run the focused test and verify the red state**

Run:

```powershell
npm test -- --run src/scene/scene-layout.test.ts
```

Expected: FAIL because `EXHIBIT_IDS` is not exported.

- [ ] **Step 4: Add the stable ID union without changing layout data**

At the top of `web/src/scene/scene-layout.ts`, define the IDs and use `ExhibitId` for `ExhibitLayout.id`:

```ts
export const EXHIBIT_IDS = [
  'litree-overview',
  'litree-aiot',
  'litree-agent',
  'oa-hr',
  'welink-search',
  'welink-data',
  'senge-gateway',
  'senge-platform',
] as const;

export type ExhibitId = (typeof EXHIBIT_IDS)[number];

export interface ExhibitLayout {
  id: ExhibitId;
  projectId: 'litree' | 'oa' | 'welink' | 'senge';
  label: string;
  shortLabel: string;
  position: readonly [number, number, number];
  accent: 'signal' | 'safety' | 'cyber';
  zone: 'core' | 'device' | 'protocol' | 'gis' | 'oa' | 'agent' | 'search' | 'plant';
}
```

Keep the eight `EXHIBITS` objects byte-for-byte equivalent and change only the declaration to:

```ts
export const EXHIBITS = [
  { id: 'litree-overview', projectId: 'litree', label: '微服务与数据底座', shortLabel: 'ARCH', position: [0, 0, -10.5], accent: 'signal', zone: 'core' },
  { id: 'litree-aiot', projectId: 'litree', label: 'AIoT 与空间拓扑', shortLabel: 'AIoT', position: [-8.8, 0, -3.8], accent: 'signal', zone: 'protocol' },
  { id: 'litree-agent', projectId: 'litree', label: '水务智能体', shortLabel: 'AGENT', position: [8.8, 0, -3.8], accent: 'cyber', zone: 'agent' },
  { id: 'oa-hr', projectId: 'oa', label: '立升 OA / HR', shortLabel: 'OA', position: [9.6, 0, 3.6], accent: 'signal', zone: 'oa' },
  { id: 'welink-search', projectId: 'welink', label: 'WeLink 统一搜索', shortLabel: 'SEARCH', position: [-9.6, 0, 3.6], accent: 'safety', zone: 'search' },
  { id: 'welink-data', projectId: 'welink', label: 'WeLink 双路数据湖', shortLabel: 'LAKE', position: [-5.4, 0, 11.8], accent: 'safety', zone: 'search' },
  { id: 'senge-gateway', projectId: 'senge', label: '森格实时通信网关', shortLabel: 'GATEWAY', position: [4.0, 0, 12.0], accent: 'safety', zone: 'plant' },
  { id: 'senge-platform', projectId: 'senge', label: '森格 0-1 平台架构', shortLabel: 'SENGE', position: [9.8, 0, 11.2], accent: 'safety', zone: 'plant' },
] as const satisfies readonly ExhibitLayout[];
```

- [ ] **Step 5: Create the shared scene contracts**

Create `web/src/scene/scene-types.ts`:

```ts
export interface MotionProps {
  motionEnabled: boolean;
}

export interface ExhibitSelectionProps {
  activeExhibit: string | null;
  onSelectExhibit: (id: string | null) => void;
}

export interface MuseumSceneProps extends MotionProps, ExhibitSelectionProps {
  panelOpen?: boolean;
  introActive: boolean;
  onIntroComplete: () => void;
  onReady: () => void;
  onFallback: () => void;
}

export interface ExhibitVisualProps extends MotionProps {
  intensity: number;
}
```

Exporting `MuseumSceneProps` makes the scene boundary explicit while retaining `string | null` at the application boundary. `ExhibitId` is reserved for the exhaustive internal zone registry so unrelated resume-data interfaces do not gain a scene dependency.

- [ ] **Step 6: Consume the contract in `MuseumScene.tsx`**

Remove the local `MuseumSceneProps` interface and add:

```ts
import type { MuseumSceneProps } from './scene-types';
```

Do not change any prop reads, defaults, or callback calls.

- [ ] **Step 7: Verify and commit the contract task**

Run:

```powershell
npm test -- --run src/scene/scene-layout.test.ts
npm run check
```

Expected: the focused tests pass and TypeScript exits `0`.

Commit:

```powershell
git add web/src/scene/scene-layout.ts web/src/scene/scene-layout.test.ts web/src/scene/scene-types.ts web/src/scene/MuseumScene.tsx
git commit -m "refactor: define typed scene contracts"
```

---

### Task 2: Extract Shared Exhibit Effects And Resources

**Files:**
- Create: `web/src/scene/exhibits/exhibit-types.ts`
- Create: `web/src/scene/exhibits/shared/resources.ts`
- Create: `web/src/scene/exhibits/shared/FlowPulses.tsx`
- Create: `web/src/scene/exhibits/shared/ZoneBase.tsx`
- Create: `web/src/scene/exhibits/shared/ZoneAtmosphericMotes.tsx`
- Create: `web/src/scene/exhibits/shared/CyberIndustrialPillar.tsx`
- Modify: `web/src/scene/IndustrialAssets.tsx`

**Interfaces:**
- Consumes: `ExhibitVisualProps` from `scene-types.ts`.
- Produces: `IndustrialAssetsProps`, palette/resource exports, `FlowPulses`, `ZoneBase`, `ZoneAtmosphericMotes`, and `CyberIndustrialPillar`.
- Dependency rule: files in `shared/` never import from `zones/`.

- [ ] **Step 1: Add explicit exhibit component interfaces**

Create `web/src/scene/exhibits/exhibit-types.ts`:

```ts
import type { ExhibitVisualProps, MotionProps } from '../scene-types';

export type { ExhibitVisualProps };

export interface IndustrialAssetsProps extends MotionProps {
  activeExhibit: string | null;
  onSelectExhibit?: (id: string) => void;
}

export interface FlowPulsesProps extends MotionProps {
  start: readonly [number, number, number];
  end: readonly [number, number, number];
  color: string;
  intensity: number;
  count?: number;
}

export interface ZoneBaseProps extends Partial<MotionProps> {
  intensity: number;
  accent?: string;
}

export interface ZoneAtmosphericMotesProps extends MotionProps {
  accent: string;
  intensity: number;
  count?: number;
}

export interface CyberIndustrialPillarProps extends Partial<MotionProps> {
  position: [number, number, number];
  accent?: string;
  secondaryAccent?: string;
  intensity: number;
  height?: number;
  withBeam?: boolean;
}
```

- [ ] **Step 2: Move only genuinely shared resources**

Create `web/src/scene/exhibits/shared/resources.ts`. Export the current values without changing constructor arguments:

```ts
import * as THREE from 'three';

export const SIGNAL = '#00a89d';
export const CYAN = '#28d7e5';
export const SAFETY = '#ff6b3d';
export const PURPLE = '#c084fc';
export const GOLD = '#f5a623';
export const EMERALD = '#34d399';

export const COLOR_STEEL_DARK = '#0e1b22';
export const COLOR_STEEL_MID = '#162832';
export const COLOR_STEEL_LIGHT = '#2b4452';
export const COLOR_STEEL_CHROME = '#7e9cb0';
export const COLOR_GOLD_ALLOY = '#d4941e';
```

Move the existing module-scope resources used by `FlowPulses`, `ZoneBase`, `ZoneAtmosphericMotes`, and `CyberIndustrialPillar` into this file and export them. The exact shared set is:

```ts
baseOctagonGeo
baseTopPlateGeo
baseRingInnerGeo
baseRingOuterGeo
baseGearTorusGeo
baseAuraHaloGeo
baseCornerBlockGeo
baseCornerBoltGeo
baseVentGeo
pulseSphereGeo
baseUplightConeGeo
baseUndercarriageRingGeo
ambientMoteGeo
pillarScanRingGeo
pillarApexFlareGeo
pillarApexBeamGeo
energyWellSocketGeo
energySocketInnerDiscGeo
corePillarMainGeo
corePillarFinGeo
corePillarSpireGeo
corePillarSideNeonGeo
corePillarFinSlotNeonGeo
matTitaniumDark
matSteelMid
matSteelLight
matChromeBright
matGoldAlloy
matAcrylicCyan
matAcrylicOrange
matAcrylicPurple
```

Resources used by one zone only remain in that zone during Task 3.

- [ ] **Step 3: Extract each shared effect with its current body**

Move the complete implementations from `IndustrialAssets.tsx` and expose the signatures below. The declarations use TypeScript declaration notation to specify the final API. Keep every `useFrame`, `useMemo`, mesh, geometry, material, opacity, scale, and timing expression unchanged.

```ts
export function FlowPulses(props: FlowPulsesProps): React.JSX.Element;
export function ZoneBase(props: ZoneBaseProps): React.JSX.Element;
export function ZoneAtmosphericMotes(props: ZoneAtmosphericMotesProps): React.JSX.Element;
export function CyberIndustrialPillar(props: CyberIndustrialPillarProps): React.JSX.Element;
```

Default values remain `count = 3` for `FlowPulses`, `accent = SIGNAL` and `motionEnabled = true` for `ZoneBase`, `count = 12` for `ZoneAtmosphericMotes`, and the current accent, height, beam, and motion defaults for `CyberIndustrialPillar`.

- [ ] **Step 4: Rewire the current monolith to the extracted exports**

Delete the moved declarations from `IndustrialAssets.tsx`, remove now-unused React/Three imports, and import the new modules directly:

```ts
import { CyberIndustrialPillar } from './exhibits/shared/CyberIndustrialPillar';
import { FlowPulses } from './exhibits/shared/FlowPulses';
import {
  CYAN,
  EMERALD,
  GOLD,
  PURPLE,
  SAFETY,
  SIGNAL,
} from './exhibits/shared/resources';
import { ZoneAtmosphericMotes } from './exhibits/shared/ZoneAtmosphericMotes';
import { ZoneBase } from './exhibits/shared/ZoneBase';
import type { ExhibitVisualProps } from './scene-types';

type ZoneProps = ExhibitVisualProps & { exhibit: ExhibitLayout };
```

This temporary `ZoneProps` keeps Task 2 compiling. Task 3 removes `exhibit` from visual components.

- [ ] **Step 5: Verify and commit shared extraction**

Run:

```powershell
npm test -- --run
npm run check
npm run build
```

Expected: all existing tests pass, TypeScript exits `0`, and Vite builds successfully.

Commit:

```powershell
git add web/src/scene/IndustrialAssets.tsx web/src/scene/exhibits web/src/scene/scene-types.ts
git commit -m "refactor: extract shared exhibit effects"
```

---

### Task 3: Split Eight Exhibit Visuals And Add An Exhaustive Registry

**Files:**
- Create: `web/src/scene/exhibits/zones/LitreeOverviewZone.tsx`
- Create: `web/src/scene/exhibits/zones/LitreeAiotZone.tsx`
- Create: `web/src/scene/exhibits/zones/LitreeAgentZone.tsx`
- Create: `web/src/scene/exhibits/zones/LitreeOaZone.tsx`
- Create: `web/src/scene/exhibits/zones/WelinkSearchZone.tsx`
- Create: `web/src/scene/exhibits/zones/WelinkDataLakeZone.tsx`
- Create: `web/src/scene/exhibits/zones/SengeGatewayZone.tsx`
- Create: `web/src/scene/exhibits/zones/SengePlatformZone.tsx`
- Create: `web/src/scene/exhibits/zone-registry.ts`
- Create: `web/src/scene/exhibits/zone-registry.test.ts`
- Create: `web/src/scene/exhibits/IndustrialAssets.tsx`
- Modify: `web/src/scene/MuseumScene.tsx`
- Remove: `web/src/scene/IndustrialAssets.tsx`

**Interfaces:**
- Consumes: `ExhibitId`, `EXHIBITS`, `getZoneFocus`, `ExhibitVisualProps`, `IndustrialAssetsProps`, and shared exhibit effects.
- Produces: `EXHIBIT_VISUALS`, `getExhibitVisual(id: ExhibitId)`, and the replacement `IndustrialAssets` export.
- Every zone component has the exact signature `(props: ExhibitVisualProps) => JSX.Element`.

- [ ] **Step 1: Write the failing exhaustive-registry test**

Create `web/src/scene/exhibits/zone-registry.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { EXHIBIT_IDS } from '../scene-layout';
import { EXHIBIT_VISUALS } from './zone-registry';

describe('exhibit visual registry', () => {
  it('maps every exhibit ID exactly once', () => {
    expect(Object.keys(EXHIBIT_VISUALS)).toEqual(EXHIBIT_IDS);
    expect(new Set(Object.values(EXHIBIT_VISUALS)).size).toBe(EXHIBIT_IDS.length);
  });
});
```

- [ ] **Step 2: Run the registry test and verify the red state**

Run:

```powershell
npm test -- --run src/scene/exhibits/zone-registry.test.ts
```

Expected: FAIL because `zone-registry.ts` does not exist.

- [ ] **Step 3: Move each zone and its private resources**

Mechanically move the current component body and the resource declarations named by its section comment. Rename only the exported function as shown:

```ts
export function LitreeOverviewZone(props: ExhibitVisualProps): React.JSX.Element;
export function LitreeAiotZone(props: ExhibitVisualProps): React.JSX.Element;
export function LitreeAgentZone(props: ExhibitVisualProps): React.JSX.Element;
export function LitreeOaZone(props: ExhibitVisualProps): React.JSX.Element;
export function WelinkSearchZone(props: ExhibitVisualProps): React.JSX.Element;
export function WelinkDataLakeZone(props: ExhibitVisualProps): React.JSX.Element;
export function SengeGatewayZone(props: ExhibitVisualProps): React.JSX.Element;
export function SengePlatformZone(props: ExhibitVisualProps): React.JSX.Element;
```

Use these source sections from the pre-task `IndustrialAssets.tsx`:

```text
Litree overview: resource comment "01" and LitreeOverviewCoreZone
Litree AIoT: resource comment "02" and LitreeAiotZone
Litree Agent: resource comment "03" and LitreeAgentZone
Litree OA: resource comment "04" and LitreeOaZone
WeLink Search: resource comment "05" and WelinkSearchZone
WeLink Data Lake: resource comment "06" and WelinkDataLakeZone
Senge Gateway: resource comment "07" and SengeGatewayZone
Senge Platform: resource comment "08" and SengePlatformZone
```

Remove `exhibit` from every zone signature because none of the eight bodies reads it. Preserve all JSX keys, transforms, animation formulas, and shared-effect props.

- [ ] **Step 4: Implement the exhaustive registry**

Create `web/src/scene/exhibits/zone-registry.ts`:

```ts
import type { ComponentType } from 'react';

import type { ExhibitId } from '../scene-layout';
import type { ExhibitVisualProps } from './exhibit-types';
import { LitreeAgentZone } from './zones/LitreeAgentZone';
import { LitreeAiotZone } from './zones/LitreeAiotZone';
import { LitreeOaZone } from './zones/LitreeOaZone';
import { LitreeOverviewZone } from './zones/LitreeOverviewZone';
import { SengeGatewayZone } from './zones/SengeGatewayZone';
import { SengePlatformZone } from './zones/SengePlatformZone';
import { WelinkDataLakeZone } from './zones/WelinkDataLakeZone';
import { WelinkSearchZone } from './zones/WelinkSearchZone';

export const EXHIBIT_VISUALS = {
  'litree-overview': LitreeOverviewZone,
  'litree-aiot': LitreeAiotZone,
  'litree-agent': LitreeAgentZone,
  'oa-hr': LitreeOaZone,
  'welink-search': WelinkSearchZone,
  'welink-data': WelinkDataLakeZone,
  'senge-gateway': SengeGatewayZone,
  'senge-platform': SengePlatformZone,
} satisfies Record<ExhibitId, ComponentType<ExhibitVisualProps>>;

export function getExhibitVisual(id: ExhibitId) {
  return EXHIBIT_VISUALS[id];
}
```

- [ ] **Step 5: Replace the switch with the thin orchestrator**

Create `web/src/scene/exhibits/IndustrialAssets.tsx` with the current group events and transforms. Replace `IndustrialZone` with registry lookup:

```tsx
import { EXHIBITS, getZoneFocus } from '../scene-layout';
import type { IndustrialAssetsProps } from './exhibit-types';
import { getExhibitVisual } from './zone-registry';

export function IndustrialAssets({
  activeExhibit,
  motionEnabled,
  onSelectExhibit,
}: IndustrialAssetsProps) {
  return (
    <>
      {EXHIBITS.map((exhibit) => {
        const focus = getZoneFocus(activeExhibit, exhibit.id);
        const isActive = activeExhibit === exhibit.id;
        const ExhibitVisual = getExhibitVisual(exhibit.id);

        return (
          <group
            key={exhibit.id}
            position={exhibit.position}
            scale={isActive ? 1.06 : focus.intensity < 0.5 ? 0.94 : 1}
            onClick={(event) => {
              event.stopPropagation();
              onSelectExhibit?.(exhibit.id);
            }}
            onPointerOver={() => {
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = '';
            }}
          >
            <ExhibitVisual intensity={focus.intensity} motionEnabled={motionEnabled} />
          </group>
        );
      })}
    </>
  );
}
```

Update `MuseumScene.tsx`:

```ts
import { IndustrialAssets } from './exhibits/IndustrialAssets';
```

Delete the old `web/src/scene/IndustrialAssets.tsx` only after the replacement import compiles.

- [ ] **Step 6: Verify registry, line ownership, and build**

Run:

```powershell
npm test -- --run src/scene/exhibits/zone-registry.test.ts
npm test -- --run
npm run check
npm run build
(Get-Content src/scene/exhibits/IndustrialAssets.tsx).Count
```

Expected: registry test passes, full suite passes, TypeScript/build exit `0`, and the orchestrator is fewer than 100 physical lines.

Commit:

```powershell
git add web/src/scene/exhibits web/src/scene/MuseumScene.tsx web/src/scene/IndustrialAssets.tsx
git commit -m "refactor: split industrial exhibit visuals"
```

---

### Task 4: Extract Camera And Environment Systems

**Files:**
- Create: `web/src/scene/camera/IntegratedCameraController.tsx`
- Create: `web/src/scene/environment/FloorSystem.tsx`
- Create: `web/src/scene/environment/StructuralFrames.tsx`
- Create: `web/src/scene/environment/DataStreams.tsx`
- Modify: `web/src/scene/MuseumScene.tsx`

**Interfaces:**
- Consumes: `EXHIBITS`, `SCENE_BOUNDS`, `MotionProps`, `MuseumSceneProps`.
- Produces: `IntegratedCameraController`, `FloorSystem`, `StructuralFrames`, and `DataStreams`.
- Keeps `SceneBoundary` and `SceneContent` in `MuseumScene.tsx` because they define scene composition and fallback ownership.

- [ ] **Step 1: Extract the camera controller unchanged**

Move the four reusable camera vectors and the complete current `IntegratedCameraController` body to `camera/IntegratedCameraController.tsx`. Its final exported signature is:

```ts
interface IntegratedCameraControllerProps {
  activeExhibit: string | null;
  panelOpen?: boolean;
  introActive: boolean;
  motionEnabled: boolean;
  onDeselect: () => void;
}

export function IntegratedCameraController(
  props: IntegratedCameraControllerProps,
): React.JSX.Element;
```

The implementation keeps `panelOpen = false` during destructuring. The extraction includes `_camFinalTarget`, `_camMovement`, `_camForward`, and `_camRight` at module scope. It preserves all eleven event registrations and their matching removals, plus the existing bounds, camera constants, formulas, effect dependencies, and cleanup calls.

- [ ] **Step 2: Extract each environment visual with its resources**

Move each function and the exact module-scope resources it uses:

```ts
interface DataStreamsProps extends MotionProps {
  focused: boolean;
}

export function StructuralFrames(props: MotionProps): React.JSX.Element;
export function FloorSystem(): React.JSX.Element;
export function DataStreams(props: DataStreamsProps): React.JSX.Element;
```

Resource ownership is exact:

```text
StructuralFrames.tsx: framePillarGeo through frameLightPurpleMat
FloorSystem.tsx: floorPlaneGeo through floorGridMatOrange
DataStreams.tsx: streamParticleGeo, streamParticleMatFocus, streamParticleMatNormal
```

- [ ] **Step 3: Reduce `MuseumScene.tsx` to composition**

Replace local implementations with direct imports:

```ts
import { IntegratedCameraController } from './camera/IntegratedCameraController';
import { DataStreams } from './environment/DataStreams';
import { FloorSystem } from './environment/FloorSystem';
import { StructuralFrames } from './environment/StructuralFrames';
```

Retain the current `SceneBoundary`, `SceneContent`, `<Canvas>` settings, lights, fog, child order, `onCreated`, and fallback callback unchanged.

- [ ] **Step 4: Verify the scene composition boundary**

Run:

```powershell
npm test -- --run
npm run check
npm run build
(Get-Content src/scene/MuseumScene.tsx).Count
```

Expected: all commands pass and `MuseumScene.tsx` contains no more than 300 physical lines.

Commit:

```powershell
git add web/src/scene/MuseumScene.tsx web/src/scene/camera web/src/scene/environment
git commit -m "refactor: split camera and scene environment"
```

---

### Task 5: Extract Canvas Texture Generators And Wall Lifecycle

**Files:**
- Create: `web/src/scene/textures/profile-hologram-texture.ts`
- Create: `web/src/scene/textures/billboard-texture.ts`
- Create: `web/src/scene/environment/NeonWalls.tsx`
- Modify: `web/src/scene/MuseumScene.tsx`
- Remove: `web/src/scene/NeonWalls.tsx`

**Interfaces:**
- Produces: `createProfileHologramCanvas(content, coverImage)`, `createBillboardTexture(options)`, and `NeonWalls`.
- Preserves: Canvas dimensions, font strings, text, metrics, colors, filters, wall geometry, material settings, and animation timing.

- [ ] **Step 1: Extract the profile Canvas generator with explicit data**

Create `profile-hologram-texture.ts` by moving lines from the start of `createProfileHologramCanvas` through its `return canvas`. Replace only the three `resumeData.profile` reads with fields from the explicit content argument. Its final interface is:

```ts
export interface ProfileHologramContent {
  name: string;
  title: string;
  experience: string;
}

export function createProfileHologramCanvas(
  content: ProfileHologramContent,
  coverImage?: HTMLImageElement | null,
): HTMLCanvasElement;
```

The texture module must not import `resumeData`.

- [ ] **Step 2: Extract the billboard generator with one options object**

Create `billboard-texture.ts` by moving the full `createBillboardTexture` function and replacing its four positional arguments with this options interface:

```ts
import * as THREE from 'three';

export interface BillboardTextureOptions {
  title: string;
  subtitle: string;
  tags: readonly string[];
  accent: string;
}

export function createBillboardTexture({
  title,
  subtitle,
  tags,
  accent,
}: BillboardTextureOptions): THREE.CanvasTexture;
```

The implementation uses `subtitle` where the source function uses `sub`; every Canvas size, coordinate, font, color, filter, and draw call remains unchanged.

- [ ] **Step 3: Move wall rendering and make texture ownership explicit**

Move the existing geometry pool, refs, `useFrame`, and JSX to `environment/NeonWalls.tsx`. Keep `resumeData` in this rendering adapter and call:

```ts
createProfileHologramCanvas(
  {
    name: resumeData.profile.name,
    title: resumeData.profile.title,
    experience: resumeData.profile.experience,
  },
  image,
);
```

Create billboard textures with options objects containing the six existing title, subtitle, tag, and accent values. Add deterministic cleanup while preserving rendered output:

```ts
useEffect(() => {
  const textures = Object.values(billboardTextures);
  return () => textures.forEach((texture) => texture.dispose());
}, [billboardTextures]);
```

For the profile texture effect, retain the currently assigned texture in a local variable, dispose the previous texture before replacement, null `img.onload` and `img.onerror` during cleanup, and dispose the final texture on unmount.

- [ ] **Step 4: Point scene composition to the replacement module**

Update `MuseumScene.tsx`:

```ts
import { NeonWalls } from './environment/NeonWalls';
```

Delete the old `web/src/scene/NeonWalls.tsx` only after type checking passes.

- [ ] **Step 5: Verify texture extraction and build**

Run:

```powershell
npm test -- --run
npm run check
npm run build
```

Expected: all commands pass with no new TypeScript or Vite warnings.

Commit:

```powershell
git add web/src/scene/MuseumScene.tsx web/src/scene/environment/NeonWalls.tsx web/src/scene/textures web/src/scene/NeonWalls.tsx
git commit -m "refactor: isolate scene texture generation"
```

---

### Task 6: Split The Stylesheet Without Changing Cascade Order

**Files:**
- Create: `web/src/styles/base.css`
- Create: `web/src/styles/museum.css`
- Create: `web/src/styles/panels.css`
- Create: `web/src/styles/loading.css`
- Create: `web/src/styles/mobile-resume.css`
- Create: `web/src/styles/resume-modal.css`
- Create: `web/src/styles/responsive.css`
- Modify: `web/src/styles.css`

**Interfaces:**
- Preserves: `main.tsx` importing only `./styles.css`.
- Produces: a seven-import CSS manifest whose concatenated rule order matches the current 2,721-line file.

- [ ] **Step 1: Capture the exact pre-split stylesheet**

Before editing, record its line count and hash:

```powershell
(Get-Content src/styles.css).Count
(Get-FileHash src/styles.css -Algorithm SHA256).Hash
```

Expected line count: `2721`. Keep the hash in the task notes for audit only; split files naturally have a different hash.

- [ ] **Step 2: Move contiguous source sections in order**

Move complete rules, never partial rule blocks, using these current anchors:

```text
base.css:             :root through the rule immediately before .museum-shell
museum.css:           .museum-shell through the rule immediately before .exhibit-panel
panels.css:           .exhibit-panel through the rule immediately before .loading-screen
loading.css:          .loading-screen/.cyber-loading-screen through the max-width:640 loading media block
mobile-resume.css:    .fallback-shell through the rule immediately before the desktop resume modal comment
resume-modal.css:     desktop resume modal comment through the rule immediately before @media (max-width:1180px)
responsive.css:       @media (max-width:1180px) through the final prefers-reduced-motion block
```

After moving, verify no selector, declaration, or keyframe exists in two files.

- [ ] **Step 3: Replace `styles.css` with the ordered manifest**

The entire file becomes:

```css
@import './styles/base.css';
@import './styles/museum.css';
@import './styles/panels.css';
@import './styles/loading.css';
@import './styles/mobile-resume.css';
@import './styles/resume-modal.css';
@import './styles/responsive.css';
```

- [ ] **Step 4: Check structural invariants**

Run from `web/`:

```powershell
rg -n "^:root" src/styles src/styles.css
rg -n "^@keyframes" src/styles
rg -n "^@media" src/styles
npm run check
npm run build
```

Expected: one `:root`, every previous keyframe and media query appears once, TypeScript exits `0`, and the production CSS build succeeds.

- [ ] **Step 5: Commit the CSS split**

```powershell
git add web/src/styles.css web/src/styles
git commit -m "refactor: split application styles by feature"
```

---

### Task 7: Run Full Regression And Document The Result

**Files:**
- Modify only if verification exposes a regression: the owning module from Tasks 1-6.
- Do not commit screenshots, generated `dist/`, or temporary browser artifacts.

**Interfaces:**
- Verifies all prior task outputs together.
- Produces no new application API.

- [ ] **Step 1: Run complete automated verification**

From `web/`:

```powershell
npm test -- --run
npm run check
npm run build
```

Expected: 6 test files and 25 tests pass after the two new tests, TypeScript exits `0`, and Vite builds successfully. If Vitest reports a different total because a test file groups cases differently, require every discovered test to pass and record the actual total.

- [ ] **Step 2: Verify file-size acceptance criteria**

Run:

```powershell
(Get-Content src/scene/MuseumScene.tsx).Count
(Get-Content src/scene/exhibits/IndustrialAssets.tsx).Count
Get-ChildItem src/scene/exhibits/zones -Filter *.tsx | ForEach-Object { [PSCustomObject]@{ File=$_.Name; Lines=(Get-Content $_.FullName).Count } } | Format-Table -AutoSize
```

Expected: `MuseumScene.tsx` is at most 300 lines, `IndustrialAssets.tsx` is under 100 lines, and every zone is independently readable with no second exhibit implementation in the same file.

- [ ] **Step 3: Start the local application for visual verification**

Run:

```powershell
npm run dev -- --host 127.0.0.1
```

Keep the returned local URL. If port `5173` is occupied, use Vite's next available port.

- [ ] **Step 4: Verify desktop behavior in the browser**

At a `1440x900` viewport, verify:

```text
/?mode=museum
- Loading HUD renders and completes.
- Intro camera completes or can be skipped.
- All eight exhibit models render.
- Selecting every exhibit focuses the camera and opens the matching panel.
- Collapse, expand, close, return-home, zoom controls, mouse drag, and wheel zoom work.
- No browser console errors occur.
```

Capture representative screenshots of the home scene and one focused exhibit. Compare composition, color, visible text, and panel placement with the pre-refactor baseline.

- [ ] **Step 5: Verify reduced, mobile, and fallback behavior**

Verify:

```text
Desktop /?mode=reduced at 1440x900:
- Scene renders without continuous decorative motion.
- Exhibit selection and panels remain usable.

Mobile /?mode=fallback at 390x844:
- Desktop recommendation notice fits without overlap.
- Continuing reveals the vertical resume.
- Resume sections, engineering console tabs, modal, and download actions remain usable.
- No horizontal overflow or browser console errors occur.
```

Capture one reduced-mode and one mobile screenshot for comparison, then remove temporary screenshot files.

- [ ] **Step 6: Inspect dependencies and repository state**

Run:

```powershell
rg -n "from ['\"]\.\./zones|from ['\"].*/zones" src/scene/exhibits/shared
git status --short
git diff --check
```

Expected: the dependency search returns no matches, only intentional source changes are present, and `git diff --check` is empty.

- [ ] **Step 7: Commit any regression-only corrections**

If browser verification required a correction, rerun Steps 1-6 and commit only that correction:

```powershell
git add web/src/scene web/src/styles.css web/src/styles
git commit -m "fix: preserve scene behavior after component split"
```

If no correction was required, do not create an empty commit.

---

## Completion Checklist

- [ ] All eight exhibit IDs have one statically typed visual mapping.
- [ ] `IndustrialAssets.tsx` contains orchestration only.
- [ ] `MuseumScene.tsx` contains Canvas composition and fallback ownership only.
- [ ] Texture generators have explicit data inputs and no direct resume-data dependency.
- [ ] CSS remains available through `src/styles.css` in original cascade order.
- [ ] Existing and new tests pass.
- [ ] Type checking and production build pass.
- [ ] Desktop, reduced-motion, mobile, and fallback browser checks pass.
- [ ] No shared-to-zone imports, circular dependencies, duplicate static resources, generated artifacts, or temporary screenshots remain.
