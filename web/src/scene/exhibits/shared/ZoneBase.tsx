import React, { useMemo, useRef } from 'react';
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
  getCachedBasicMaterial,
  matChromeBright,
  matSteelMid,
  SIGNAL,
} from './resources';

const CORNER_POSITIONS: readonly [number, number, number][] = [
  [-1.48, 0.23, -1.48],
  [-1.48, 0.23, 1.48],
  [1.48, 0.23, -1.48],
  [1.48, 0.23, 1.48],
];

const VENT_CONFIGS: readonly [number, number, number, number][] = [
  [0, 0.16, 2.35, 0],
  [0, 0.16, -2.35, 0],
  [2.35, 0.16, 0, Math.PI / 2],
  [-2.35, 0.16, 0, Math.PI / 2],
];

function ZoneBaseComponent({ intensity, accent = SIGNAL, motionEnabled = true }: ZoneBaseProps): React.JSX.Element {
  const gearRingRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  // 针对该展台的 accent 和 intensity 缓存材质实例，避免每一帧或每次 re-render 创建重复材质
  const materials = useMemo(() => {
    const mainOctagon = new THREE.MeshStandardMaterial({
      color: COLOR_STEEL_DARK,
      metalness: 0.96,
      roughness: 0.16,
      emissive: accent,
      emissiveIntensity: 0.18 * intensity,
    });

    const cornerBlock = new THREE.MeshStandardMaterial({
      color: COLOR_STEEL_LIGHT,
      metalness: 0.94,
      roughness: 0.15,
      emissive: accent,
      emissiveIntensity: 0.45 * intensity,
    });

    return {
      mainOctagon,
      cornerBlock,
      ringInner: getCachedBasicMaterial(accent, { transparent: true, opacity: +(0.42 + intensity * 0.48).toFixed(2) }),
      ringOuter: getCachedBasicMaterial(accent, { transparent: true, opacity: +(0.25 + intensity * 0.35).toFixed(2), wireframe: true }),
      gearRing: getCachedBasicMaterial(accent, { transparent: true, opacity: +(0.5 + intensity * 0.45).toFixed(2) }),
      undercarriage: getCachedBasicMaterial(accent, { transparent: true, opacity: +(0.35 + intensity * 0.45).toFixed(2) }),
      halo: getCachedBasicMaterial(accent, { transparent: true, opacity: 0.55, wireframe: true }),
      uplightCone: getCachedBasicMaterial(accent, { transparent: true, opacity: +(0.25 + intensity * 0.35).toFixed(2), side: THREE.DoubleSide }),
      vent: getCachedBasicMaterial(accent, { transparent: true, opacity: +(0.6 + intensity * 0.38).toFixed(2) }),
    };
  }, [accent, intensity]);

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
      <mesh position={[0, 0.11, 0]} receiveShadow geometry={baseOctagonGeo} material={materials.mainOctagon} />

      {/* 2. 顶部钛合金防滑精密切削台面 (共享材质) */}
      <mesh position={[0, 0.22, 0]} receiveShadow geometry={baseTopPlateGeo} material={matSteelMid} />

      {/* 3. 内嵌双发光刻度环 */}
      <mesh position={[0, 0.255, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={baseRingInnerGeo} material={materials.ringInner} />
      <mesh position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={baseRingOuterGeo} material={materials.ringOuter} />

      {/* 4. 缓慢旋转外圈刻度齿轮环 */}
      <mesh ref={gearRingRef} position={[0, 0.265, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={baseGearTorusGeo} material={materials.gearRing} />

      {/* 5. 展台底部下沉式全息氛围环 */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={baseUndercarriageRingGeo} material={materials.undercarriage} />

      {/* 6. 选中时的地面高科技全息能量投影光晕 */}
      {intensity > 1 && (
        <mesh ref={haloRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={baseAuraHaloGeo} material={materials.halo} />
      )}

      {/* 7. 四角减震定位角标与高亮镀铬螺栓 + 向上发光打光锥 */}
      {CORNER_POSITIONS.map((pos, idx) => (
        <group key={idx} position={pos}>
          <mesh geometry={baseCornerBlockGeo} material={materials.cornerBlock} />
          <mesh position={[0, 0.14, 0]} geometry={baseCornerBoltGeo} material={matChromeBright} />
          <mesh position={[0, 0.45, 0]} geometry={baseUplightConeGeo} material={materials.uplightCone} />
        </group>
      ))}

      {/* 8. 四边发光散热格栅条 */}
      {VENT_CONFIGS.map(([x, y, z, rot], idx) => (
        <mesh key={idx} position={[x, y, z]} rotation={[0, rot, 0]} geometry={baseVentGeo} material={materials.vent} />
      ))}
    </group>
  );
}

export const ZoneBase = React.memo(ZoneBaseComponent);

