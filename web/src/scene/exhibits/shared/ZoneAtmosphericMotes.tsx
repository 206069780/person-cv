import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import type { ZoneAtmosphericMotesProps } from '../exhibit-types';
import { ambientMoteGeo, CYAN, getCachedBasicMaterial } from './resources';

const _moteMatrix = new THREE.Matrix4();

function ZoneAtmosphericMotesComponent({
  accent = CYAN,
  intensity,
  motionEnabled = true,
  count = 14,
}: ZoneAtmosphericMotesProps): React.JSX.Element {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const motes = useMemo(() => Array.from({ length: count }, (_, i) => ({
    angle: (i / count) * Math.PI * 2,
    radius: 0.95 + (i % 4) * 0.38,
    baseY: 0.7 + (i % 5) * 0.35,
    speedY: 0.7 + (i % 3) * 0.3,
    speedRot: (i % 2 === 0 ? 1 : -1) * (0.35 + (i % 4) * 0.12),
    phase: i * 1.4,
  })), [count]);

  const moteMat = useMemo(
    () => getCachedBasicMaterial(accent, { transparent: true, opacity: 0.7 }),
    [accent]
  );

  useFrame(({ clock }) => {
    if (!meshRef.current || !motionEnabled) return;
    const mesh = meshRef.current;
    const t = clock.elapsedTime;
    const intensityScale = intensity > 1 ? 1.45 : 1;
    motes.forEach((mote, i) => {
      const curAngle = mote.angle + t * mote.speedRot;
      const x = Math.cos(curAngle) * mote.radius;
      const z = Math.sin(curAngle) * mote.radius;
      const y = mote.baseY + Math.sin(t * mote.speedY + mote.phase) * 0.28;
      const scale = (0.65 + Math.sin(t * 2.2 + mote.phase) * 0.35) * intensityScale;
      _moteMatrix.makeScale(scale, scale, scale).setPosition(x, y, z);
      mesh.setMatrixAt(i, _moteMatrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[ambientMoteGeo, moteMat, count]} />;
}

export const ZoneAtmosphericMotes = React.memo(ZoneAtmosphericMotesComponent);

