import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import type { ExhibitVisualProps } from '../exhibit-types';
import { FlowPulses } from '../shared/FlowPulses';
import { ZoneAtmosphericMotes } from '../shared/ZoneAtmosphericMotes';
import { ZoneBase } from '../shared/ZoneBase';
import {
  COLOR_STEEL_DARK,
  COLOR_STEEL_LIGHT,
  CYAN,
  getCachedBasicMaterial,
  GOLD,
  matAcrylicCyan,
  matChromeBright,
  matGoldAlloy,
  matTitaniumDark,
  SAFETY,
} from '../shared/resources';

// 01 - Litree Overview (微服务与数据底座)
const coreOctaOuterGeo = new THREE.OctahedronGeometry(0.88, 0);
const coreOctaInnerGeo = new THREE.OctahedronGeometry(0.55, 0);
const coreOctaWireGeo = new THREE.OctahedronGeometry(1.05, 0);
const coreGimbalRing1Geo = new THREE.TorusGeometry(1.48, 0.032, 8, 56);
const coreGimbalRing2Geo = new THREE.TorusGeometry(1.18, 0.026, 8, 48);
const coreGimbalRing3Geo = new THREE.TorusGeometry(0.92, 0.022, 8, 40);
const coreElectrodeGeo = new THREE.CylinderGeometry(0.05, 0.14, 0.78, 8);
const coreShardBoxGeo = new THREE.BoxGeometry(0.3, 0.42, 0.24);
const coreShardCapGeo = new THREE.BoxGeometry(0.32, 0.04, 0.26);
const coreShardGlowGeo = new THREE.BoxGeometry(0.22, 0.045, 0.02);
const corePedestalSubGeo = new THREE.CylinderGeometry(0.72, 1.05, 0.22, 8);
const corePedestalDiscGeo = new THREE.RingGeometry(0.62, 0.98, 24);
const coreGroundAuraGeo = new THREE.RingGeometry(1.35, 1.62, 36);

const SHARD_CONFIGS = [0, 1, 2, 3, 4, 5].map((idx) => {
  const angle = (idx / 6) * Math.PI * 2;
  return {
    idx,
    position: [Math.cos(angle) * 1.75, Math.sin(angle * 3) * 0.22, Math.sin(angle) * 1.75] as const,
    color: idx % 2 === 0 ? CYAN : SAFETY,
  };
});

