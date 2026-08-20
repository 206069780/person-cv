import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const missingModules = (paths: readonly string[]) => paths.filter(
  (path) => !existsSync(new URL(path, import.meta.url)),
);

const sharedModulePaths = [
  './exhibits/shared/resources.ts',
  './exhibits/shared/FlowPulses.tsx',
  './exhibits/shared/ZoneBase.tsx',
  './exhibits/shared/ZoneAtmosphericMotes.tsx',
  './exhibits/shared/CyberIndustrialPillar.tsx',
] as const;

describe('scene module boundaries', () => {
  it('keeps shared exhibit effects in focused modules', () => {
    expect(missingModules(sharedModulePaths)).toEqual([]);
  });

  it('keeps shared exhibit effects independent of zones', () => {
    const sharedSource = sharedModulePaths.map((path) =>
      readFileSync(new URL(path, import.meta.url), 'utf8'),
    ).join('\n');

    expect(sharedSource).not.toMatch(/from\s+['"][^'"]*\/zones(?:\/|['"])/);
  });

  it('keeps camera and environment systems in focused modules', () => {
    expect(missingModules([
      './camera/IntegratedCameraController.tsx',
      './environment/FloorSystem.tsx',
      './environment/StructuralFrames.tsx',
      './environment/DataStreams.tsx',
    ])).toEqual([]);
  });
});
