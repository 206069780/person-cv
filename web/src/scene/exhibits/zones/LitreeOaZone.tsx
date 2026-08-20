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
const oaHubMainBoxGeo = new THREE.BoxGeometry(1.08, 1.08, 1.08);
const oaHubInnerCoreGeo = new THREE.BoxGeometry(0.68, 0.68, 0.68);
const oaHubWireframeGeo = new THREE.BoxGeometry(1.16, 1.16, 1.16);
const oaHubEdgeNeonGeo = new THREE.BoxGeometry(0.04, 1.08, 0.04);
const oaStateRing1Geo = new THREE.TorusGeometry(1.22, 0.032, 8, 48);
const oaStateRing2Geo = new THREE.TorusGeometry(0.98, 0.024, 8, 40);
const oaDataPortNodeGeo = new THREE.OctahedronGeometry(0.18, 0);
const oaHubSubPlinthGeo = new THREE.CylinderGeometry(0.68, 0.95, 0.22, 8);
const oaHubSocketDiscGeo = new THREE.RingGeometry(0.55, 0.88, 24);
const oaHubGroundAuraGeo = new THREE.RingGeometry(1.15, 1.35, 32);

// ==========================================
// 4. Litree OA / HR 独立业务中台 (OA Zone)
// ==========================================
export function LitreeOaZone({ intensity, motionEnabled }: ExhibitVisualProps): React.JSX.Element {
  const hubRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.55 : 1;
    if (hubRef.current) hubRef.current.rotation.y += delta * 0.45 * speedMult;
    if (ring1Ref.current) ring1Ref.current.rotation.z -= delta * 0.65 * speedMult;
    if (ring2Ref.current) ring2Ref.current.rotation.x += delta * 0.55 * speedMult;
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={SIGNAL} motionEnabled={motionEnabled} />
      <ZoneAtmosphericMotes accent={SIGNAL} intensity={intensity} motionEnabled={motionEnabled} count={16} />

      {/* 1. 地表极简流线型能量承托底盘与脉冲光环 */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.32, 0]} geometry={oaHubSubPlinthGeo} material={matTitaniumDark} />
        <mesh position={[0, 0.44, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={oaHubSocketDiscGeo}>
          <meshBasicMaterial color={SIGNAL} toneMapped={false} transparent opacity={0.75 + intensity * 0.25} />
        </mesh>
        <mesh position={[0, 0.028, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={oaHubGroundAuraGeo}>
          <meshBasicMaterial color={GOLD} wireframe toneMapped={false} transparent opacity={0.35 + intensity * 0.35} />
        </mesh>
      </group>

      {/* 2. 中央核心状态机中枢模型（主视觉焦点，开阔无遮挡） */}
      <group ref={hubRef} position={[0, 1.48, 0]}>
        {/* 外层钛合金机体 */}
        <mesh geometry={oaHubMainBoxGeo} material={matTitaniumDark} />
        {/* 外层霓虹边线加强 */}
        {[-0.45, 0.45].flatMap((cx) => [-0.45, 0.45].map((cz) => (
          <mesh key={`hub-edge-${cx}-${cz}`} position={[cx, 0, cz]} geometry={oaHubEdgeNeonGeo}>
            <meshBasicMaterial color={SIGNAL} toneMapped={false} transparent opacity={0.85 + intensity * 0.15} />
          </mesh>
        )))}
        {/* 外层全息线框 */}
        <mesh geometry={oaHubWireframeGeo}>
          <meshBasicMaterial color={SIGNAL} wireframe toneMapped={false} transparent opacity={0.55 + intensity * 0.45} />
        </mesh>
        {/* 内部高亮发光内胆（状态机规则引擎） */}
        <mesh geometry={oaHubInnerCoreGeo}>
          <meshStandardMaterial color={COLOR_STEEL_DARK} metalness={0.9} emissive={SIGNAL} emissiveIntensity={1.6 * intensity} />
        </mesh>
        {/* 四向数据交互节点晶体（考勤 / 绩效 / 组织 / 认证） */}
        {[
          [0.68, 0, 0],
          [-0.68, 0, 0],
          [0, 0, 0.68],
          [0, 0, -0.68],
        ].map(([px, py, pz], pIdx) => (
          <mesh key={pIdx} position={[px, py, pz]} geometry={oaDataPortNodeGeo}>
            <meshBasicMaterial color={pIdx % 2 === 0 ? GOLD : CYAN} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* 3. 双层状态流转与权限联动星环 */}
      <group position={[0, 1.48, 0]}>
        <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]} geometry={oaStateRing1Geo}>
          <meshBasicMaterial color={GOLD} toneMapped={false} transparent opacity={0.7 + intensity * 0.3} />
        </mesh>
        <mesh ref={ring2Ref} rotation={[Math.PI / 3, Math.PI / 4, 0]} geometry={oaStateRing2Geo}>
          <meshBasicMaterial color={SIGNAL} toneMapped={false} transparent opacity={0.65 + intensity * 0.35} />
        </mesh>
      </group>

      <pointLight position={[0, 1.55, 0]} color={SIGNAL} intensity={7 + intensity * 14} distance={9} decay={2} />
      <FlowPulses start={[-1.4, 0.35, -1.4]} end={[0, 1.48, 0]} color={SIGNAL} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.4, 0.35, 1.4]} end={[0, 1.48, 0]} color={GOLD} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}
