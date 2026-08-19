import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { CyberIndustrialPillar } from './exhibits/shared/CyberIndustrialPillar';
import { FlowPulses } from './exhibits/shared/FlowPulses';
import {
  COLOR_STEEL_DARK,
  COLOR_STEEL_LIGHT,
  COLOR_STEEL_MID,
  CYAN,
  EMERALD,
  GOLD,
  matAcrylicCyan,
  matAcrylicOrange,
  matAcrylicPurple,
  matChromeBright,
  matGoldAlloy,
  matSteelLight,
  matSteelMid,
  matTitaniumDark,
  PURPLE,
  SAFETY,
  SIGNAL,
} from './exhibits/shared/resources';
import { ZoneAtmosphericMotes } from './exhibits/shared/ZoneAtmosphericMotes';
import { ZoneBase } from './exhibits/shared/ZoneBase';
import type { IndustrialAssetsProps } from './exhibits/exhibit-types';
import { EXHIBITS, ExhibitLayout, getZoneFocus } from './scene-layout';
import type { ExhibitVisualProps } from './scene-types';

// ==========================================
// 1. 全局静态共享几何体池（零 GC 静态复用）
// ==========================================

// 通用重型基座

// 通用全息高能立柱光效几何体 (Cyber Pillar Optics)

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

// 02 - Litree AIoT (AIoT 协议与 GIS 空间拓扑)
const gisHexPlateGeo = new THREE.CylinderGeometry(2.05, 2.18, 0.1, 6);
const gisHexRingGeo = new THREE.RingGeometry(0.95, 1.95, 6);
const gisPillarNodeGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.44, 8);
const gisPillarHighGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.82, 8);
const gisPillarRingGeo = new THREE.TorusGeometry(0.155, 0.018, 6, 24);
const gisPillarHighRingGeo = new THREE.TorusGeometry(0.135, 0.018, 6, 24);
const gisPillarBaseDiscGeo = new THREE.RingGeometry(0.14, 0.22, 16);
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

// 03 - Litree Agent (水务数据智能体)
const agentIcosaMainGeo = new THREE.IcosahedronGeometry(0.68, 0);
const agentIcosaInnerGeo = new THREE.IcosahedronGeometry(0.4, 0);
const agentIcosaWireGeo = new THREE.IcosahedronGeometry(0.86, 1);
const agentOrbitTorusXGeo = new THREE.TorusGeometry(1.42, 0.025, 8, 56);
const agentOrbitTorusYGeo = new THREE.TorusGeometry(1.18, 0.022, 8, 48);
const agentOrbitTorusZGeo = new THREE.TorusGeometry(0.96, 0.019, 8, 40);
const agentMiddlePlatformGeo = new THREE.BoxGeometry(0.44, 1.1, 0.44);
const agentFloatingGemGeo = new THREE.OctahedronGeometry(0.19, 0);
const agentSatelliteBodyGeo = new THREE.DodecahedronGeometry(0.19, 0);
const agentSatelliteRingGeo = new THREE.TorusGeometry(0.28, 0.018, 6, 24);
const agentEmitterPillarGeo = new THREE.CylinderGeometry(0.06, 0.1, 0.85, 8);
const agentEmitterBeamGeo = new THREE.CylinderGeometry(0.01, 0.1, 1.45, 8, 1, true);
const agentEmitterRingGeo = new THREE.TorusGeometry(0.12, 0.016, 6, 20);

// 04 - Litree OA / HR (独立业务中台)
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

// 05 - WeLink Search (统一搜索与个性化打分)
const searchCabinetRackGeo = new THREE.BoxGeometry(0.48, 1.88, 0.72);
const searchServerTrayGeo = new THREE.BoxGeometry(0.44, 0.16, 0.025);
const searchRackSideStripGeo = new THREE.BoxGeometry(0.03, 1.84, 0.03);
const searchCabinetTrimGeo = new THREE.BoxGeometry(0.03, 1.88, 0.03);
const searchCabinetTopTrimGeo = new THREE.BoxGeometry(0.5, 0.03, 0.74);
const searchPrismCrystalGeo = new THREE.ConeGeometry(0.58, 0.92, 4);
const searchBeamConeGeo = new THREE.ConeGeometry(1.25, 1.45, 16, 1, true);
const searchScannerBarGeo = new THREE.BoxGeometry(2.9, 0.04, 0.04);
const searchIndexCubeGeo = new THREE.BoxGeometry(0.28, 0.19, 0.24);

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

