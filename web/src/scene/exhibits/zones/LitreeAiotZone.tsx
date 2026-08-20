import { useMemo, useRef } from 'react';
import type React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import type { ExhibitVisualProps } from '../exhibit-types';
import { FlowPulses } from '../shared/FlowPulses';
import { ZoneAtmosphericMotes } from '../shared/ZoneAtmosphericMotes';
import { ZoneBase } from '../shared/ZoneBase';
import {
  COLOR_STEEL_MID,
  CYAN,
  gisPillarBaseDiscGeo,
  matChromeBright,
  matGoldAlloy,
  matSteelLight,
  matSteelMid,
  matTitaniumDark,
  SAFETY,
  SIGNAL,
} from '../shared/resources';

// 02 - Litree AIoT (AIoT 协议与 GIS 空间拓扑)
const gisHexPlateGeo = new THREE.CylinderGeometry(2.05, 2.18, 0.1, 6);
const gisHexRingGeo = new THREE.RingGeometry(0.95, 1.95, 6);
const gisPillarNodeGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.44, 8);
const gisPillarHighGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.82, 8);
const gisPillarRingGeo = new THREE.TorusGeometry(0.155, 0.018, 6, 24);
const gisPillarHighRingGeo = new THREE.TorusGeometry(0.135, 0.018, 6, 24);
const gisBeaconCoreGeo = new THREE.SphereGeometry(0.13, 10, 10);
const radarMastPillarGeo = new THREE.CylinderGeometry(0.06, 0.11, 2.3, 12);
const radarCrossArmGeo = new THREE.BoxGeometry(0.55, 0.06, 0.06);
const radarDishPlateGeo = new THREE.ConeGeometry(0.44, 0.24, 16);
const radarFeedHornGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.38, 8);
const radarSweepFanGeo = new THREE.CylinderGeometry(0.01, 2.15, 0.02, 16, 1, true, 0, Math.PI / 2.2);
const aiotServerCabinetGeo = new THREE.BoxGeometry(0.48, 1.9, 0.76);
const aiotCabinetDoorGeo = new THREE.BoxGeometry(0.42, 1.76, 0.02);
const aiotCabinetSideTrimGeo = new THREE.BoxGeometry(0.03, 1.9, 0.03);
const aiotCabinetTopTrimGeo = new THREE.BoxGeometry(0.5, 0.03, 0.78);
const aiotCabinetBaseGlowGeo = new THREE.BoxGeometry(0.52, 0.025, 0.8);

