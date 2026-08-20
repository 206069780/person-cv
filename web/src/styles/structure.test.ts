import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const imports = [
  "@import './styles/base.css';",
  "@import './styles/museum.css';",
  "@import './styles/panels.css';",
  "@import './styles/loading.css';",
  "@import './styles/mobile-resume.css';",
  "@import './styles/resume-modal.css';",
  "@import './styles/responsive.css';",
];

describe('stylesheet boundaries', () => {
  it('keeps the stylesheet entry point as an ordered feature manifest', () => {
    const entry = new URL('../styles.css', import.meta.url);
    const filesExist = imports.every((line) => {
      const path = line.match(/'(.+)'/)?.[1];
      return path ? existsSync(new URL(`../${path}`, import.meta.url)) : false;
    });

    expect(readFileSync(entry, 'utf8').trim().split(/\r?\n/)).toEqual(imports);
    expect(filesExist).toBe(true);
  });
});