// 07 - Senge Gateway (实时通信网关与告警风暴)
const gatewayTowerPillarGeo = new THREE.CylinderGeometry(0.1, 0.24, 2.55, 16);
const gatewayTrussCrossGeo = new THREE.BoxGeometry(1.55, 0.055, 0.055);
const gatewayTrussDiagGeo = new THREE.BoxGeometry(0.85, 0.04, 0.04);
const gatewayTowerVerticalStripGeo = new THREE.BoxGeometry(0.025, 2.52, 0.025);
const gatewayTowerGlowRingGeo = new THREE.TorusGeometry(0.22, 0.016, 6, 32);
const gatewayTowerHaloRingLowGeo = new THREE.TorusGeometry(0.25, 0.018, 6, 32);
const gatewayTowerHaloRingMidGeo = new THREE.TorusGeometry(0.19, 0.016, 6, 32);
const gatewayTowerHaloRingHighGeo = new THREE.TorusGeometry(0.14, 0.014, 6, 32);
const gatewayMicrowaveDishGeo = new THREE.ConeGeometry(0.26, 0.16, 14);
const gatewayLightningRodGeo = new THREE.CylinderGeometry(0.018, 0.045, 0.72, 8);
const gatewayPulseWaveTorusGeo = new THREE.TorusGeometry(1.55, 0.034, 6, 48);
const gatewayComputePodGeo = new THREE.BoxGeometry(0.3, 0.44, 0.3);
const gatewayPodTrimGeo = new THREE.BoxGeometry(0.025, 0.44, 0.025);

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

type ZoneProps = ExhibitVisualProps & { exhibit: ExhibitLayout };

