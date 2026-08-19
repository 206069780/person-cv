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
