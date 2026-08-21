import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import type { CyberIndustrialPillarProps } from '../exhibit-types';
import {
  corePillarFinGeo,
  corePillarFinSlotNeonGeo,
  corePillarMainGeo,
  corePillarSideNeonGeo,
  corePillarSpireGeo,
  CYAN,
  energySocketInnerDiscGeo,
  energyWellSocketGeo,
  getCachedBasicMaterial,
  matChromeBright,
  matSteelLight,
  matTitaniumDark,
  pillarApexBeamGeo,
  pillarApexFlareGeo,
  pillarScanRingGeo,
  SAFETY,
} from './resources';

const BUS_CONFIGS = (height: number): readonly [number, number, number, number][] => [
  [0, height / 2, 0.194, 0],
  [0, height / 2, -0.194, 0],
  [0.194, height / 2, 0, Math.PI / 2],
  [-0.194, height / 2, 0, Math.PI / 2],
];

const EDGE_POSITIONS = [-0.19, 0.19].flatMap((ex) => [-0.19, 0.19].map((ez) => [ex, ez] as const));

function CyberIndustrialPillarComponent({
  position,
  accent = CYAN,
  secondaryAccent = SAFETY,
  intensity,
  motionEnabled = true,
  height = 1.95,
  withBeam = true,
}: CyberIndustrialPillarProps): React.JSX.Element {
  const scanRingRef = useRef<THREE.Mesh>(null);
  const flareRef = useRef<THREE.Mesh>(null);
  const beamMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const busGeo = useMemo(() => new THREE.BoxGeometry(0.065, height - 0.1, 0.015), [height]);
  const busConfigs = useMemo(() => BUS_CONFIGS(height), [height]);

  const materials = useMemo(() => {
    return {
      finSlot: getCachedBasicMaterial(accent, { transparent: true, opacity: +(0.65 + intensity * 0.3).toFixed(2) }),
      bus: getCachedBasicMaterial(accent, { transparent: true, opacity: +(0.88 + intensity * 0.12).toFixed(2) }),
      edge: getCachedBasicMaterial(secondaryAccent, { transparent: true, opacity: +(0.65 + intensity * 0.35).toFixed(2) }),
      scanRing: getCachedBasicMaterial(accent, { transparent: true, opacity: +(0.88 + intensity * 0.12).toFixed(2) }),
      wellSocket: getCachedBasicMaterial(accent, { transparent: true, opacity: +(0.65 + intensity * 0.35).toFixed(2) }),
      innerDisc: getCachedBasicMaterial('#ffffff', { transparent: true, opacity: +(0.35 + intensity * 0.3).toFixed(2) }),
      flare: getCachedBasicMaterial(accent, { transparent: true, opacity: 0.85, side: THREE.DoubleSide }),
    };
  }, [accent, secondaryAccent, intensity]);

  useFrame(({ clock }) => {
    if (!motionEnabled) return;
    const t = clock.elapsedTime;
    if (scanRingRef.current) {
      scanRingRef.current.position.y = 0.35 + (0.5 + 0.5 * Math.sin(t * 2.8 + position[0] * 2.5 + position[2])) * (height - 0.65);
      scanRingRef.current.rotation.z += 0.035;
    }
    if (flareRef.current) {
      flareRef.current.rotation.z -= 0.025;
    }
    if (beamMatRef.current) {
      beamMatRef.current.opacity = 0.22 + (0.5 + 0.5 * Math.sin(t * 3.2 + position[0])) * 0.22 * (intensity > 1 ? 1.6 : 1);
    }
  });

  return (
    <group position={position}>
      {/* 1. 黑色深钛金重型立柱主体 */}
      <mesh position={[0, height / 2, 0]} castShadow geometry={corePillarMainGeo} material={matTitaniumDark} />

      {/* 2. 散热鳍片 */}
      {[0.32, 0.75, 1.18, 1.6].map((y, fIdx) => (
        <group key={fIdx} position={[0, y, 0]}>
          <mesh geometry={corePillarFinGeo} material={matSteelLight} />
          <mesh geometry={corePillarFinSlotNeonGeo} material={materials.finSlot} />
        </group>
      ))}

      {/* 3. 4 面嵌入式全方位高亮激光总线 */}
      {busConfigs.map(([lx, ly, lz, rot], lIdx) => (
        <mesh key={lIdx} position={[lx, ly, lz]} rotation={[0, rot, 0]} geometry={busGeo} material={materials.bus} />
      ))}

      {/* 4. 4 角高亮棱角导光条 */}
      {EDGE_POSITIONS.map(([ex, ez], idx) => (
        <mesh key={idx} position={[ex, height / 2, ez]} geometry={corePillarSideNeonGeo} material={materials.edge} />
      ))}

      {/* 5. 动态上下扫描能量环 */}
      <mesh ref={scanRingRef} position={[0, height / 2, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={pillarScanRingGeo} material={materials.scanRing} />

      {/* 6. 柱脚地表聚能井 */}
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={energyWellSocketGeo} material={materials.wellSocket} />
      <mesh position={[0, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={energySocketInnerDiscGeo} material={materials.innerDisc} />

      {/* 7. 柱顶尖塔与全息聚能透镜 */}
      <mesh position={[0, height + 0.12, 0]} geometry={corePillarSpireGeo} material={matChromeBright} />
      <mesh ref={flareRef} position={[0, height + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={pillarApexFlareGeo} material={materials.flare} />

      {/* 8. 柱顶向上投射的柔和体积光锥 */}
      {withBeam && (
        <mesh position={[0, height + 0.95, 0]} geometry={pillarApexBeamGeo}>
          <meshBasicMaterial
            ref={beamMatRef}
            color={accent}
            toneMapped={false}
            transparent
            opacity={0.25 + intensity * 0.3}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

export const CyberIndustrialPillar = React.memo(CyberIndustrialPillarComponent);