// ==========================================
// 1. Litree 架构底座与微服务治理 (Core Zone)
// ==========================================
function LitreeOverviewCoreZone({ intensity, motionEnabled }: ZoneProps) {
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

// ==========================================
// 2. Litree AIoT 协议引擎与空间拓扑 (Protocol & GIS Zone)
// ==========================================
function LitreeAiotZone({ intensity, motionEnabled }: ZoneProps) {
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

// ==========================================
// 3. Litree OA 中台与 AI Agent 智能体 (Agent Zone)
// ==========================================
function LitreeAgentZone({ intensity, motionEnabled }: ZoneProps) {
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

// ==========================================
// 4. Litree OA / HR 独立业务中台 (OA Zone)
// ==========================================
function LitreeOaZone({ intensity, motionEnabled }: ZoneProps) {
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

// ==========================================
// 5. WeLink 统一搜索与个性化打分引擎 (Search Zone)
// ==========================================
function WelinkSearchZone({ intensity, motionEnabled }: ZoneProps) {
  const prismRef = useRef<THREE.Mesh>(null);
  const scannerRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.65 : 1;
    if (prismRef.current) {
      prismRef.current.rotation.y += delta * 1.05 * speedMult;
      prismRef.current.position.y = 2.18 + Math.sin(clock.elapsedTime * 2.8) * 0.1;
    }
    if (scannerRef.current) {
      scannerRef.current.position.y = 0.58 + Math.sin(clock.elapsedTime * 3.2) * 0.55;
    }
    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = 0.22 + Math.sin(clock.elapsedTime * 3) * 0.09;
    }
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={SAFETY} motionEnabled={motionEnabled} />
      <ZoneAtmosphericMotes accent={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={16} />

      {/* 4联分布式 ES 搜索服务器机柜阵列（带抽屉导轨、指示灯与机柜轮廓灯条） */}
      {[-1.4, -0.48, 0.48, 1.4].map((x, index) => (
        <group key={x} position={[x, 0.24, index % 2 === 0 ? 0.2 : -0.2]}>
          <mesh position={[0, 0.94, 0]} castShadow geometry={searchCabinetRackGeo} material={matTitaniumDark} />
          {/* 机柜正面两边高亮垂直导光管 */}
          {[-0.17, 0.17].map((cx) => (
            <mesh key={cx} position={[cx, 0.94, 0.36]} geometry={searchRackSideStripGeo}>
              <meshBasicMaterial color={index % 2 === 0 ? SAFETY : CYAN} toneMapped={false} transparent opacity={0.75 + intensity * 0.25} />
            </mesh>
          ))}
          {/* 独立服务器抽屉面板 */}
          {[0.26, 0.58, 0.9, 1.22, 1.54].map((y, trayIdx) => (
            <group key={trayIdx} position={[0, y, 0.37]}>
              <mesh geometry={searchServerTrayGeo} material={matSteelMid} />
              <mesh position={[0.13, 0, 0.02]}>
                <boxGeometry args={[0.08, 0.04, 0.01]} />
                <meshBasicMaterial color={trayIdx % 2 === 0 ? SAFETY : CYAN} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* 悬浮倒金字塔多维打分分发棱镜 */}
      <mesh ref={prismRef} position={[0, 2.18, 0]} rotation={[Math.PI, 0, 0]} geometry={searchPrismCrystalGeo} material={matGoldAlloy} />

      {/* 打分向下投射的半透明光锥 */}
      <mesh ref={beamRef} position={[0, 1.5, 0]} rotation={[Math.PI, 0, 0]} geometry={searchBeamConeGeo}>
        <meshBasicMaterial color={GOLD} transparent opacity={0.25} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* 动态水平切片扫描激光 */}
      <group ref={scannerRef} position={[0, 0.9, 0]}>
        <mesh geometry={searchScannerBarGeo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} transparent opacity={0.85 + intensity * 0.15} />
        </mesh>
      </group>

      {/* 悬浮倒排索引分片数据块 */}
      {[-1.1, 0.0, 1.1].map((x, idx) => (
        <mesh key={idx} position={[x, 1.65, 0.55]} geometry={searchIndexCubeGeo}>
          <meshStandardMaterial color={COLOR_STEEL_LIGHT} metalness={0.92} emissive={CYAN} emissiveIntensity={0.65 * intensity} />
        </mesh>
      ))}

      <pointLight position={[0, 2.2, 0]} color={GOLD} intensity={6 + intensity * 11} distance={8.5} decay={2} />
      <FlowPulses start={[-1.85, 0.45, 0]} end={[0, 2.18, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.85, 0.45, 0]} end={[0, 2.18, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}

// ==========================================
// 6. WeLink 双路数据湖管道与版本一致性治理 (Lake Zone)
// ==========================================
function WelinkDataLakeZone({ intensity, motionEnabled }: ZoneProps) {
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

// ==========================================
// 7. 森格实时通信网关与告警风暴治理 (Gateway Zone)
// ==========================================
function SengeGatewayZone({ intensity, motionEnabled }: ZoneProps) {
  const wavesRef = useRef<THREE.Group>(null);
  const dishGroupRef = useRef<THREE.Group>(null);

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

      {/* Netty 高并发通信矩阵底座节点（环形 6 节点集群） */}
      {[0, 1, 2, 3, 4, 5].map((idx) => {
        const angle = (idx / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 1.35;
        const z = Math.sin(angle) * 1.35;
        return (
          <group key={idx} position={[x, 0.24, z]}>
            <mesh position={[0, 0.24, 0]} geometry={gatewayComputePodGeo}>
              <meshStandardMaterial
                color={COLOR_STEEL_MID}
                metalness={0.94}
                roughness={0.16}
                emissive={idx % 2 === 0 ? SAFETY : CYAN}
                emissiveIntensity={0.4 * intensity}
              />
            </mesh>
            <mesh position={[0, 0.47, 0]}>
              <boxGeometry args={[0.24, 0.05, 0.24]} />
              <meshBasicMaterial color={SAFETY} toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {/* 中央通信重型铁塔与微波天线阵列（增加 4 垂直面激光导光槽与塔腰发光圈） */}
      <group position={[0, 0.24, 0]}>
        <mesh position={[0, 1.3, 0]} castShadow geometry={gatewayTowerPillarGeo} material={matTitaniumDark} />

        {/* 塔身 4 面垂直高亮激光导光条 */}
        {[
          [0, 1.3, 0.205, 0],
          [0, 1.3, -0.205, 0],
          [0.205, 1.3, 0, Math.PI / 2],
          [-0.205, 1.3, 0, Math.PI / 2],
        ].map(([gx, gy, gz, rot], gIdx) => (
          <mesh key={gIdx} position={[gx, gy, gz]} rotation={[0, rot, 0]} geometry={gatewayTowerVerticalStripGeo}>
            <meshBasicMaterial color={SAFETY} toneMapped={false} transparent opacity={0.85 + intensity * 0.15} />
          </mesh>
        ))}

        {/* 塔腰环绕霓虹光圈 */}
        {[0.6, 1.3, 2.0].map((ry, idx) => (
          <mesh key={idx} position={[0, ry, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={gatewayTowerGlowRingGeo}>
            <meshBasicMaterial color={idx % 2 === 0 ? SAFETY : CYAN} toneMapped={false} />
          </mesh>
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
            <mesh key={idx} position={[Math.cos(angle) * 0.42, 0, Math.sin(angle) * 0.42]} rotation={[0, -angle + Math.PI / 2, Math.PI / 4]} geometry={gatewayMicrowaveDishGeo}>
              <meshStandardMaterial color={COLOR_STEEL_DARK} metalness={0.92} emissive={SAFETY} emissiveIntensity={0.75 * intensity} />
            </mesh>
          ))}
          {/* 避雷高频放电探针 */}
          <mesh position={[0, 0.42, 0]} geometry={gatewayLightningRodGeo} material={matChromeBright} />
        </group>
      </group>

      {/* 电磁波辐射扩散环（突发告警风暴滑动窗口平滑与抑制） */}
      <group ref={wavesRef} position={[0, 2.48, 0]} rotation={[Math.PI / 2, 0, 0]}>
        {[0, 1, 2].map((idx) => (
          <mesh key={idx} geometry={gatewayPulseWaveTorusGeo}>
            <meshBasicMaterial color={SAFETY} toneMapped={false} transparent opacity={0.7} />
          </mesh>
        ))}
      </group>

      <pointLight position={[0, 2.55, 0]} color={SAFETY} intensity={6 + intensity * 12} distance={9} decay={2} />
      <FlowPulses start={[-1.45, 0.45, 0]} end={[0, 2.48, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.45, 0.45, 0]} end={[0, 2.48, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}

// ==========================================
// 8. 森格智慧水务平台 0-1 架构底座与容器化交付 (Platform Zone)
// ==========================================
function SengePlatformZone({ intensity, motionEnabled }: ZoneProps) {
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

// 展品模型路由器（按 exhibit.id 严格精确路由到对应定制高精度 3D 组件）
function IndustrialZone(props: ZoneProps) {
  switch (props.exhibit.id) {
    case 'litree-overview':
      return <LitreeOverviewCoreZone {...props} />;
    case 'litree-aiot':
      return <LitreeAiotZone {...props} />;
    case 'litree-agent':
      return <LitreeAgentZone {...props} />;
    case 'oa-hr':
      return <LitreeOaZone {...props} />;
    case 'welink-search':
      return <WelinkSearchZone {...props} />;
    case 'welink-data':
      return <WelinkDataLakeZone {...props} />;
    case 'senge-gateway':
      return <SengeGatewayZone {...props} />;
    case 'senge-platform':
      return <SengePlatformZone {...props} />;
    default:
      return <LitreeOverviewCoreZone {...props} />;
  }
}

export function IndustrialAssets({
  activeExhibit,
  motionEnabled,
  onSelectExhibit,
}: IndustrialAssetsProps) {
  return (
    <>
      {EXHIBITS.map((exhibit) => {
        const focus = getZoneFocus(activeExhibit, exhibit.id);
        const isActive = activeExhibit === exhibit.id;
        return (
          <group
            key={exhibit.id}
            position={exhibit.position}
            scale={isActive ? 1.06 : focus.intensity < 0.5 ? 0.94 : 1}
            onClick={(e) => {
              e.stopPropagation();
              onSelectExhibit?.(exhibit.id);
            }}
            onPointerOver={() => {
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = '';
            }}
          >
            <IndustrialZone exhibit={exhibit} intensity={focus.intensity} motionEnabled={motionEnabled} />
          </group>
        );
      })}
    </>
  );
}
