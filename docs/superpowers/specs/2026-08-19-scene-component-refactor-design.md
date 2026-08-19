# Scene Component Refactor Design

## Objective

Refactor the oversized React, React Three Fiber, and CSS files into focused modules without changing visible behavior, interaction, animation timing, copy, or fallback behavior.

The main targets are:

- `src/scene/IndustrialAssets.tsx`, which currently owns shared Three.js resources, shared effects, eight exhibit implementations, and exhibit dispatch.
- `src/scene/MuseumScene.tsx`, which currently owns the Canvas boundary, camera control, environment structure, floor, data streams, and scene composition.
- `src/scene/NeonWalls.tsx`, which currently combines Canvas texture generation with wall rendering and animation.
- `src/styles.css`, which currently combines desktop museum, loading, mobile resume, panel, modal, responsive, and accessibility styles.

## Constraints

- Preserve the current desktop and mobile appearance.
- Preserve camera behavior, intro timing, exhibit selection, panel behavior, motion reduction, WebGL fallback, and all displayed copy.
- Preserve Three.js geometry, material, color, light, texture, and animation parameters.
- Do not introduce Context, a state library, or a runtime plugin system.
- Keep `App` as the owner of experience mode, loading, intro, exhibit selection, and panel state.
- Keep CSS cascade order stable while splitting the stylesheet.

## Chosen Approach

Use a domain-oriented split. Scene orchestration, camera behavior, environment systems, texture generation, shared exhibit effects, and each exhibit visual become separate modules with explicit interfaces.

This provides clearer ownership than a shallow file move while avoiding the behavioral risk of rewriting the scene as a configuration-driven renderer.

## Target Structure

```text
src/scene/
  MuseumScene.tsx
  scene-types.ts
  camera/
    IntegratedCameraController.tsx
  environment/
    FloorSystem.tsx
    StructuralFrames.tsx
    DataStreams.tsx
    NeonWalls.tsx
  textures/
    profile-hologram-texture.ts
    billboard-texture.ts
  exhibits/
    IndustrialAssets.tsx
    exhibit-types.ts
    zone-registry.ts
    shared/
      ZoneBase.tsx
      FlowPulses.tsx
      ZoneAtmosphericMotes.tsx
      CyberIndustrialPillar.tsx
      resources.ts
    zones/
      LitreeOverviewZone.tsx
      LitreeAiotZone.tsx
      LitreeAgentZone.tsx
      LitreeOaZone.tsx
      WelinkSearchZone.tsx
      WelinkDataLakeZone.tsx
      SengeGatewayZone.tsx
      SengePlatformZone.tsx

src/styles/
  base.css
  museum.css
  loading.css
  mobile-resume.css
  panels.css
  responsive.css
```

The existing `src/styles.css` remains the application stylesheet entry point and imports the files under `src/styles/` in their original cascade order. `src/main.tsx` therefore keeps its current import.

## Responsibilities

### Scene orchestration

`MuseumScene.tsx` owns the React Three Fiber `Canvas` configuration and composes the scene. It does not contain camera movement, floor geometry, structural frames, or data-stream implementations.

`IntegratedCameraController.tsx` owns keyboard and pointer input, focus transitions, panel-aware framing, intro camera behavior, listener cleanup, and camera updates.

The environment modules own only their named visual system. The scene error boundary remains responsible for converting rendering failures into the existing fallback callback.

### Exhibit visuals

`IndustrialAssets.tsx` iterates over the exhibit layout, calculates focus intensity, and renders the registered visual for each exhibit. It does not define exhibit geometry or animation.

Each file under `zones/` owns the static Three.js resources, refs, frame updates, and JSX for one exhibit. Resources used by only one exhibit remain beside that exhibit. Resources shared by multiple exhibits live in `shared/resources.ts`.

The common base, pulse, atmospheric mote, and industrial pillar effects remain reusable components under `shared/`. They must not import a concrete exhibit component.

### Texture generation

Texture modules contain the Canvas drawing functions. They receive explicit plain data instead of importing `resumeData` directly. `NeonWalls.tsx` adapts resume data to those inputs, owns image loading and texture lifetime, and renders the wall meshes.

### Styles

Styles are split by UI ownership, not by selector type. Existing selectors, property values, keyframes, and media-query behavior remain unchanged. Imports in `styles.css` retain the original source order so equal-specificity rules continue to resolve identically.

## Interfaces

Shared contracts use named TypeScript types:

- `MotionProps` contains `motionEnabled`.
- `ExhibitSelectionProps` contains the active exhibit identifier and selection callback.
- `MuseumSceneProps` combines the explicit state and lifecycle callbacks required by the scene boundary.
- `ExhibitVisualProps` contains only `intensity` and `motionEnabled`.
- `IndustrialAssetsProps` combines motion and exhibit selection responsibilities.

The current unused `exhibit` field is removed from the props passed to individual exhibit visuals.

The zone registry is statically typed against the complete exhibit ID union. Missing or extra mappings fail TypeScript compilation. The registry replaces the current `switch` without introducing runtime registration.

Public callbacks retain their current semantics:

- Selecting an exhibit reports its ID.
- Clearing selection reports `null`.
- Scene readiness, intro completion, and fallback remain separate callbacks.

## Data Flow

```text
App state
  -> MuseumScene
      -> camera and environment systems
      -> IndustrialAssets
          -> typed zone registry
              -> one exhibit visual per exhibit layout entry

Scene render error
  -> SceneBoundary
      -> App fallback callback
          -> MobileResume
```

No child component mutates application state directly. Frame-loop state remains local to the component that animates it.

## Error Handling And Resource Safety

- Preserve the current scene error boundary and fallback behavior.
- Preserve event-listener cleanup in the camera controller.
- Preserve texture disposal and image-load cleanup when texture logic moves.
- Keep reusable geometry and material instances at module scope.
- Avoid duplicate resource construction when moving exhibit code.
- Maintain the current reduced-motion branches and animation guards.

## Migration Strategy

1. Add characterization coverage proving that every existing exhibit ID has exactly one visual mapping.
2. Extract shared contracts, shared resources, and common exhibit effects.
3. Move the eight exhibit visuals one at a time and run tests and type checking after each logical group.
4. Reduce `IndustrialAssets.tsx` to focus calculation and typed registry composition.
5. Extract the camera controller and environment systems from `MuseumScene.tsx`.
6. Extract Canvas texture generators, then reduce `NeonWalls.tsx` to lifecycle and rendering responsibilities.
7. Split CSS in original cascade order without changing rule contents.
8. Run automated and browser-based regression verification.

## Testing And Verification

Automated verification:

- `npm test -- --run`
- `npm run check`
- `npm run build`
- A registry test confirms every exhibit ID maps to exactly one visual component.
- Type-level exhaustiveness prevents missing and extra registry entries.

Browser verification covers:

- Desktop loading sequence and intro transition.
- Desktop camera movement and exhibit focus.
- Exhibit selection, panel collapse, close, and return-home behavior.
- All eight exhibit visuals and hologram labels.
- Reduced-motion behavior.
- Mobile notice and vertical resume.
- Explicit fallback mode.
- Representative desktop and mobile screenshots compared before and after the refactor.

## Acceptance Criteria

- No perceptible visual, interaction, animation, copy, or fallback regression.
- The full existing test suite and new characterization tests pass.
- Type checking and production build pass.
- `MuseumScene.tsx` and `IndustrialAssets.tsx` each contain no more than 300 physical lines.
- Each exhibit file has one clear visual responsibility.
- Shared modules contain only resources or behavior used by multiple consumers.
- No new circular dependencies or duplicate Three.js resource allocation are introduced.
