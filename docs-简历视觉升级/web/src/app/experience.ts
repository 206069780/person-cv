export type ExperienceMode = 'museum' | 'reduced' | 'fallback';

export interface ExperienceInput {
  width: number;
  webgl: boolean;
  reducedMotion: boolean;
}

export function selectExperienceMode(input: ExperienceInput): ExperienceMode {
  if (!input.webgl || input.width < 768) return 'fallback';
  if (input.reducedMotion) return 'reduced';
  return 'museum';
}

export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function detectExperienceMode(): ExperienceMode {
  return selectExperienceMode({
    width: window.innerWidth,
    webgl: detectWebGL(),
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  });
}
