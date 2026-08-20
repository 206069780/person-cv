import { useRef } from 'react';
import type React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import type { ExhibitVisualProps } from '../exhibit-types';
import { FlowPulses } from '../shared/FlowPulses';
import { ZoneAtmosphericMotes } from '../shared/ZoneAtmosphericMotes';
import { ZoneBase } from '../shared/ZoneBase';
import {
  COLOR_STEEL_LIGHT,
  COLOR_STEEL_MID,
  CYAN,
  matChromeBright,
  matSteelLight,
  SAFETY,
  SIGNAL,
} from '../shared/resources';

// 08 - Senge Platform (0-1 平台架构与容器化)
const platformK8sPodGeo = new THREE.BoxGeometry(0.98, 0.48, 0.82);
const platformPodFrameOuterGeo = new THREE.BoxGeometry(1.02, 0.06, 0.86);
const platformPodCornerTrimGeo = new THREE.BoxGeometry(0.03, 0.48, 0.03);
const platformPipeMainGeo = new THREE.CylinderGeometry(0.095, 0.095, 2.35, 16);
const platformPipeFlangeGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.07, 16);
const platformPipeSealRingGeo = new THREE.TorusGeometry(0.152, 0.015, 6, 24);
const platformValveWheelGeo = new THREE.TorusGeometry(0.19, 0.042, 8, 24);
const platformDualRing1Geo = new THREE.TorusGeometry(1.65, 0.032, 8, 56);
const platformDualRing2Geo = new THREE.TorusGeometry(1.42, 0.026, 8, 48);
const platformTelemetryScreenGeo = new THREE.PlaneGeometry(0.68, 0.44);

// ==========================================
// 8. 森格智慧水务平台 0-1 架构底座与容器化交付 (Platform Zone)
// ==========================================
export function SengePlatformZone({ intensity, motionEnabled }: ExhibitVisualProps): React.JSX.Element {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const valveRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.65 : 1;
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.55 * speedMult;
    if (ring2Ref.current) ring2Ref.current.rotation.z -= delta * 0.75 * speedMult;
    if (valveRef.current) valveRef.current.rotation.z -= delta * 1.45 * speedMult;
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={SIGNAL} motionEnabled={motionEnabled} />
      <ZoneAtmosphericMotes accent={SIGNAL} intensity={intensity} motionEnabled={motionEnabled} count={16} />

      {/* 3层阶梯式云原生容器 Pod 集群模块（设备中台 / 告警引擎 / 运维中枢 + 发光边框与机柜底圈） */}
      {[
        [-0.85, 0.35, -0.42, COLOR_STEEL_MID],
        [0.85, 0.35, -0.42, '#182730'],
        [0, 0.88, 0.42, COLOR_STEEL_LIGHT],
      ].map(([x, y, z, color], idx) => (
        <group key={idx} position={[x as number, y as number, z as number]}>
          <mesh castShadow geometry={platformK8sPodGeo}>
            <meshStandardMaterial color={color as string} metalness={0.94} roughness={0.16} emissive={SIGNAL} emissiveIntensity={0.32 * intensity} />
          </mesh>
          <mesh position={[0, 0.25, 0]} geometry={platformPodFrameOuterGeo}>
            <meshBasicMaterial color={idx === 2 ? SAFETY : SIGNAL} toneMapped={false} transparent opacity={0.75 + intensity * 0.25} />
          </mesh>
          {/* Pod 模块底部发光轮廓 */}
          <mesh position={[0, -0.23, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.92, 0.62]} />
            <meshBasicMaterial color={SIGNAL} toneMapped={false} transparent opacity={0.5} />
          </mesh>
        </group>
      ))}

      {/* 工业流体管路、法兰与旋转控制阀门总成 */}
      <group position={[0, 0.52, -0.9]}>
        <mesh rotation={[0, 0, Math.PI / 2]} geometry={platformPipeMainGeo} material={matChromeBright} />
        {[-0.65, 0.65].map((px) => (
          <mesh key={px} position={[px, 0, 0]} rotation={[0, 0, Math.PI / 2]} geometry={platformPipeFlangeGeo} material={matSteelLight} />
        ))}
        <mesh ref={valveRef} position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} geometry={platformValveWheelGeo}>
          <meshStandardMaterial color={SAFETY} metalness={0.92} emissive={SAFETY} emissiveIntensity={0.65 * intensity} />
        </mesh>
      </group>

      {/* 顶部服务网格双交错旋转负载均衡光环 */}
      <group position={[0, 1.68, 0]}>
        <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]} geometry={platformDualRing1Geo}>
          <meshBasicMaterial color={SIGNAL} wireframe toneMapped={false} transparent opacity={0.55 + intensity * 0.45} />
        </mesh>
        <mesh ref={ring2Ref} rotation={[Math.PI / 2.2, 0.3, 0]} geometry={platformDualRing2Geo}>
          <meshBasicMaterial color={CYAN} wireframe toneMapped={false} transparent opacity={0.45 + intensity * 0.45} />
        </mesh>
      </group>

      {/* 双向全息遥测态势监控看板 */}
      {[-0.98, 0.98].map((x, idx) => (
        <mesh key={idx} position={[x, 1.35, 0.78]} rotation={[-0.2, idx === 0 ? 0.35 : -0.35, 0]} geometry={platformTelemetryScreenGeo}>
          <meshBasicMaterial color={CYAN} wireframe toneMapped={false} transparent opacity={0.55 + intensity * 0.45} />
        </mesh>
      ))}

      <pointLight position={[0, 1.72, 0]} color={SIGNAL} intensity={5 + intensity * 11} distance={9} decay={2} />
      <FlowPulses start={[-1.45, 0.52, -0.9]} end={[1.45, 0.52, -0.9]} color={SIGNAL} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[0, 1.0, 0.42]} end={[0, 1.68, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}
