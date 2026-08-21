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
  gisPillarBaseDiscGeo,
  GOLD,
  matAcrylicPurple,
  matTitaniumDark,
  PURPLE,
  SAFETY,
} from '../shared/resources';

// 03 - Litree Agent (水务数据智能体)
const agentIcosaMainGeo = new THREE.IcosahedronGeometry(0.85, 0);
const agentIcosaInnerGeo = new THREE.IcosahedronGeometry(0.52, 0);
const agentIcosaWireGeo = new THREE.IcosahedronGeometry(1.02, 1);
const agentOrbitTorusXGeo = new THREE.TorusGeometry(1.48, 0.028, 8, 56);
const agentOrbitTorusYGeo = new THREE.TorusGeometry(1.22, 0.024, 8, 48);
const agentOrbitTorusZGeo = new THREE.TorusGeometry(0.98, 0.02, 8, 40);
const agentSatelliteBodyGeo = new THREE.DodecahedronGeometry(0.22, 0);
const agentSatelliteRingGeo = new THREE.TorusGeometry(0.32, 0.02, 6, 24);
const agentPedestalSubGeo = new THREE.CylinderGeometry(0.72, 1.05, 0.22, 8);
const agentPedestalDiscGeo = new THREE.RingGeometry(0.62, 0.98, 24);
const agentGroundAuraGeo = new THREE.RingGeometry(1.35, 1.62, 36);

const SATELLITE_CONFIGS = [0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, idx) => ({
  idx,
  position: [Math.cos(angle) * 1.72, Math.sin(angle * 3) * 0.25, Math.sin(angle) * 1.72] as const,
  emissiveColor: idx % 2 === 0 ? CYAN : GOLD,
}));

// ==========================================
// 3. Litree OA 中台与 AI Agent 智能体 (Agent Zone)
// ==========================================
function LitreeAgentZoneComponent({ intensity, motionEnabled }: ExhibitVisualProps): React.JSX.Element {
  const coreRef = useRef<THREE.Group>(null);
  const orbitXRef = useRef<THREE.Mesh>(null);
  const orbitYRef = useRef<THREE.Mesh>(null);
  const orbitZRef = useRef<THREE.Mesh>(null);
  const satelliteGroupRef = useRef<THREE.Group>(null);

  const materials = useMemo(() => {
    return {
      coreInner: new THREE.MeshStandardMaterial({ color: COLOR_STEEL_DARK, metalness: 0.92, emissive: CYAN, emissiveIntensity: 1.9 * intensity }),
      coreWire: getCachedBasicMaterial(SAFETY, { wireframe: true, transparent: true, opacity: +(0.65 + intensity * 0.35).toFixed(2) }),
      pedestalDisc: getCachedBasicMaterial(PURPLE, { transparent: true, opacity: +(0.75 + intensity * 0.25).toFixed(2) }),
      groundAura: getCachedBasicMaterial(CYAN, { wireframe: true, transparent: true, opacity: +(0.35 + intensity * 0.35).toFixed(2) }),
      orbitX: getCachedBasicMaterial(PURPLE, { transparent: true, opacity: +(0.7 + intensity * 0.3).toFixed(2) }),
      orbitY: getCachedBasicMaterial(CYAN, { transparent: true, opacity: +(0.65 + intensity * 0.35).toFixed(2) }),
      orbitZ: getCachedBasicMaterial(GOLD, { transparent: true, opacity: +(0.6 + intensity * 0.4).toFixed(2) }),
      satelliteCyan: new THREE.MeshStandardMaterial({ color: COLOR_STEEL_LIGHT, metalness: 0.94, roughness: 0.14, emissive: CYAN, emissiveIntensity: 0.85 * intensity }),
      satelliteGold: new THREE.MeshStandardMaterial({ color: COLOR_STEEL_LIGHT, metalness: 0.94, roughness: 0.14, emissive: GOLD, emissiveIntensity: 0.85 * intensity }),
      satelliteRing: getCachedBasicMaterial(PURPLE, { transparent: true, opacity: 0.8 }),
    };
  }, [intensity]);

  useFrame(({ clock }, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.75 : 1;
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.75 * speedMult;
      coreRef.current.rotation.x += delta * 0.45 * speedMult;
      coreRef.current.position.y = 1.52 + Math.sin(clock.elapsedTime * 2.5) * 0.08;
    }
    if (orbitXRef.current) orbitXRef.current.rotation.x += delta * 0.95 * speedMult;
    if (orbitYRef.current) orbitYRef.current.rotation.y += delta * 1.25 * speedMult;
    if (orbitZRef.current) orbitZRef.current.rotation.z -= delta * 1.05 * speedMult;
    if (satelliteGroupRef.current) satelliteGroupRef.current.rotation.y -= delta * 0.65 * speedMult;
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={PURPLE} motionEnabled={motionEnabled} />
      <ZoneAtmosphericMotes accent={PURPLE} intensity={intensity} motionEnabled={motionEnabled} count={16} />

      {/* 1. 地面赛博能量承托底盘与全息环 */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.32, 0]} geometry={agentPedestalSubGeo} material={matTitaniumDark} />
        <mesh position={[0, 0.44, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={agentPedestalDiscGeo} material={materials.pedestalDisc} />
        <mesh position={[0, 0.028, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={agentGroundAuraGeo} material={materials.groundAura} />
      </group>

      {/* 2. 中央 ReAct AI 神经网络推理决策核心 */}
      <group position={[0, 1.52, 0]}>
        <group ref={coreRef}>
          <mesh geometry={agentIcosaMainGeo} material={matAcrylicPurple} />
          <mesh geometry={agentIcosaInnerGeo} material={materials.coreInner} />
          <mesh geometry={agentIcosaWireGeo} material={materials.coreWire} />
        </group>

        {/* 3轴陀螺仪任务编排星环 */}
        <mesh ref={orbitXRef} rotation={[0, 0, Math.PI / 4]} geometry={agentOrbitTorusXGeo} material={materials.orbitX} />
        <mesh ref={orbitYRef} rotation={[Math.PI / 3, 0, 0]} geometry={agentOrbitTorusYGeo} material={materials.orbitY} />
        <mesh ref={orbitZRef} rotation={[0, Math.PI / 4, 0]} geometry={agentOrbitTorusZGeo} material={materials.orbitZ} />
      </group>

      {/* 3. 环绕多智能体工作决策卫星 */}
      <group ref={satelliteGroupRef} position={[0, 1.52, 0]}>
        {SATELLITE_CONFIGS.map((sat) => (
          <group key={sat.idx} position={sat.position}>
            <mesh geometry={agentSatelliteBodyGeo} material={sat.emissiveColor === CYAN ? materials.satelliteCyan : materials.satelliteGold} />
            <mesh geometry={agentSatelliteRingGeo} material={materials.satelliteRing} />
          </group>
        ))}
      </group>

      <pointLight position={[0, 1.62, 0]} color={PURPLE} intensity={7 + intensity * 14} distance={9.5} decay={2} />
      <FlowPulses start={[-1.6, 0.35, -1.6]} end={[0, 1.52, 0]} color={PURPLE} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.6, 0.35, 1.6]} end={[0, 1.52, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}

export const LitreeAgentZone = React.memo(LitreeAgentZoneComponent);

