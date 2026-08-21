import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import type { ExhibitVisualProps } from '../exhibit-types';
import { FlowPulses } from '../shared/FlowPulses';
import { ZoneAtmosphericMotes } from '../shared/ZoneAtmosphericMotes';
import { ZoneBase } from '../shared/ZoneBase';
import {
  COLOR_STEEL_MID,
  CYAN,
  getCachedBasicMaterial,
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
const aiotLedBoxGeo = new THREE.BoxGeometry(0.36, 0.06, 0.02);

const radarSpiralGeos = [
  new THREE.TorusGeometry(0.08, 0.012, 6, 24),
  new THREE.TorusGeometry(0.095, 0.012, 6, 24),
  new THREE.TorusGeometry(0.11, 0.012, 6, 24),
];

const RAW_LINKS = [
  [-1.38, -0.68, -0.48, -0.68],
  [-0.48, -0.68, -0.48, 0.48],
  [-0.48, 0.48, 0.58, 0.48],
  [0.58, 0.48, 0.58, -0.88],
  [0.58, -0.88, 1.48, -0.88],
  [0.58, 0.48, 1.38, 0.98],
] as const;

// 预计算 GIS 空间管网几何体与位姿
const GIS_LINK_DATA = RAW_LINKS.map(([x1, z1, x2, z2], index) => {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const length = Math.hypot(dx, dz);
  const isHigh = index % 2 === 0;
  return {
    index,
    x1,
    z1,
    midPos: [(x1 + x2) / 2, 0.38, (z1 + z2) / 2] as const,
    rotationY: -Math.atan2(dz, dx),
    geometry: new THREE.BoxGeometry(length, 0.045, 0.055),
    isHigh,
    pillarY: isHigh ? 0.67 : 0.48,
    beaconY: isHigh ? 1.1 : 0.72,
  };
});

// ==========================================
// 2. Litree AIoT 协议引擎与空间拓扑 (Protocol & GIS Zone)
// ==========================================
function LitreeAiotZoneComponent({ intensity, motionEnabled }: ExhibitVisualProps): React.JSX.Element {
  const radarRef = useRef<THREE.Group>(null);

  const materials = useMemo(() => {
    return {
      hexPlate: new THREE.MeshStandardMaterial({ color: COLOR_STEEL_MID, metalness: 0.94, roughness: 0.16, emissive: SIGNAL, emissiveIntensity: 0.22 * intensity }),
      hexRing: getCachedBasicMaterial(SIGNAL, { wireframe: true, transparent: true, opacity: +(0.42 + intensity * 0.48).toFixed(2) }),
      pipeSignal: getCachedBasicMaterial(SIGNAL, { transparent: true, opacity: +(0.6 + intensity * 0.4).toFixed(2) }),
      pipeCyan: getCachedBasicMaterial(CYAN, { transparent: true, opacity: +(0.6 + intensity * 0.4).toFixed(2) }),
      radarSweep: getCachedBasicMaterial(CYAN, { transparent: true, opacity: +(0.38 + intensity * 0.4).toFixed(2), side: THREE.DoubleSide }),
      cabinetTrim: getCachedBasicMaterial(SIGNAL, { transparent: true, opacity: +(0.75 + intensity * 0.25).toFixed(2) }),
      cabinetTop: getCachedBasicMaterial(CYAN, { transparent: true, opacity: 0.8 }),
      cabinetBase: getCachedBasicMaterial(SIGNAL, { transparent: true, opacity: 0.65 }),
      baseDisc: getCachedBasicMaterial(SIGNAL, { transparent: true, opacity: 0.7 }),
      beaconSignal: getCachedBasicMaterial(SIGNAL),
      beaconSafety: getCachedBasicMaterial(SAFETY),
      beaconCyan: getCachedBasicMaterial(CYAN),
    };
  }, [intensity]);

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
      <mesh position={[0, 0.25, 0]} receiveShadow geometry={gisHexPlateGeo} material={materials.hexPlate} />
      <mesh position={[0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={gisHexRingGeo} material={materials.hexRing} />

      {/* GIS 空间 3D 立体管网测点与高度柱 */}
      {GIS_LINK_DATA.map((link) => (
        <group key={link.index}>
          {/* 空间管道光纤 */}
          <mesh position={link.midPos} rotation={[0, link.rotationY, 0]} geometry={link.geometry} material={link.index % 2 === 0 ? materials.pipeSignal : materials.pipeCyan} />
          {/* 3D 测点指标高立柱 */}
          <mesh position={[link.x1, link.pillarY, link.z1]} geometry={link.isHigh ? gisPillarHighGeo : gisPillarNodeGeo} material={matTitaniumDark} />
          {/* 黑色柱身环形发光刻度灯圈 */}
          {link.isHigh ? (
            <>
              <mesh position={[link.x1, 0.48, link.z1]} rotation={[Math.PI / 2, 0, 0]} geometry={gisPillarHighRingGeo} material={materials.beaconSignal} />
              <mesh position={[link.x1, 0.72, link.z1]} rotation={[Math.PI / 2, 0, 0]} geometry={gisPillarHighRingGeo} material={materials.beaconCyan} />
            </>
          ) : (
            <mesh position={[link.x1, 0.48, link.z1]} rotation={[Math.PI / 2, 0, 0]} geometry={gisPillarRingGeo} material={materials.beaconSignal} />
          )}
          {/* 柱脚地表发光环 */}
          <mesh position={[link.x1, 0.26, link.z1]} rotation={[-Math.PI / 2, 0, 0]} geometry={gisPillarBaseDiscGeo} material={materials.baseDisc} />
          {/* 测点发光核心珠 */}
          <mesh position={[link.x1, link.beaconY, link.z1]} geometry={gisBeaconCoreGeo} material={link.index === 2 ? materials.beaconSafety : materials.beaconSignal} />
        </group>
      ))}

      {/* AIoT 工业协议网关机柜列 */}
      {[-1.45, 1.45].map((x) => (
        <group key={x} position={[x, 0.24, 0]}>
          <mesh position={[0, 0.95, 0]} castShadow geometry={aiotServerCabinetGeo} material={matTitaniumDark} />
          <mesh position={[0, 0.95, 0.39]} geometry={aiotCabinetDoorGeo} material={matSteelMid} />

          {/* 机柜四周 4 根垂直发光棱边包条 */}
          {[-0.24, 0.24].flatMap((cx) => [-0.38, 0.38].map((cz) => (
            <mesh key={`trim-${cx}-${cz}`} position={[cx, 0.95, cz]} geometry={aiotCabinetSideTrimGeo} material={materials.cabinetTrim} />
          )))}

          {/* 机柜顶部发光天际框 */}
          <mesh position={[0, 1.9, 0]} geometry={aiotCabinetTopTrimGeo} material={materials.cabinetTop} />

          {/* 机柜底部地面泛光板 */}
          <mesh position={[0, 0.02, 0]} geometry={aiotCabinetBaseGlowGeo} material={materials.cabinetBase} />

          {/* 阵列式机架状态 LED 屏 */}
          {[0.38, 0.7, 1.02, 1.34, 1.66].map((y, ledIdx) => (
            <group key={ledIdx} position={[0, y, 0.41]}>
              <mesh geometry={aiotLedBoxGeo} material={ledIdx % 2 === 0 ? materials.beaconSignal : materials.beaconCyan} />
            </group>
          ))}
        </group>
      ))}

      {/* 空间雷达天线旋转扫描总成 */}
      <group position={[0, 0.26, 0]}>
        <mesh position={[0, 1.15, 0]} geometry={radarMastPillarGeo} material={matChromeBright} />
        <mesh position={[0, 2.28, 0]} geometry={radarCrossArmGeo} material={matSteelLight} />
        {/* 雷达支撑主轴螺旋光圈 */}
        {[0.6, 1.2, 1.8].map((ry, idx) => (
          <mesh key={idx} position={[0, ry, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={radarSpiralGeos[idx]} material={materials.beaconCyan} />
        ))}
        <group ref={radarRef} position={[0, 2.32, 0]}>
          <mesh rotation={[Math.PI / 3.5, 0, 0]} geometry={radarDishPlateGeo} material={matTitaniumDark} />
          <mesh position={[0, 0.12, 0.26]} rotation={[Math.PI / 3.5, 0, 0]} geometry={radarFeedHornGeo} material={matGoldAlloy} />
          <mesh position={[0, -0.24, 1.0]} rotation={[Math.PI / 2, 0, 0]} geometry={radarSweepFanGeo} material={materials.radarSweep} />
        </group>
      </group>

      <pointLight position={[0, 1.5, 0]} color={SIGNAL} intensity={5 + intensity * 11} distance={8.5} decay={2} />
      <FlowPulses start={[-1.45, 1.25, 0]} end={[0, 2.32, 0]} color={SIGNAL} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.45, 1.25, 0]} end={[0, 2.32, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}

export const LitreeAiotZone = React.memo(LitreeAiotZoneComponent);

