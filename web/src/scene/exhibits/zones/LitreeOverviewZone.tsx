import { useRef } from 'react';
import type React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import type { ExhibitVisualProps } from '../exhibit-types';
import { CyberIndustrialPillar } from '../shared/CyberIndustrialPillar';
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
  SAFETY,
} from '../shared/resources';

// 01 - Litree Overview (微服务与数据底座)
const corePillarBaseRingGeo = new THREE.RingGeometry(0.24, 0.34, 16);
const corePillarTopHaloGeo = new THREE.TorusGeometry(0.18, 0.016, 6, 24);
const coreOctaOuterGeo = new THREE.OctahedronGeometry(0.72, 0);
const coreOctaInnerGeo = new THREE.OctahedronGeometry(0.44, 0);
const coreOctaWireGeo = new THREE.OctahedronGeometry(0.88, 0);
const coreGimbalRing1Geo = new THREE.TorusGeometry(1.28, 0.028, 8, 56);
const coreGimbalRing2Geo = new THREE.TorusGeometry(1.02, 0.024, 8, 48);
const coreGimbalRing3Geo = new THREE.TorusGeometry(0.78, 0.02, 8, 40);
const coreElectrodeGeo = new THREE.CylinderGeometry(0.045, 0.12, 0.65, 8);
const coreShardBoxGeo = new THREE.BoxGeometry(0.26, 0.38, 0.22);
const coreShardCapGeo = new THREE.BoxGeometry(0.28, 0.035, 0.24);

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
      coreRef.current.position.y = 1.38 + Math.sin(clock.elapsedTime * 2.2) * 0.07;
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

      {/* 4角高耸多租户服务计算立柱（搭载双核高能立柱光效体系） */}
      {[-1, 1].flatMap((x) => [-1, 1].map((z) => (
        <CyberIndustrialPillar
          key={`${x}-${z}`}
          position={[x * 1.38, 0.24, z * 1.12]}
          accent={CYAN}
          secondaryAccent={SAFETY}
          intensity={intensity}
          motionEnabled={motionEnabled}
          height={1.95}
          withBeam={true}
        />
      )))}

      {/* 中央悬浮超导八面体晶核（Seata 事务与两级缓存协调中枢） */}
      <group position={[0, 1.38, 0]}>
        <group ref={coreRef}>
          {/* 外壳半透明折射晶体 */}
          <mesh geometry={coreOctaOuterGeo} material={matAcrylicCyan} />
          {/* 内部高亮自旋发光内胆 */}
          <mesh geometry={coreOctaInnerGeo}>
            <meshStandardMaterial color={COLOR_STEEL_DARK} metalness={0.9} emissive={CYAN} emissiveIntensity={1.8 * intensity} />
          </mesh>
          {/* 外部线框网格 */}
          <mesh geometry={coreOctaWireGeo}>
            <meshBasicMaterial color={SAFETY} wireframe toneMapped={false} transparent opacity={0.6 + intensity * 0.4} />
          </mesh>
        </group>

        {/* 3层嵌套双轴陀螺万向环 */}
        <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]} geometry={coreGimbalRing1Geo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.65 + intensity * 0.35} />
        </mesh>
        <mesh ref={ring2Ref} rotation={[0, Math.PI / 3, 0]} geometry={coreGimbalRing2Geo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} transparent opacity={0.6 + intensity * 0.4} />
        </mesh>
        <mesh ref={ring3Ref} rotation={[0, 0, Math.PI / 4]} geometry={coreGimbalRing3Geo}>
          <meshBasicMaterial color={GOLD} toneMapped={false} transparent opacity={0.55 + intensity * 0.45} />
        </mesh>

        {/* 上下聚能电极柱与镀金高频放电针 */}
        <mesh position={[0, 1.18, 0]} rotation={[Math.PI, 0, 0]} geometry={coreElectrodeGeo} material={matGoldAlloy} />
        <mesh position={[0, -1.18, 0]} geometry={coreElectrodeGeo} material={matGoldAlloy} />
      </group>

      {/* 环绕多阶数据分片池（Sharding 分库分表数据切片） */}
      <group ref={shardGroupRef} position={[0, 1.38, 0]}>
        {[0, 1, 2, 3, 4, 5].map((idx) => {
          const angle = (idx / 6) * Math.PI * 2;
          return (
            <group key={idx} position={[Math.cos(angle) * 1.82, Math.sin(angle * 3) * 0.24, Math.sin(angle) * 1.82]}>
              <mesh geometry={coreShardBoxGeo}>
                <meshStandardMaterial
                  color={COLOR_STEEL_LIGHT}
                  metalness={0.94}
                  roughness={0.12}
                  emissive={idx % 2 === 0 ? CYAN : SAFETY}
                  emissiveIntensity={0.55 * intensity}
                />
              </mesh>
              <mesh position={[0, 0.2, 0]} geometry={coreShardCapGeo} material={matChromeBright} />
              <mesh position={[0, 0, 0.12]}>
                <boxGeometry args={[0.2, 0.04, 0.02]} />
                <meshBasicMaterial color={CYAN} toneMapped={false} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 常驻科技展台局部点光源（即使漫游时也能立体照亮 4 根黑色立柱） */}
      <pointLight position={[0, 1.45, 0]} color={CYAN} intensity={6 + intensity * 12} distance={9} decay={2} />
      <FlowPulses start={[-1.38, 1.95, -1.12]} end={[0, 1.38, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.38, 1.95, 1.12]} end={[0, 1.38, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}
