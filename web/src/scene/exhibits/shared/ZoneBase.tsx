import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import type { ZoneBaseProps } from '../exhibit-types';
import {
  baseAuraHaloGeo,
  baseCornerBlockGeo,
  baseCornerBoltGeo,
  baseGearTorusGeo,
  baseOctagonGeo,
  baseRingInnerGeo,
  baseRingOuterGeo,
  baseTopPlateGeo,
  baseUndercarriageRingGeo,
  baseUplightConeGeo,
  baseVentGeo,
  COLOR_STEEL_DARK,
  COLOR_STEEL_LIGHT,
  COLOR_STEEL_MID,
  matChromeBright,
  SIGNAL,
} from './resources';

export function ZoneBase({ intensity, accent = SIGNAL, motionEnabled = true }: ZoneBaseProps): React.JSX.Element {
  const gearRingRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (gearRingRef.current && motionEnabled) {
      gearRingRef.current.rotation.z += delta * 0.22 * (intensity > 1 ? 1.6 : 1);
    }
    if (haloRef.current && motionEnabled && intensity > 1) {
      haloRef.current.rotation.z -= delta * 0.35;
      const mat = haloRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.4 + Math.sin(clock.elapsedTime * 3.5) * 0.25;
      }
    }
  });

  return (
    <group>
      {/* 1. 八角重型合金主基台 */}
      <mesh position={[0, 0.11, 0]} receiveShadow geometry={baseOctagonGeo}>
        <meshStandardMaterial color={COLOR_STEEL_DARK} metalness={0.96} roughness={0.16} emissive={accent} emissiveIntensity={0.18 * intensity} />
      </mesh>

      {/* 2. 顶部钛合金防滑精密切削台面 */}
      <mesh position={[0, 0.22, 0]} receiveShadow geometry={baseTopPlateGeo}>
        <meshStandardMaterial color={COLOR_STEEL_MID} metalness={0.94} roughness={0.18} />
      </mesh>

      {/* 3. 内嵌双发光刻度环 */}
      <mesh position={[0, 0.255, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={baseRingInnerGeo}>
        <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.42 + intensity * 0.48} />
      </mesh>
      <mesh position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={baseRingOuterGeo}>
        <meshBasicMaterial color={accent} wireframe toneMapped={false} transparent opacity={0.25 + intensity * 0.35} />
      </mesh>

      {/* 4. 缓慢旋转外圈刻度齿轮环 */}
      <mesh ref={gearRingRef} position={[0, 0.265, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={baseGearTorusGeo}>
        <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.5 + intensity * 0.45} />
      </mesh>

      {/* 5. 展台底部下沉式全息氛围环 */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={baseUndercarriageRingGeo}>
        <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.35 + intensity * 0.45} />
      </mesh>

      {/* 6. 选中时的地面高科技全息能量投影光晕 */}
      {intensity > 1 && (
        <mesh ref={haloRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={baseAuraHaloGeo}>
          <meshBasicMaterial color={accent} wireframe toneMapped={false} transparent opacity={0.55} />
        </mesh>
      )}

      {/* 7. 四角减震定位角标与高亮镀铬螺栓 + 向上发光打光锥 */}
      {[-1.85, 1.85].flatMap((x) => [-1.85, 1.85].map((z) => (
        <group key={`${x}-${z}`} position={[x * 0.8, 0.23, z * 0.8]}>
          <mesh geometry={baseCornerBlockGeo}>
            <meshStandardMaterial color={COLOR_STEEL_LIGHT} metalness={0.94} roughness={0.15} emissive={accent} emissiveIntensity={0.45 * intensity} />
          </mesh>
          <mesh position={[0, 0.14, 0]} geometry={baseCornerBoltGeo} material={matChromeBright} />
          {/* 四角向上柔和微光锥（自下而上为展台立柱提供立体打光） */}
          <mesh position={[0, 0.45, 0]} geometry={baseUplightConeGeo}>
            <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.25 + intensity * 0.35} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )))}

      {/* 8. 四边发光散热格栅条 */}
      {[
        [0, 0.16, 2.35, 0],
        [0, 0.16, -2.35, 0],
        [2.35, 0.16, 0, Math.PI / 2],
        [-2.35, 0.16, 0, Math.PI / 2],
      ].map(([x, y, z, rot], idx) => (
        <mesh key={idx} position={[x, y, z]} rotation={[0, rot, 0]} geometry={baseVentGeo}>
          <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.6 + intensity * 0.38} />
        </mesh>
      ))}
    </group>
  );
}
