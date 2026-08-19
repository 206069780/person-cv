import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import type { FlowPulsesProps } from '../exhibit-types';
import { pulseSphereGeo } from './resources';

export function FlowPulses({
  start,
  end,
  color,
  intensity,
  motionEnabled,
  count = 3,
}: FlowPulsesProps): React.JSX.Element {
  const ref = useRef<THREE.InstancedMesh>(null);
  const helper = useMemo(() => new THREE.Object3D(), []);
  const progress = useRef(Array.from({ length: count }, (_, index) => index / count));
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: true, opacity: 0.35 + intensity * 0.55 }),
    [color, intensity]
  );

  useFrame((_, delta) => {
    if (!ref.current || !motionEnabled || intensity < 0.25) return;
    progress.current.forEach((value, index) => {
      const next = (value + delta * (0.2 + index * 0.015)) % 1;
      progress.current[index] = next;
      helper.position.set(
        THREE.MathUtils.lerp(start[0], end[0], next),
        THREE.MathUtils.lerp(start[1], end[1], next),
        THREE.MathUtils.lerp(start[2], end[2], next),
      );
      helper.scale.setScalar(index % 2 === 0 ? 1.1 : 0.8);
      helper.updateMatrix();
      ref.current?.setMatrixAt(index, helper.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[pulseSphereGeo, material, count]} />
  );
}
