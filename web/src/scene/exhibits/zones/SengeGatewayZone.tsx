import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import type { ExhibitVisualProps } from '../exhibit-types';
import { FlowPulses } from '../shared/FlowPulses';
import { ZoneAtmosphericMotes } from '../shared/ZoneAtmosphericMotes';
import { ZoneBase } from '../shared/ZoneBase';
import {
  COLOR_STEEL_DARK,
  COLOR_STEEL_MID,
  CYAN,
  getCachedBasicMaterial,
  matChromeBright,
  matSteelLight,
  matTitaniumDark,
  SAFETY,
} from '../shared/resources';

// 07 - Senge Gateway (实时通信网关与告警风暴)
const gatewayTowerPillarGeo = new THREE.CylinderGeometry(0.1, 0.24, 2.55, 16);
const gatewayTrussCrossGeo = new THREE.BoxGeometry(1.55, 0.055, 0.055);
const gatewayTrussDiagGeo = new THREE.BoxGeometry(0.85, 0.04, 0.04);
const gatewayTowerVerticalStripGeo = new THREE.BoxGeometry(0.025, 2.52, 0.025);
const gatewayTowerGlowRingGeo = new THREE.TorusGeometry(0.22, 0.016, 6, 32);
const gatewayMicrowaveDishGeo = new THREE.ConeGeometry(0.26, 0.16, 14);
const gatewayLightningRodGeo = new THREE.CylinderGeometry(0.018, 0.045, 0.72, 8);
const gatewayPulseWaveTorusGeo = new THREE.TorusGeometry(1.55, 0.034, 6, 48);
const gatewayComputePodGeo = new THREE.BoxGeometry(0.3, 0.44, 0.3);
const gatewayPodCapGeo = new THREE.BoxGeometry(0.24, 0.05, 0.24);

const GATEWAY_POD_CONFIGS = [0, 1, 2, 3, 4, 5].map((idx) => {
  const angle = (idx / 6) * Math.PI * 2;
  return {
    idx,
    position: [Math.cos(angle) * 1.35, 0.24, Math.sin(angle) * 1.35] as const,
    emissiveColor: idx % 2 === 0 ? SAFETY : CYAN,
  };
});

const GATEWAY_STRIP_CONFIGS: readonly [number, number, number, number][] = [
  [0, 1.3, 0.205, 0],
  [0, 1.3, -0.205, 0],
  [0.205, 1.3, 0, Math.PI / 2],
  [-0.205, 1.3, 0, Math.PI / 2],
];