// ==========================================
// 2. Litree AIoT 协议引擎与空间拓扑 (Protocol & GIS Zone)
// ==========================================
export function LitreeAiotZone({ intensity, motionEnabled }: ExhibitVisualProps): React.JSX.Element {
  const radarRef = useRef<THREE.Group>(null);
  const links = useMemo(() => [
    [-1.38, -0.68, -0.48, -0.68],
    [-0.48, -0.68, -0.48, 0.48],
    [-0.48, 0.48, 0.58, 0.48],
    [0.58, 0.48, 0.58, -0.88],
    [0.58, -0.88, 1.48, -0.88],
    [0.58, 0.48, 1.38, 0.98],
  ], []);

  useFrame((_, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.85 : 1;
    if (radarRef.current) radarRef.current.rotation.y += delta * 1.35 * speedMult;
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={SIGNAL} motionEnabled={motionEnabled} />
      <ZoneAtmosphericMotes accent={SIGNAL} intensity={intensity} motionEnabled={motionEnabled} count={14} />

      {/* GIS 空间六边形蜂窝多层网格底盘 */}
      <mesh position={[0, 0.25, 0]} receiveShadow geometry={gisHexPlateGeo}>
        <meshStandardMaterial color={COLOR_STEEL_MID} metalness={0.94} roughness={0.16} emissive={SIGNAL} emissiveIntensity={0.22 * intensity} />
      </mesh>
      <mesh position={[0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={gisHexRingGeo}>
        <meshBasicMaterial color={SIGNAL} wireframe toneMapped={false} transparent opacity={0.42 + intensity * 0.48} />
      </mesh>

      {/* GIS 空间 3D 立体管网测点与高度柱（柱身环形脉冲发光刻度环 + 发光柱脚） */}
      {links.map(([x1, z1, x2, z2], index) => {
        const dx = x2 - x1;
        const dz = z2 - z1;
        const length = Math.hypot(dx, dz);
        const isHigh = index % 2 === 0;
        return (
          <group key={index}>
            {/* 空间管道光纤 */}
            <mesh position={[(x1 + x2) / 2, 0.38, (z1 + z2) / 2]} rotation={[0, -Math.atan2(dz, dx), 0]}>
              <boxGeometry args={[length, 0.045, 0.055]} />
              <meshBasicMaterial color={index % 2 === 0 ? SIGNAL : CYAN} toneMapped={false} transparent opacity={0.6 + intensity * 0.4} />
            </mesh>
            {/* 3D 测点指标高立柱 */}
            <mesh position={[x1, isHigh ? 0.67 : 0.48, z1]} geometry={isHigh ? gisPillarHighGeo : gisPillarNodeGeo} material={matTitaniumDark} />
            {/* 黑色柱身环形发光刻度灯圈 */}
            {isHigh ? (
              <>
                <mesh position={[x1, 0.48, z1]} rotation={[Math.PI / 2, 0, 0]} geometry={gisPillarHighRingGeo}>
                  <meshBasicMaterial color={SIGNAL} toneMapped={false} />
                </mesh>
                <mesh position={[x1, 0.72, z1]} rotation={[Math.PI / 2, 0, 0]} geometry={gisPillarHighRingGeo}>
                  <meshBasicMaterial color={CYAN} toneMapped={false} />
                </mesh>
              </>
            ) : (
              <mesh position={[x1, 0.48, z1]} rotation={[Math.PI / 2, 0, 0]} geometry={gisPillarRingGeo}>
                <meshBasicMaterial color={SIGNAL} toneMapped={false} />
              </mesh>
            )}
            {/* 柱脚地表发光环 */}
            <mesh position={[x1, 0.26, z1]} rotation={[-Math.PI / 2, 0, 0]} geometry={gisPillarBaseDiscGeo}>
              <meshBasicMaterial color={SIGNAL} toneMapped={false} transparent opacity={0.7} />
            </mesh>
            {/* 测点发光核心珠 */}
            <mesh position={[x1, isHigh ? 1.1 : 0.72, z1]} geometry={gisBeaconCoreGeo}>
              <meshBasicMaterial color={index === 2 ? SAFETY : SIGNAL} toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {/* AIoT 工业协议网关机柜列（多层 LED 状态面板 + 四周包边霓虹灯条 + 顶部全息投射） */}
      {[-1.45, 1.45].map((x) => (
        <group key={x} position={[x, 0.24, 0]}>
          <mesh position={[0, 0.95, 0]} castShadow geometry={aiotServerCabinetGeo} material={matTitaniumDark} />
          <mesh position={[0, 0.95, 0.39]} geometry={aiotCabinetDoorGeo} material={matSteelMid} />

          {/* 机柜四周 4 根垂直发光棱边包条 */}
          {[-0.24, 0.24].flatMap((cx) => [-0.38, 0.38].map((cz) => (
            <mesh key={`trim-${cx}-${cz}`} position={[cx, 0.95, cz]} geometry={aiotCabinetSideTrimGeo}>
              <meshBasicMaterial color={SIGNAL} toneMapped={false} transparent opacity={0.75 + intensity * 0.25} />
            </mesh>
          )))}

          {/* 机柜顶部发光天际框 */}
          <mesh position={[0, 1.9, 0]} geometry={aiotCabinetTopTrimGeo}>
            <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.8} />
          </mesh>

          {/* 机柜底部地面泛光板 */}
          <mesh position={[0, 0.02, 0]} geometry={aiotCabinetBaseGlowGeo}>
            <meshBasicMaterial color={SIGNAL} toneMapped={false} transparent opacity={0.65} />
          </mesh>

          {/* 阵列式机架状态 LED 屏 */}
          {[0.38, 0.7, 1.02, 1.34, 1.66].map((y, ledIdx) => (
            <group key={ledIdx} position={[0, y, 0.41]}>
              <mesh>
                <boxGeometry args={[0.36, 0.06, 0.02]} />
                <meshBasicMaterial color={ledIdx % 2 === 0 ? SIGNAL : CYAN} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* 空间雷达天线旋转扫描总成（15km 缓冲区与 BFS 拓扑追踪） */}
      <group position={[0, 0.26, 0]}>
        <mesh position={[0, 1.15, 0]} geometry={radarMastPillarGeo} material={matChromeBright} />
        <mesh position={[0, 2.28, 0]} geometry={radarCrossArmGeo} material={matSteelLight} />
        {/* 雷达支撑主轴螺旋光圈 */}
        {[0.6, 1.2, 1.8].map((ry, idx) => (
          <mesh key={idx} position={[0, ry, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.08 + idx * 0.015, 0.012, 6, 24]} />
            <meshBasicMaterial color={CYAN} toneMapped={false} />
          </mesh>
        ))}
        <group ref={radarRef} position={[0, 2.32, 0]}>
          <mesh rotation={[Math.PI / 3.5, 0, 0]} geometry={radarDishPlateGeo} material={matTitaniumDark} />
          <mesh position={[0, 0.12, 0.26]} rotation={[Math.PI / 3.5, 0, 0]} geometry={radarFeedHornGeo} material={matGoldAlloy} />
          {/* 大角度半透明动态扫描扇面 */}
          <mesh position={[0, -0.24, 1.0]} rotation={[Math.PI / 2, 0, 0]} geometry={radarSweepFanGeo}>
            <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.38 + intensity * 0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      <pointLight position={[0, 1.5, 0]} color={SIGNAL} intensity={5 + intensity * 11} distance={8.5} decay={2} />
      <FlowPulses start={[-1.45, 1.25, 0]} end={[0, 2.32, 0]} color={SIGNAL} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.45, 1.25, 0]} end={[0, 2.32, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}
