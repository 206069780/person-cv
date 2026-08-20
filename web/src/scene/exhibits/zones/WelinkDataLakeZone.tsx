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
  CYAN,
  matAcrylicCyan,
  matAcrylicOrange,
  matChromeBright,
  matGoldAlloy,
  matTitaniumDark,
  SAFETY,
} from '../shared/resources';

// 06 - WeLink Data Lake (双路数据湖)
const lakeReactorTubeGeo = new THREE.CylinderGeometry(0.52, 0.52, 2.05, 24);
const lakeInnerPlasmaGeo = new THREE.CylinderGeometry(0.38, 0.38, 1.85, 16);
const lakeHelixCoilGeo = new THREE.TorusGeometry(0.42, 0.032, 6, 32);
const lakeCapHeavyGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.18, 24);
const lakeCapRingGeo = new THREE.TorusGeometry(0.58, 0.025, 6, 24);
const lakeReactorBaseRingGeo = new THREE.RingGeometry(0.48, 0.62, 24);
const lakeReactorPillarRailGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.1, 8);
const lakeBridgeTrussGeo = new THREE.BoxGeometry(1.42, 0.22, 0.36);
const lakeBridgeRailGeo = new THREE.BoxGeometry(1.44, 0.03, 0.03);
const lakeAcidPrismGeo = new THREE.OctahedronGeometry(0.3, 0);
const lakeFlowRingGeo = new THREE.TorusGeometry(0.75, 0.028, 8, 36);

// ==========================================
// 6. WeLink 双路数据湖管道与版本一致性治理 (Lake Zone)
// ==========================================
export function WelinkDataLakeZone({ intensity, motionEnabled }: ExhibitVisualProps): React.JSX.Element {
  const helixLeftRef = useRef<THREE.Group>(null);
  const helixRightRef = useRef<THREE.Group>(null);
  const crystalRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.75 : 1;
    if (helixLeftRef.current) helixLeftRef.current.rotation.y += delta * 1.9 * speedMult;
    if (helixRightRef.current) helixRightRef.current.rotation.y -= delta * 1.6 * speedMult;
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.95 * speedMult;
      crystalRef.current.rotation.x += delta * 0.55 * speedMult;
    }
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={CYAN} motionEnabled={motionEnabled} />
      <ZoneAtmosphericMotes accent={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={16} />

      {/* 左柱：Flink 实时流式管道反应柱（透明防护管 + 内部双螺旋 + 柱底光晕环 + 顶部高亮环） */}
      <group position={[-1.05, 0.24, 0]}>
        <mesh position={[0, 1.05, 0]} castShadow geometry={lakeReactorTubeGeo} material={matAcrylicCyan} />
        <mesh position={[0, 1.05, 0]} geometry={lakeInnerPlasmaGeo}>
          <meshStandardMaterial color={COLOR_STEEL_DARK} metalness={0.9} emissive={CYAN} emissiveIntensity={0.95 * intensity} />
        </mesh>
        {/* 柱脚地表发光环 */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={lakeReactorBaseRingGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.8} />
        </mesh>
        {/* 内部旋转流动线圈 */}
        <group ref={helixLeftRef} position={[0, 1.05, 0]}>
          {[-0.65, -0.22, 0.22, 0.65].map((y, cIdx) => (
            <mesh key={cIdx} position={[0, y, 0]} geometry={lakeHelixCoilGeo}>
              <meshBasicMaterial color={CYAN} wireframe toneMapped={false} transparent opacity={0.75 + intensity * 0.25} />
            </mesh>
          ))}
        </group>
        <mesh position={[0, 2.12, 0]} geometry={lakeCapHeavyGeo} material={matChromeBright} />
        <mesh position={[0, 2.22, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={lakeCapRingGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} />
        </mesh>
        <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={lakeFlowRingGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} />
        </mesh>
      </group>

      {/* 右柱：Spark 批处理离线计算反应柱（活力橙双螺旋 + 柱底光晕环） */}
      <group position={[1.05, 0.24, 0]}>
        <mesh position={[0, 1.05, 0]} castShadow geometry={lakeReactorTubeGeo} material={matAcrylicOrange} />
        <mesh position={[0, 1.05, 0]} geometry={lakeInnerPlasmaGeo}>
          <meshStandardMaterial color={COLOR_STEEL_DARK} metalness={0.9} emissive={SAFETY} emissiveIntensity={0.95 * intensity} />
        </mesh>
        {/* 柱脚地表发光环 */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={lakeReactorBaseRingGeo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} transparent opacity={0.8} />
        </mesh>
        <group ref={helixRightRef} position={[0, 1.05, 0]}>
          {[-0.65, -0.22, 0.22, 0.65].map((y, cIdx) => (
            <mesh key={cIdx} position={[0, y, 0]} geometry={lakeHelixCoilGeo}>
              <meshBasicMaterial color={SAFETY} wireframe toneMapped={false} transparent opacity={0.75 + intensity * 0.25} />
            </mesh>
          ))}
        </group>
        <mesh position={[0, 2.12, 0]} geometry={lakeCapHeavyGeo} material={matChromeBright} />
        <mesh position={[0, 2.22, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={lakeCapRingGeo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} />
        </mesh>
        <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={lakeFlowRingGeo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} />
        </mesh>
      </group>

      {/* 中央 ACID 版本治理协调桥与锁晶体 */}
      <group position={[0, 1.25, 0]}>
        <mesh geometry={lakeBridgeTrussGeo} material={matTitaniumDark} />
        <mesh ref={crystalRef} position={[0, 0.48, 0]} geometry={lakeAcidPrismGeo} material={matGoldAlloy} />
      </group>

      <pointLight position={[0, 1.48, 0]} color={CYAN} intensity={6 + intensity * 11} distance={8.5} decay={2} />
      <FlowPulses start={[-1.05, 2.05, 0]} end={[1.05, 2.05, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.05, 0.48, 0]} end={[-1.05, 0.48, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}
