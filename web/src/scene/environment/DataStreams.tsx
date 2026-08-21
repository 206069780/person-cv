import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import type { MotionProps } from '../scene-types';

const streamParticleGeo = new THREE.BoxGeometry(0.03, 0.015, 0.8);
const streamParticleMatFocus = new THREE.MeshBasicMaterial({ color: '#28d7e5', toneMapped: false, transparent: true, opacity: 0.25 });
const streamParticleMatNormal = new THREE.MeshBasicMaterial({ color: '#28d7e5', toneMapped: false, transparent: true, opacity: 0.85 });

const _streamMatrix = new THREE.Matrix4();

interface DataStreamsProps extends MotionProps {
  focused: boolean;
}

function DataStreamsComponent({ motionEnabled, focused }: DataStreamsProps): React.JSX.Element {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particles = useMemo(() => Array.from({ length: 48 }, (_, index) => ({
    lane: (index % 9) - 4,
    z: 18 - (index % 12) * 2.5,
    speed: 1.4 + (index % 5) * 0.22,
    y: 0.05 + (index % 3) * 0.025,
    scaleX: index % 8 === 0 ? 1.8 : 1,
  })), []);

  useFrame((_, delta) => {
    if (!meshRef.current || !motionEnabled || document.documentElement.dataset.modalOpen === 'true') return;
    const mesh = meshRef.current;
    particles.forEach((particle, index) => {
      particle.z -= delta * particle.speed;
      if (particle.z < -12) particle.z = 18;
      // 高性能直接矩阵构建：跳过 Object3D 完整组合开销
      _streamMatrix.makeScale(particle.scaleX, 1, 1).setPosition(particle.lane * 1.5, particle.y, particle.z);
      mesh.setMatrixAt(index, _streamMatrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[streamParticleGeo, focused ? streamParticleMatFocus : streamParticleMatNormal, particles.length]}
    />
  );
}

export const DataStreams = React.memo(DataStreamsComponent);