// ==========================================
// 1. Litree 架构底座与微服务治理 (Core Zone)
// ==========================================
function LitreeOverviewZoneComponent({ intensity, motionEnabled }: ExhibitVisualProps): React.JSX.Element {
  const coreRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const shardGroupRef = useRef<THREE.Group>(null);

  const materials = useMemo(() => {
    return {
      coreInner: new THREE.MeshStandardMaterial({ color: COLOR_STEEL_DARK, metalness: 0.9, emissive: CYAN, emissiveIntensity: 1.9 * intensity }),
      coreWire: getCachedBasicMaterial(SAFETY, { wireframe: true, transparent: true, opacity: +(0.65 + intensity * 0.35).toFixed(2) }),
      pedestalDisc: getCachedBasicMaterial(CYAN, { transparent: true, opacity: +(0.75 + intensity * 0.25).toFixed(2) }),
      groundAura: getCachedBasicMaterial(SAFETY, { wireframe: true, transparent: true, opacity: +(0.35 + intensity * 0.35).toFixed(2) }),
      ring1: getCachedBasicMaterial(CYAN, { transparent: true, opacity: +(0.7 + intensity * 0.3).toFixed(2) }),
      ring2: getCachedBasicMaterial(SAFETY, { transparent: true, opacity: +(0.65 + intensity * 0.35).toFixed(2) }),
      ring3: getCachedBasicMaterial(GOLD, { transparent: true, opacity: +(0.6 + intensity * 0.4).toFixed(2) }),
      shardCyan: new THREE.MeshStandardMaterial({ color: COLOR_STEEL_LIGHT, metalness: 0.94, roughness: 0.12, emissive: CYAN, emissiveIntensity: 0.65 * intensity }),
      shardSafety: new THREE.MeshStandardMaterial({ color: COLOR_STEEL_LIGHT, metalness: 0.94, roughness: 0.12, emissive: SAFETY, emissiveIntensity: 0.65 * intensity }),
      shardGlow: getCachedBasicMaterial(CYAN),
    };
  }, [intensity]);

  useFrame(({ clock }, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.65 : 1;
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.65 * speedMult;
      coreRef.current.position.y = 1.48 + Math.sin(clock.elapsedTime * 2.2) * 0.08;
    }
    if (ring1Ref.current) ring1Ref.current.rotation.x += delta * 0.85 * speedMult;
    if (ring2Ref.current) ring2Ref.current.rotation.y += delta * 1.05 * speedMult;
    if (ring3Ref.current) ring3Ref.current.rotation.z -= delta * 0.95 * speedMult;
    if (shardGroupRef.current) shardGroupRef.current.rotation.y -= delta * 0.38 * speedMult;
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={CYAN} motionEnabled={motionEnabled} />
      <ZoneAtmosphericMotes accent={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={16} />

      {/* 1. 地面流线型能量承托底盘与全息环 */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.32, 0]} geometry={corePedestalSubGeo} material={matTitaniumDark} />
        <mesh position={[0, 0.44, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={corePedestalDiscGeo} material={materials.pedestalDisc} />
        <mesh position={[0, 0.028, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={coreGroundAuraGeo} material={materials.groundAura} />
      </group>

      {/* 2. 中央核心微服务与 Seata 事务八面体晶核 */}
      <group position={[0, 1.48, 0]}>
        <group ref={coreRef}>
          <mesh geometry={coreOctaOuterGeo} material={matAcrylicCyan} />
          <mesh geometry={coreOctaInnerGeo} material={materials.coreInner} />
          <mesh geometry={coreOctaWireGeo} material={materials.coreWire} />
        </group>

        {/* 3层嵌套双轴陀螺万向环 */}
        <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]} geometry={coreGimbalRing1Geo} material={materials.ring1} />
        <mesh ref={ring2Ref} rotation={[0, Math.PI / 3, 0]} geometry={coreGimbalRing2Geo} material={materials.ring2} />
        <mesh ref={ring3Ref} rotation={[0, 0, Math.PI / 4]} geometry={coreGimbalRing3Geo} material={materials.ring3} />

        {/* 上下聚能电极柱与镀金高频放电针 */}
        <mesh position={[0, 1.35, 0]} rotation={[Math.PI, 0, 0]} geometry={coreElectrodeGeo} material={matGoldAlloy} />
        <mesh position={[0, -1.35, 0]} geometry={coreElectrodeGeo} material={matGoldAlloy} />
      </group>

      {/* 3. 环绕多阶数据分片池 */}
      <group ref={shardGroupRef} position={[0, 1.48, 0]}>
        {SHARD_CONFIGS.map((shard) => (
          <group key={shard.idx} position={shard.position}>
            <mesh geometry={coreShardBoxGeo} material={shard.color === CYAN ? materials.shardCyan : materials.shardSafety} />
            <mesh position={[0, 0.22, 0]} geometry={coreShardCapGeo} material={matChromeBright} />
            <mesh position={[0, 0, 0.13]} geometry={coreShardGlowGeo} material={materials.shardGlow} />
          </group>
        ))}
      </group>

      <pointLight position={[0, 1.55, 0]} color={CYAN} intensity={7 + intensity * 14} distance={9.5} decay={2} />
      <FlowPulses start={[-1.6, 0.35, -1.6]} end={[0, 1.48, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.6, 0.35, 1.6]} end={[0, 1.48, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}

export const LitreeOverviewZone = React.memo(LitreeOverviewZoneComponent);

