import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import type { FlowPulsesProps } from '../exhibit-types';
import { getCachedBasicMaterial, pulseSphereGeo } from './resources';

const _pulseMatrix = new THREE.Matrix4();

function FlowPulsesComponent({
  start,
  end,
  color,
  intensity,
  motionEnabled,
  count = 3,
}: FlowPulsesProps): React.JSX.Element {
  const ref = useRef<THREE.InstancedMesh>(null);
  const progress = useRef(Array.from({ length: count }, (_, index) => index / count));
  const material = useMemo(
    () => getCachedBasicMaterial(color, { transparent: true, opacity: +(0.35 + intensity * 0.55).toFixed(2) }),
    [color, intensity]
  );

  useFrame((_, delta) => {
    if (!ref.current || !motionEnabled || intensity < 0.25) return;
    const mesh = ref.current;
    progress.current.forEach((value, index) => {
      const next = (value + delta * (0.2 + index * 0.015)) % 1;
      progress.current[index] = next;
      const x = THREE.MathUtils.lerp(start[0], end[0], next);
      const y = THREE.MathUtils.lerp(start[1], end[1], next);
      const z = THREE.MathUtils.lerp(start[2], end[2], next);
      const scale = index % 2 === 0 ? 1.1 : 0.8;
      _pulseMatrix.makeScale(scale, scale, scale).setPosition(x, y, z);
      mesh.setMatrixAt(index, _pulseMatrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[pulseSphereGeo, material, count]} />
  );
}

export const FlowPulses = React.memo(FlowPulsesComponent);

