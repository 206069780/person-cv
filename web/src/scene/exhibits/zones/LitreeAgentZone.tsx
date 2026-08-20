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
  gisPillarBaseDiscGeo,
  GOLD,
  matAcrylicPurple,
  matTitaniumDark,
  PURPLE,
  SAFETY,
} from '../shared/resources';

// 03 - Litree Agent (水务数据智能体)
const agentIcosaMainGeo = new THREE.IcosahedronGeometry(0.68, 0);
const agentIcosaInnerGeo = new THREE.IcosahedronGeometry(0.4, 0);
const agentIcosaWireGeo = new THREE.IcosahedronGeometry(0.86, 1);
const agentOrbitTorusXGeo = new THREE.TorusGeometry(1.42, 0.025, 8, 56);
const agentOrbitTorusYGeo = new THREE.TorusGeometry(1.18, 0.022, 8, 48);
const agentOrbitTorusZGeo = new THREE.TorusGeometry(0.96, 0.019, 8, 40);
const agentSatelliteBodyGeo = new THREE.DodecahedronGeometry(0.19, 0);
const agentSatelliteRingGeo = new THREE.TorusGeometry(0.28, 0.018, 6, 24);
const agentEmitterPillarGeo = new THREE.CylinderGeometry(0.06, 0.1, 0.85, 8);
const agentEmitterBeamGeo = new THREE.CylinderGeometry(0.01, 0.1, 1.45, 8, 1, true);
const agentEmitterRingGeo = new THREE.TorusGeometry(0.12, 0.016, 6, 20);

// ==========================================
// 3. Litree OA 中台与 AI Agent 智能体 (Agent Zone)
// ==========================================
export function LitreeAgentZone({ intensity, motionEnabled }: ExhibitVisualProps): React.JSX.Element {
  const coreRef = useRef<THREE.Group>(null);
  const orbitXRef = useRef<THREE.Mesh>(null);
  const orbitYRef = useRef<THREE.Mesh>(null);
  const orbitZRef = useRef<THREE.Mesh>(null);
  const satelliteGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.75 : 1;
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.75 * speedMult;
      coreRef.current.rotation.x += delta * 0.45 * speedMult;
      coreRef.current.position.y = 1.55 + Math.sin(clock.elapsedTime * 2.5) * 0.09;
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

      {/* 4 座全息投射发射立柱（提供柱体灯效与向上能量投射） */}
      {[-1.35, 1.35].flatMap((px) => [-1.35, 1.35].map((pz) => (
        <group key={`emitter-${px}-${pz}`} position={[px, 0.24, pz]}>
          <mesh position={[0, 0.42, 0]} geometry={agentEmitterPillarGeo} material={matTitaniumDark} />
          {/* 柱身双发光环 */}
          <mesh position={[0, 0.65, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={agentEmitterRingGeo}>
            <meshBasicMaterial color={PURPLE} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={agentEmitterRingGeo}>
            <meshBasicMaterial color={CYAN} toneMapped={false} />
          </mesh>
          {/* 柱脚能量光环 */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={gisPillarBaseDiscGeo}>
            <meshBasicMaterial color={PURPLE} toneMapped={false} transparent opacity={0.7} />
          </mesh>
          {/* 柱顶向上投射微光锥 */}
          <mesh position={[0, 1.55, 0]} geometry={agentEmitterBeamGeo}>
            <meshBasicMaterial color={PURPLE} toneMapped={false} transparent opacity={0.3 + intensity * 0.3} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </group>
      )))}

      {/* 中央 ReAct AI 神经网络推理决策核心 */}
      <group position={[0, 1.55, 0]}>
        <group ref={coreRef}>
          {/* 正二十面体外骨骼 */}
          <mesh geometry={agentIcosaMainGeo} material={matAcrylicPurple} />
          <mesh geometry={agentIcosaInnerGeo}>
            <meshStandardMaterial color={COLOR_STEEL_DARK} metalness={0.92} emissive={CYAN} emissiveIntensity={1.8 * intensity} />
          </mesh>
          {/* 线框思维链 */}
          <mesh geometry={agentIcosaWireGeo}>
            <meshBasicMaterial color={SAFETY} wireframe toneMapped={false} transparent opacity={0.65 + intensity * 0.35} />
          </mesh>
        </group>

        {/* 3轴陀螺仪任务编排星环 */}
        <mesh ref={orbitXRef} rotation={[0, 0, Math.PI / 4]} geometry={agentOrbitTorusXGeo}>
          <meshBasicMaterial color={PURPLE} toneMapped={false} transparent opacity={0.7 + intensity * 0.3} />
        </mesh>
        <mesh ref={orbitYRef} rotation={[Math.PI / 3, 0, 0]} geometry={agentOrbitTorusYGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.65 + intensity * 0.35} />
        </mesh>
        <mesh ref={orbitZRef} rotation={[0, Math.PI / 4, 0]} geometry={agentOrbitTorusZGeo}>
          <meshBasicMaterial color={GOLD} toneMapped={false} transparent opacity={0.6 + intensity * 0.4} />
        </mesh>
      </group>

      {/* 环绕多智能体工作决策卫星（Tool Calling: DB / 工单 / Docker 沙箱 / IM 消息） */}
      <group ref={satelliteGroupRef} position={[0, 1.55, 0]}>
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, idx) => (
          <group key={idx} position={[Math.cos(angle) * 1.8, Math.sin(angle * 3) * 0.35, Math.sin(angle) * 1.8]}>
            <mesh geometry={agentSatelliteBodyGeo}>
              <meshStandardMaterial
                color={COLOR_STEEL_LIGHT}
                metalness={0.94}
                roughness={0.14}
                emissive={idx % 2 === 0 ? CYAN : GOLD}
                emissiveIntensity={0.85 * intensity}
              />
            </mesh>
            <mesh geometry={agentSatelliteRingGeo}>
              <meshBasicMaterial color={PURPLE} toneMapped={false} transparent opacity={0.8} />
            </mesh>
          </group>
        ))}
      </group>

      <pointLight position={[0, 1.65, 0]} color={PURPLE} intensity={6 + intensity * 12} distance={9.5} decay={2} />
      <FlowPulses start={[-1.35, 1.15, -1.1]} end={[0, 1.55, 0]} color={PURPLE} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.35, 1.15, 1.1]} end={[0, 1.55, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}
