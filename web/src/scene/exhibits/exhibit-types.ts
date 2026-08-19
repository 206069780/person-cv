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
