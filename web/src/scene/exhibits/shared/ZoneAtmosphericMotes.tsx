import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import type { ZoneAtmosphericMotesProps } from '../exhibit-types';
import { ambientMoteGeo, CYAN } from './resources';

export function ZoneAtmosphericMotes({
  accent = CYAN,
  intensity,
  motionEnabled = true,
  count = 14,
}: ZoneAtmosphericMotesProps): React.JSX.Element {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const helper = useMemo(() => new THREE.Object3D(), []);
  const motes = useMemo(() => Array.from({ length: count }, (_, i) => ({
    angle: (i / count) * Math.PI * 2,
    radius: 0.95 + (i % 4) * 0.38,
    baseY: 0.7 + (i % 5) * 0.35,
    speedY: 0.7 + (i % 3) * 0.3,
    speedRot: (i % 2 === 0 ? 1 : -1) * (0.35 + (i % 4) * 0.12),
    phase: i * 1.4,
  })), [count]);

  const moteMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: accent, toneMapped: false, transparent: true, opacity: 0.7 }),
    [accent]
  );

  useFrame(({ clock }) => {
    if (!meshRef.current || !motionEnabled) return;
    const t = clock.elapsedTime;
    motes.forEach((mote, i) => {
      const curAngle = mote.angle + t * mote.speedRot;
      const x = Math.cos(curAngle) * mote.radius;
      const z = Math.sin(curAngle) * mote.radius;
      const y = mote.baseY + Math.sin(t * mote.speedY + mote.phase) * 0.28;
      const scale = 0.65 + Math.sin(t * 2.2 + mote.phase) * 0.35;
      helper.position.set(x, y, z);
      helper.scale.setScalar(scale * (intensity > 1 ? 1.45 : 1));
      helper.updateMatrix();
      meshRef.current?.setMatrixAt(i, helper.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[ambientMoteGeo, moteMat, count]} />;
}