// ==========================================
// 7. 森格实时通信网关与告警风暴治理 (Gateway Zone)
// ==========================================
function SengeGatewayZoneComponent({ intensity, motionEnabled }: ExhibitVisualProps): React.JSX.Element {
  const wavesRef = useRef<THREE.Group>(null);
  const dishGroupRef = useRef<THREE.Group>(null);

  const materials = useMemo(() => {
    return {
      podSafety: new THREE.MeshStandardMaterial({ color: COLOR_STEEL_MID, metalness: 0.94, roughness: 0.16, emissive: SAFETY, emissiveIntensity: 0.4 * intensity }),
      podCyan: new THREE.MeshStandardMaterial({ color: COLOR_STEEL_MID, metalness: 0.94, roughness: 0.16, emissive: CYAN, emissiveIntensity: 0.4 * intensity }),
      dish: new THREE.MeshStandardMaterial({ color: COLOR_STEEL_DARK, metalness: 0.92, emissive: SAFETY, emissiveIntensity: 0.75 * intensity }),
      strip: getCachedBasicMaterial(SAFETY, { transparent: true, opacity: +(0.85 + intensity * 0.15).toFixed(2) }),
      cap: getCachedBasicMaterial(SAFETY),
      glowCyan: getCachedBasicMaterial(CYAN),
      glowSafety: getCachedBasicMaterial(SAFETY),
      waveMat0: getCachedBasicMaterial(SAFETY, { transparent: true, opacity: 0.7 }),
      waveMat1: getCachedBasicMaterial(SAFETY, { transparent: true, opacity: 0.7 }),
      waveMat2: getCachedBasicMaterial(SAFETY, { transparent: true, opacity: 0.7 }),
    };
  }, [intensity]);

  useFrame(({ clock }, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.85 : 1;
    if (dishGroupRef.current) dishGroupRef.current.rotation.y += delta * 0.85 * speedMult;
    if (wavesRef.current) {
      wavesRef.current.children.forEach((child, idx) => {
        const time = clock.elapsedTime * 2.1 + idx * 1.15;
        const scale = 0.5 + (time % 2.6) * 0.88;
        child.scale.set(scale, scale, scale);
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (mat) mat.opacity = Math.max(0, 0.78 - scale * 0.27) * intensity;
      });
    }
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={SAFETY} motionEnabled={motionEnabled} />
      <ZoneAtmosphericMotes accent={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={16} />

      {/* Netty 高并发通信矩阵底座节点 */}
      {GATEWAY_POD_CONFIGS.map((pod) => (
        <group key={pod.idx} position={pod.position}>
          <mesh position={[0, 0.24, 0]} geometry={gatewayComputePodGeo} material={pod.emissiveColor === SAFETY ? materials.podSafety : materials.podCyan} />
          <mesh position={[0, 0.47, 0]} geometry={gatewayPodCapGeo} material={materials.cap} />
        </group>
      ))}

      {/* 中央通信重型铁塔与微波天线阵列 */}
      <group position={[0, 0.24, 0]}>
        <mesh position={[0, 1.3, 0]} castShadow geometry={gatewayTowerPillarGeo} material={matTitaniumDark} />

        {/* 塔身 4 面垂直高亮激光导光条 */}
        {GATEWAY_STRIP_CONFIGS.map(([gx, gy, gz, rot], gIdx) => (
          <mesh key={gIdx} position={[gx, gy, gz]} rotation={[0, rot, 0]} geometry={gatewayTowerVerticalStripGeo} material={materials.strip} />
        ))}

        {/* 塔腰环绕霓虹光圈 */}
        {[0.6, 1.3, 2.0].map((ry, idx) => (
          <mesh key={idx} position={[0, ry, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={gatewayTowerGlowRingGeo} material={idx % 2 === 0 ? materials.glowSafety : materials.glowCyan} />
        ))}

        {/* 桁架十字交叉横担与对角斜撑 */}
        {[0.95, 1.58, 2.15].map((y, tIdx) => (
          <group key={tIdx} position={[0, y, 0]}>
            <mesh geometry={gatewayTrussCrossGeo} material={matSteelLight} />
            <mesh rotation={[0, Math.PI / 2, 0]} geometry={gatewayTrussCrossGeo} material={matSteelLight} />
            <mesh rotation={[0, 0, Math.PI / 4]} geometry={gatewayTrussDiagGeo} material={matChromeBright} />
            <mesh rotation={[0, 0, -Math.PI / 4]} geometry={gatewayTrussDiagGeo} material={matChromeBright} />
          </group>
        ))}

        {/* 塔顶 4 向微波天线 */}
        <group ref={dishGroupRef} position={[0, 2.48, 0]}>
          {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, idx) => (
            <mesh key={idx} position={[Math.cos(angle) * 0.42, 0, Math.sin(angle) * 0.42]} rotation={[0, -angle + Math.PI / 2, Math.PI / 4]} geometry={gatewayMicrowaveDishGeo} material={materials.dish} />
          ))}
          <mesh position={[0, 0.42, 0]} geometry={gatewayLightningRodGeo} material={matChromeBright} />
        </group>
      </group>

      {/* 电磁波辐射扩散环 */}
      <group ref={wavesRef} position={[0, 2.48, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh geometry={gatewayPulseWaveTorusGeo} material={materials.waveMat0} />
        <mesh geometry={gatewayPulseWaveTorusGeo} material={materials.waveMat1} />
        <mesh geometry={gatewayPulseWaveTorusGeo} material={materials.waveMat2} />
      </group>

      <pointLight position={[0, 2.55, 0]} color={SAFETY} intensity={6 + intensity * 12} distance={9} decay={2} />
      <FlowPulses start={[-1.45, 0.45, 0]} end={[0, 2.48, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.45, 0.45, 0]} end={[0, 2.48, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}

export const SengeGatewayZone = React.memo(SengeGatewayZoneComponent);

