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
  CYAN,
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
const corePedestalSubGeo = new THREE.CylinderGeometry(0.72, 1.05, 0.22, 8);
const corePedestalDiscGeo = new THREE.RingGeometry(0.62, 0.98, 24);
const coreGroundAuraGeo = new THREE.RingGeometry(1.35, 1.62, 36);

// ==========================================
// 1. Litree 架构底座与微服务治理 (Core Zone)
// ==========================================
export function LitreeOverviewZone({ intensity, motionEnabled }: ExhibitVisualProps): React.JSX.Element {
  const coreRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const shardGroupRef = useRef<THREE.Group>(null);

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

      {/* 1. 地面流线型能量承托底盘与全息环（完全移除 4 角立柱遮挡） */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.32, 0]} geometry={corePedestalSubGeo} material={matTitaniumDark} />
        <mesh position={[0, 0.44, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={corePedestalDiscGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.75 + intensity * 0.25} />
        </mesh>
        <mesh position={[0, 0.028, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={coreGroundAuraGeo}>
          <meshBasicMaterial color={SAFETY} wireframe toneMapped={false} transparent opacity={0.35 + intensity * 0.35} />
        </mesh>
      </group>

      {/* 2. 中央核心微服务与 Seata 事务八面体晶核（主视觉焦点，开阔震撼） */}
      <group position={[0, 1.48, 0]}>
        <group ref={coreRef}>
          {/* 外壳半透明折射晶体 */}
          <mesh geometry={coreOctaOuterGeo} material={matAcrylicCyan} />
          {/* 内部高亮自旋发光内胆 */}
          <mesh geometry={coreOctaInnerGeo}>
            <meshStandardMaterial color={COLOR_STEEL_DARK} metalness={0.9} emissive={CYAN} emissiveIntensity={1.9 * intensity} />
          </mesh>
          {/* 外部线框网格 */}
          <mesh geometry={coreOctaWireGeo}>
            <meshBasicMaterial color={SAFETY} wireframe toneMapped={false} transparent opacity={0.65 + intensity * 0.35} />
          </mesh>
        </group>

        {/* 3层嵌套双轴陀螺万向环 */}
        <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]} geometry={coreGimbalRing1Geo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.7 + intensity * 0.3} />
        </mesh>
        <mesh ref={ring2Ref} rotation={[0, Math.PI / 3, 0]} geometry={coreGimbalRing2Geo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} transparent opacity={0.65 + intensity * 0.35} />
        </mesh>
        <mesh ref={ring3Ref} rotation={[0, 0, Math.PI / 4]} geometry={coreGimbalRing3Geo}>
          <meshBasicMaterial color={GOLD} toneMapped={false} transparent opacity={0.6 + intensity * 0.4} />
        </mesh>

        {/* 上下聚能电极柱与镀金高频放电针 */}
        <mesh position={[0, 1.35, 0]} rotation={[Math.PI, 0, 0]} geometry={coreElectrodeGeo} material={matGoldAlloy} />
        <mesh position={[0, -1.35, 0]} geometry={coreElectrodeGeo} material={matGoldAlloy} />
      </group>

      {/* 3. 环绕多阶数据分片池（Sharding 分库分表数据切片，开阔轨道巡航） */}
      <group ref={shardGroupRef} position={[0, 1.48, 0]}>
        {[0, 1, 2, 3, 4, 5].map((idx) => {
          const angle = (idx / 6) * Math.PI * 2;
          return (
            <group key={idx} position={[Math.cos(angle) * 1.75, Math.sin(angle * 3) * 0.22, Math.sin(angle) * 1.75]}>
              <mesh geometry={coreShardBoxGeo}>
                <meshStandardMaterial
                  color={COLOR_STEEL_LIGHT}
                  metalness={0.94}
                  roughness={0.12}
                  emissive={idx % 2 === 0 ? CYAN : SAFETY}
                  emissiveIntensity={0.65 * intensity}
                />
              </mesh>
              <mesh position={[0, 0.22, 0]} geometry={coreShardCapGeo} material={matChromeBright} />
              <mesh position={[0, 0, 0.13]}>
                <boxGeometry args={[0.22, 0.045, 0.02]} />
                <meshBasicMaterial color={CYAN} toneMapped={false} />
              </mesh>
            </group>
          );
        })}
      </group>

      <pointLight position={[0, 1.55, 0]} color={CYAN} intensity={7 + intensity * 14} distance={9.5} decay={2} />
      <FlowPulses start={[-1.6, 0.35, -1.6]} end={[0, 1.48, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.6, 0.35, 1.6]} end={[0, 1.48, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}
