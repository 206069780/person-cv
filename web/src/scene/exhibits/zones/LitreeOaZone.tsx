import { useRef } from 'react';
import type React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import type { ExhibitVisualProps } from '../exhibit-types';
import { FlowPulses } from '../shared/FlowPulses';
import { ZoneAtmosphericMotes } from '../shared/ZoneAtmosphericMotes';
import { ZoneBase } from '../shared/ZoneBase';
import {
  COLOR_STEEL_DARK,
  COLOR_STEEL_LIGHT,
  COLOR_STEEL_MID,
  CYAN,
  GOLD,
  matChromeBright,
  matTitaniumDark,
  SIGNAL,
} from '../shared/resources';

// 04 - Litree OA / HR (独立业务中台)
const agentMiddlePlatformGeo = new THREE.BoxGeometry(0.44, 1.1, 0.44);
const agentFloatingGemGeo = new THREE.OctahedronGeometry(0.19, 0);
const oaHubCubeGeo = new THREE.BoxGeometry(0.82, 0.82, 0.82);
const oaHubInnerGeo = new THREE.BoxGeometry(0.48, 0.48, 0.48);
const oaHubWireGeo = new THREE.BoxGeometry(0.86, 0.86, 0.86);
const oaHubEdgeNeonGeo = new THREE.BoxGeometry(0.03, 0.82, 0.03);
const oaStateRingGeo = new THREE.TorusGeometry(1.1, 0.035, 8, 44);
const oaSyncBridgeGeo = new THREE.BoxGeometry(2.65, 0.09, 0.22);
const oaPedestalTopGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.05, 8);
const oaPedestalRingGeo = new THREE.RingGeometry(0.24, 0.32, 16);
const oaPillarTrimGeo = new THREE.BoxGeometry(0.03, 1.08, 0.03);
const oaPillarMidRingGeo = new THREE.TorusGeometry(0.28, 0.018, 6, 24);
const oaBeamLinkGeo = new THREE.CylinderGeometry(0.015, 0.04, 0.35, 8);

// ==========================================
// 4. Litree OA / HR 独立业务中台 (OA Zone)
// ==========================================
export function LitreeOaZone({ intensity, motionEnabled }: ExhibitVisualProps): React.JSX.Element {
  const hubRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.55 : 1;
    if (hubRef.current) hubRef.current.rotation.y += delta * 0.5 * speedMult;
    if (ringRef.current) ringRef.current.rotation.z -= delta * 0.75 * speedMult;
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={SIGNAL} motionEnabled={motionEnabled} />
      <ZoneAtmosphericMotes accent={SIGNAL} intensity={intensity} motionEnabled={motionEnabled} count={14} />

      {/* 四座业务立柱（增加四角导光条与柱脚环） */}
      {[[-1.35, -1.1], [1.35, -1.1], [-1.35, 1.1], [1.35, 1.1]].map(([x, z], idx) => (
        <group key={idx} position={[x, 0.24, z]}>
          <mesh position={[0, 0.55, 0]} castShadow geometry={agentMiddlePlatformGeo}>
            <meshStandardMaterial
              color={COLOR_STEEL_MID}
              metalness={0.94}
              roughness={0.16}
              emissive={idx % 2 === 0 ? SIGNAL : GOLD}
              emissiveIntensity={0.45 * intensity}
            />
          </mesh>
          <mesh position={[0, 1.12, 0]} geometry={oaPedestalTopGeo} material={matChromeBright} />
          {/* 柱脚发光底盘 */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={oaPedestalRingGeo}>
            <meshBasicMaterial color={idx % 2 === 0 ? SIGNAL : GOLD} toneMapped={false} transparent opacity={0.8} />
          </mesh>
          {/* 柱身发光环 */}
          <mesh position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={oaPillarMidRingGeo}>
            <meshBasicMaterial color={idx % 2 === 0 ? SIGNAL : GOLD} toneMapped={false} />
          </mesh>
          <mesh position={[0, 1.25, 0]} geometry={agentFloatingGemGeo}>
            <meshBasicMaterial color={idx % 2 === 0 ? CYAN : GOLD} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* 中央状态机枢纽 */}
      <group ref={hubRef} position={[0, 1.45, 0]}>
        <mesh geometry={oaHubCubeGeo} material={matTitaniumDark} />
        {/* 枢纽 4 角边缘发光条 */}
        {[-0.32, 0.32].flatMap((cx) => [-0.32, 0.32].map((cz) => (
          <mesh key={`hub-edge-${cx}-${cz}`} position={[cx, 0, cz]} geometry={oaHubEdgeNeonGeo}>
            <meshBasicMaterial color={SIGNAL} toneMapped={false} transparent opacity={0.75 + intensity * 0.25} />
          </mesh>
        )))}
        <mesh geometry={oaHubInnerGeo}>
          <meshStandardMaterial color={COLOR_STEEL_DARK} metalness={0.9} emissive={SIGNAL} emissiveIntensity={1.4 * intensity} />
        </mesh>
      </group>
      <mesh ref={ringRef} position={[0, 1.45, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={oaStateRingGeo}>
        <meshBasicMaterial color={GOLD} toneMapped={false} transparent opacity={0.65 + intensity * 0.35} />
      </mesh>
      <mesh position={[0, 0.68, 0]} geometry={oaSyncBridgeGeo}>
        <meshStandardMaterial color={COLOR_STEEL_LIGHT} metalness={0.92} emissive={SIGNAL} emissiveIntensity={0.4 * intensity} />
      </mesh>

      <pointLight position={[0, 1.55, 0]} color={SIGNAL} intensity={5 + intensity * 11} distance={8.5} decay={2} />
      <FlowPulses start={[-1.35, 1.15, -1.1]} end={[0, 1.45, 0]} color={SIGNAL} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.35, 1.15, 1.1]} end={[0, 1.45, 0]} color={GOLD} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}
