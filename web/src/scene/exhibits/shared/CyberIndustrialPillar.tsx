import { useRef } from 'react';
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
  matChromeBright,
  matSteelLight,
  matTitaniumDark,
  pillarApexBeamGeo,
  pillarApexFlareGeo,
  pillarScanRingGeo,
  SAFETY,
} from './resources';

export function CyberIndustrialPillar({
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

  useFrame(({ clock }) => {
    if (!motionEnabled) return;
    const t = clock.elapsedTime;
    if (scanRingRef.current) {
      // 沿立柱上下往复穿梭的能量扫描光环
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
      {/* 1. 黑色深钛金重型立柱主体（带高光金属层次） */}
      <mesh position={[0, height / 2, 0]} castShadow geometry={corePillarMainGeo} material={matTitaniumDark} />

      {/* 2. 散热鳍片 (Cooling Fins) */}
      {[0.32, 0.75, 1.18, 1.6].map((y, fIdx) => (
        <group key={fIdx} position={[0, y, 0]}>
          <mesh geometry={corePillarFinGeo} material={matSteelLight} />
          {/* 散热片缝隙微型呼吸霓虹光片 */}
          <mesh geometry={corePillarFinSlotNeonGeo}>
            <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.65 + intensity * 0.3} />
          </mesh>
        </group>
      ))}

      {/* 3. 4 面嵌入式全方位高亮激光总线 */}
      {[
        [0, height / 2, 0.194, 0],
        [0, height / 2, -0.194, 0],
        [0.194, height / 2, 0, Math.PI / 2],
        [-0.194, height / 2, 0, Math.PI / 2],
      ].map(([lx, ly, lz, rot], lIdx) => (
        <mesh key={lIdx} position={[lx, ly, lz]} rotation={[0, rot, 0]}>
          <boxGeometry args={[0.065, height - 0.1, 0.015]} />
          <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.88 + intensity * 0.12} />
        </mesh>
      ))}

      {/* 4. 4 角高亮棱角导光条 */}
      {[-0.19, 0.19].flatMap((ex) => [-0.19, 0.19].map((ez) => (
        <mesh key={`edge-${ex}-${ez}`} position={[ex, height / 2, ez]} geometry={corePillarSideNeonGeo}>
          <meshBasicMaterial color={secondaryAccent} toneMapped={false} transparent opacity={0.65 + intensity * 0.35} />
        </mesh>
      )))}

      {/* 5. 动态上下扫描能量环 (Vertical Scanner Ring) */}
      <mesh ref={scanRingRef} position={[0, height / 2, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={pillarScanRingGeo}>
        <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.88 + intensity * 0.12} />
      </mesh>

      {/* 6. 柱脚地表聚能井 (Ground Energy Socket) */}
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={energyWellSocketGeo}>
        <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.65 + intensity * 0.35} />
      </mesh>
      <mesh position={[0, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={energySocketInnerDiscGeo}>
        <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={0.35 + intensity * 0.3} />
      </mesh>

      {/* 7. 柱顶尖塔与全息聚能透镜 */}
      <mesh position={[0, height + 0.12, 0]} geometry={corePillarSpireGeo} material={matChromeBright} />
      <mesh ref={flareRef} position={[0, height + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={pillarApexFlareGeo}>
        <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* 8. 柱顶向上投射的柔和体积光锥 (Apex Volumetric Beam) */}
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
