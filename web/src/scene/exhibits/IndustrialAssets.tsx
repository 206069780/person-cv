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
