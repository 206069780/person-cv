import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { EXHIBITS, ExhibitLayout, getZoneFocus } from './scene-layout';

// 调色盘
const SIGNAL = '#00a89d';
const CYAN = '#28d7e5';
const SAFETY = '#ff6b3d';
const PURPLE = '#c084fc';
const GOLD = '#f5a623';
const STEEL_DARK = '#0b1317';
const STEEL_MID = '#1c2a32';
const STEEL_LIGHT = '#3b4f59';

// ==========================================
// 1. 通用共享几何体与材质池（零 GC 静态复用）
// ==========================================
const baseOctagonGeo = new THREE.CylinderGeometry(2.45, 2.7, 0.18, 8);
const baseTopPlateGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.05, 8);
const baseRingInnerGeo = new THREE.RingGeometry(1.65, 1.85, 32);
const baseRingOuterGeo = new THREE.RingGeometry(2.0, 2.18, 8);
const baseGearTorusGeo = new THREE.TorusGeometry(2.35, 0.024, 6, 64);
const baseCornerBlockGeo = new THREE.BoxGeometry(0.28, 0.22, 0.28);
const baseVentGeo = new THREE.BoxGeometry(0.6, 0.04, 0.12);
const pulseSphereGeo = new THREE.SphereGeometry(0.055, 8, 8);

// Litree Overview (01 - 微服务与数据底座)
const corePillarMainGeo = new THREE.BoxGeometry(0.3, 1.75, 0.3);
const corePillarFinGeo = new THREE.BoxGeometry(0.36, 0.04, 0.36);
const corePillarSpireGeo = new THREE.ConeGeometry(0.08, 0.22, 4);
const coreOctaOuterGeo = new THREE.OctahedronGeometry(0.62, 0);
const coreOctaInnerGeo = new THREE.OctahedronGeometry(0.38, 0);
const coreOctaWireGeo = new THREE.OctahedronGeometry(0.78, 0);
const coreGimbalRing1Geo = new THREE.TorusGeometry(1.15, 0.025, 8, 48);
const coreGimbalRing2Geo = new THREE.TorusGeometry(0.92, 0.022, 8, 40);
const coreGimbalRing3Geo = new THREE.TorusGeometry(0.72, 0.018, 8, 36);
const coreElectrodeGeo = new THREE.CylinderGeometry(0.04, 0.09, 0.55, 8);
const coreShardBoxGeo = new THREE.BoxGeometry(0.22, 0.32, 0.18);

// Litree AIoT (02 - AIoT 协议与 GIS 空间拓扑)
const gisHexPlateGeo = new THREE.CylinderGeometry(1.95, 2.05, 0.08, 6);
const gisHexRingGeo = new THREE.RingGeometry(0.9, 1.85, 6);
const gisPillarNodeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.35, 8);
const gisPillarHighGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.7, 8);
const gisBeaconCoreGeo = new THREE.SphereGeometry(0.1, 8, 8);
const radarMastPillarGeo = new THREE.CylinderGeometry(0.05, 0.09, 2.1, 12);
const radarDishPlateGeo = new THREE.ConeGeometry(0.36, 0.2, 12);
const radarFeedHornGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.32, 8);
const radarSweepFanGeo = new THREE.CylinderGeometry(0.01, 1.9, 0.02, 16, 1, true, 0, Math.PI / 2.5);
const aiotServerCabinetGeo = new THREE.BoxGeometry(0.42, 1.75, 0.68);
const aiotCabinetDoorGeo = new THREE.BoxGeometry(0.36, 1.6, 0.02);

// Litree Agent (03 - OA 中台与 AI Agent 智能体)
const agentIcosaMainGeo = new THREE.IcosahedronGeometry(0.58, 0);
const agentIcosaInnerGeo = new THREE.IcosahedronGeometry(0.35, 0);
const agentIcosaWireGeo = new THREE.IcosahedronGeometry(0.74, 1);
const agentOrbitTorusXGeo = new THREE.TorusGeometry(1.3, 0.022, 8, 56);
const agentOrbitTorusYGeo = new THREE.TorusGeometry(1.1, 0.02, 8, 48);
const agentOrbitTorusZGeo = new THREE.TorusGeometry(0.9, 0.018, 8, 40);
const agentMiddlePlatformGeo = new THREE.BoxGeometry(0.38, 0.95, 0.38);
const agentFloatingGemGeo = new THREE.OctahedronGeometry(0.16, 0);
const agentSatelliteBodyGeo = new THREE.DodecahedronGeometry(0.16, 0);

// Litree OA / HR (04 - 独立业务中台)
const oaHubCubeGeo = new THREE.BoxGeometry(0.72, 0.72, 0.72);
const oaHubInnerGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
const oaStateRingGeo = new THREE.TorusGeometry(0.95, 0.03, 8, 40);
const oaSyncBridgeGeo = new THREE.BoxGeometry(2.4, 0.08, 0.18);

// WeLink Search (04 - 统一搜索与个性化打分)
const searchCabinetRackGeo = new THREE.BoxGeometry(0.42, 1.7, 0.64);
const searchServerTrayGeo = new THREE.BoxGeometry(0.38, 0.14, 0.02);
const searchPrismCrystalGeo = new THREE.ConeGeometry(0.52, 0.82, 4);
const searchBeamConeGeo = new THREE.ConeGeometry(1.1, 1.2, 16, 1, true);
const searchScannerBarGeo = new THREE.BoxGeometry(2.6, 0.03, 0.03);
const searchIndexCubeGeo = new THREE.BoxGeometry(0.24, 0.16, 0.2);

// WeLink Data Lake (05 - 双路数据湖)
const lakeReactorTubeGeo = new THREE.CylinderGeometry(0.46, 0.46, 1.8, 24);
const lakeHelixCoilGeo = new THREE.TorusGeometry(0.36, 0.028, 6, 32);
const lakeCapHeavyGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.15, 24);
const lakeBridgeTrussGeo = new THREE.BoxGeometry(1.25, 0.18, 0.32);
const lakeAcidPrismGeo = new THREE.OctahedronGeometry(0.26, 0);
const lakeFlowRingGeo = new THREE.TorusGeometry(0.66, 0.025, 8, 36);

// Senge Gateway (06 - 实时通信网关与告警风暴)
const gatewayTowerPillarGeo = new THREE.CylinderGeometry(0.09, 0.2, 2.3, 16);
const gatewayTrussCrossGeo = new THREE.BoxGeometry(1.4, 0.045, 0.045);
const gatewayMicrowaveDishGeo = new THREE.ConeGeometry(0.22, 0.14, 12);
const gatewayLightningRodGeo = new THREE.CylinderGeometry(0.015, 0.035, 0.6, 8);
const gatewayPulseWaveTorusGeo = new THREE.TorusGeometry(1.4, 0.03, 6, 48);
const gatewayComputePodGeo = new THREE.BoxGeometry(0.26, 0.38, 0.26);

// Senge Platform (07 - 0-1 平台架构与容器化)
const platformK8sPodGeo = new THREE.BoxGeometry(0.88, 0.42, 0.72);
const platformPodFrameOuterGeo = new THREE.BoxGeometry(0.92, 0.05, 0.76);
const platformPipeMainGeo = new THREE.CylinderGeometry(0.085, 0.085, 2.1, 16);
const platformPipeFlangeGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.06, 16);
const platformValveWheelGeo = new THREE.TorusGeometry(0.16, 0.038, 8, 24);
const platformDualRing1Geo = new THREE.TorusGeometry(1.5, 0.028, 8, 56);
const platformDualRing2Geo = new THREE.TorusGeometry(1.3, 0.022, 8, 48);
const platformTelemetryScreenGeo = new THREE.PlaneGeometry(0.58, 0.36);

interface ZoneProps {
  exhibit: ExhibitLayout;
  intensity: number;
  motionEnabled: boolean;
}

// 动态脉冲能量流
function FlowPulses({
  start,
  end,
  color,
  intensity,
  motionEnabled,
  count = 3,
}: {
  start: readonly [number, number, number];
  end: readonly [number, number, number];
  color: string;
  intensity: number;
  motionEnabled: boolean;
  count?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const helper = useMemo(() => new THREE.Object3D(), []);
  const progress = useRef(Array.from({ length: count }, (_, index) => index / count));
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: true, opacity: 0.32 + intensity * 0.48 }),
    [color, intensity]
  );

  useFrame((_, delta) => {
    if (!ref.current || !motionEnabled || intensity < 0.25) return;
    progress.current.forEach((value, index) => {
      const next = (value + delta * (0.16 + index * 0.012)) % 1;
      progress.current[index] = next;
      helper.position.set(
        THREE.MathUtils.lerp(start[0], end[0], next),
        THREE.MathUtils.lerp(start[1], end[1], next),
        THREE.MathUtils.lerp(start[2], end[2], next),
      );
      helper.scale.setScalar(index % 2 === 0 ? 1 : 0.72);
      helper.updateMatrix();
      ref.current?.setMatrixAt(index, helper.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[pulseSphereGeo, material, count]} />
  );
}

// ==========================================
// 升级版重工业高精度多层展台基座
// ==========================================
function ZoneBase({ intensity, accent = SIGNAL, motionEnabled = true }: { intensity: number; accent?: string; motionEnabled?: boolean }) {
  const gearRingRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (gearRingRef.current && motionEnabled) {
      gearRingRef.current.rotation.z += delta * 0.2 * (intensity > 1 ? 1.5 : 1);
    }
  });

  return (
    <group>
      {/* 1. 八角重型合金主基台 */}
      <mesh position={[0, 0.09, 0]} receiveShadow geometry={baseOctagonGeo}>
        <meshStandardMaterial color={STEEL_DARK} metalness={0.92} roughness={0.25} emissive={accent} emissiveIntensity={0.08 * intensity} />
      </mesh>

      {/* 2. 顶部钛合金防滑内嵌台面 */}
      <mesh position={[0, 0.19, 0]} receiveShadow geometry={baseTopPlateGeo}>
        <meshStandardMaterial color={STEEL_MID} metalness={0.88} roughness={0.3} />
      </mesh>

      {/* 3. 内嵌双发光刻度环 */}
      <mesh position={[0, 0.215, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={baseRingInnerGeo}>
        <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.35 + intensity * 0.45} />
      </mesh>
      <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={baseRingOuterGeo}>
        <meshBasicMaterial color={accent} wireframe toneMapped={false} transparent opacity={0.2 + intensity * 0.3} />
      </mesh>

      {/* 4. 缓慢旋转外圈刻度齿轮环 */}
      <mesh ref={gearRingRef} position={[0, 0.225, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={baseGearTorusGeo}>
        <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.4 + intensity * 0.4} />
      </mesh>

      {/* 5. 四角减震定位角标 */}
      {[-1.85, 1.85].flatMap((x) => [-1.85, 1.85].map((z) => (
        <mesh key={`${x}-${z}`} position={[x * 0.78, 0.2, z * 0.78]} geometry={baseCornerBlockGeo}>
          <meshStandardMaterial color={STEEL_LIGHT} metalness={0.9} emissive={accent} emissiveIntensity={0.3 * intensity} />
        </mesh>
      )))}

      {/* 6. 四边发光散热格栅条 */}
      {[
        [0, 0.14, 2.2, 0],
        [0, 0.14, -2.2, 0],
        [2.2, 0.14, 0, Math.PI / 2],
        [-2.2, 0.14, 0, Math.PI / 2],
      ].map(([x, y, z, rot], idx) => (
        <mesh key={idx} position={[x, y, z]} rotation={[0, rot, 0]} geometry={baseVentGeo}>
          <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.45 + intensity * 0.35} />
        </mesh>
      ))}
    </group>
  );
}

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
    const speedMult = intensity > 1 ? 1.6 : 1;
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.6 * speedMult;
      coreRef.current.position.y = 1.35 + Math.sin(clock.elapsedTime * 2.2) * 0.06;
    }
    if (ring1Ref.current) ring1Ref.current.rotation.x += delta * 0.8 * speedMult;
    if (ring2Ref.current) ring2Ref.current.rotation.y += delta * 1.0 * speedMult;
    if (ring3Ref.current) ring3Ref.current.rotation.z -= delta * 0.9 * speedMult;
    if (shardGroupRef.current) shardGroupRef.current.rotation.y -= delta * 0.35 * speedMult;
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={CYAN} motionEnabled={motionEnabled} />

      {/* 4角高耸多租户服务计算立柱（精密工业机柜） */}
      {[-1, 1].flatMap((x) => [-1, 1].map((z) => (
        <group key={`${x}-${z}`} position={[x * 1.35, 0.22, z * 1.1]}>
          <mesh position={[0, 0.88, 0]} castShadow geometry={corePillarMainGeo}>
            <meshStandardMaterial color={STEEL_MID} metalness={0.92} roughness={0.2} emissive={CYAN} emissiveIntensity={0.15 * intensity} />
          </mesh>
          {/* 散热片与立柱顶盖 */}
          {[0.3, 0.7, 1.1, 1.5].map((y, fIdx) => (
            <mesh key={fIdx} position={[0, y, 0]} geometry={corePillarFinGeo}>
              <meshStandardMaterial color={STEEL_DARK} metalness={0.8} />
            </mesh>
          ))}
          <mesh position={[0, 1.82, 0]} geometry={corePillarSpireGeo}>
            <meshBasicMaterial color={CYAN} toneMapped={false} />
          </mesh>
          {/* 垂直高亮激光线 */}
          <mesh position={[0, 0.88, 0.16]}>
            <boxGeometry args={[0.04, 1.55, 0.02]} />
            <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.7 + intensity * 0.3} />
          </mesh>
        </group>
      )))}

      {/* 中央悬浮超导八面体晶核（Seata 事务与两级缓存协调中枢） */}
      <group position={[0, 1.35, 0]}>
        <group ref={coreRef}>
          {/* 外壳晶体 */}
          <mesh geometry={coreOctaOuterGeo}>
            <meshStandardMaterial color={STEEL_DARK} metalness={0.9} roughness={0.1} emissive={CYAN} emissiveIntensity={1.1 * intensity} />
          </mesh>
          {/* 内部高亮发光内胆 */}
          <mesh geometry={coreOctaInnerGeo}>
            <meshBasicMaterial color={CYAN} toneMapped={false} />
          </mesh>
          {/* 外部线框网格 */}
          <mesh geometry={coreOctaWireGeo}>
            <meshBasicMaterial color={SAFETY} wireframe toneMapped={false} transparent opacity={0.5 + intensity * 0.4} />
          </mesh>
        </group>

        {/* 3层嵌套双轴陀螺万向环 */}
        <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]} geometry={coreGimbalRing1Geo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.55 + intensity * 0.4} />
        </mesh>
        <mesh ref={ring2Ref} rotation={[0, Math.PI / 3, 0]} geometry={coreGimbalRing2Geo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} transparent opacity={0.5 + intensity * 0.4} />
        </mesh>
        <mesh ref={ring3Ref} rotation={[0, 0, Math.PI / 4]} geometry={coreGimbalRing3Geo}>
          <meshBasicMaterial color={GOLD} toneMapped={false} transparent opacity={0.45 + intensity * 0.4} />
        </mesh>

        {/* 上下聚能电极柱与激光光针 */}
        <mesh position={[0, 1.05, 0]} rotation={[Math.PI, 0, 0]} geometry={coreElectrodeGeo}>
          <meshStandardMaterial color={STEEL_LIGHT} metalness={0.92} emissive={CYAN} emissiveIntensity={0.5 * intensity} />
        </mesh>
        <mesh position={[0, -1.05, 0]} geometry={coreElectrodeGeo}>
          <meshStandardMaterial color={STEEL_LIGHT} metalness={0.92} emissive={CYAN} emissiveIntensity={0.5 * intensity} />
        </mesh>
      </group>

      {/* 环绕多阶数据分片池（Sharding 分库分表数据切片） */}
      <group ref={shardGroupRef} position={[0, 1.35, 0]}>
        {[0, 1, 2, 3, 4, 5].map((idx) => {
          const angle = (idx / 6) * Math.PI * 2;
          return (
            <group key={idx} position={[Math.cos(angle) * 1.7, Math.sin(angle * 3) * 0.22, Math.sin(angle) * 1.7]}>
              <mesh geometry={coreShardBoxGeo}>
                <meshStandardMaterial color={STEEL_LIGHT} metalness={0.9} emissive={idx % 2 === 0 ? CYAN : SAFETY} emissiveIntensity={0.45 * intensity} />
              </mesh>
              <mesh position={[0, 0, 0.1]}>
                <boxGeometry args={[0.16, 0.03, 0.02]} />
                <meshBasicMaterial color={CYAN} toneMapped={false} />
              </mesh>
            </group>
          );
        })}
      </group>

      {intensity > 0.8 && (
        <pointLight position={[0, 1.4, 0]} color={CYAN} intensity={14} distance={8} decay={2} />
      )}
      <FlowPulses start={[-1.35, 1.8, -1.1]} end={[0, 1.35, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.35, 1.8, 1.1]} end={[0, 1.35, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}

// ==========================================
// 2. Litree AIoT 协议引擎与空间拓扑 (Protocol & GIS Zone)
// ==========================================
function LitreeAiotZone({ intensity, motionEnabled }: ZoneProps) {
  const radarRef = useRef<THREE.Group>(null);
  const links = useMemo(() => [
    [-1.35, -0.65, -0.45, -0.65],
    [-0.45, -0.65, -0.45, 0.45],
    [-0.45, 0.45, 0.55, 0.45],
    [0.55, 0.45, 0.55, -0.85],
    [0.55, -0.85, 1.45, -0.85],
    [0.55, 0.45, 1.35, 0.95],
  ], []);

  useFrame((_, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.8 : 1;
    if (radarRef.current) radarRef.current.rotation.y += delta * 1.3 * speedMult;
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={SIGNAL} motionEnabled={motionEnabled} />

      {/* GIS 空间六边形蜂窝多层网格底盘 */}
      <mesh position={[0, 0.24, 0]} receiveShadow geometry={gisHexPlateGeo}>
        <meshStandardMaterial color={STEEL_MID} metalness={0.9} roughness={0.25} emissive={SIGNAL} emissiveIntensity={0.12 * intensity} />
      </mesh>
      <mesh position={[0, 0.285, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={gisHexRingGeo}>
        <meshBasicMaterial color={SIGNAL} wireframe toneMapped={false} transparent opacity={0.35 + intensity * 0.45} />
      </mesh>

      {/* GIS 空间 3D 立体管网测点与高度柱（实时压力/水质指标柱） */}
      {links.map(([x1, z1, x2, z2], index) => {
        const dx = x2 - x1;
        const dz = z2 - z1;
        const length = Math.hypot(dx, dz);
        const isHigh = index % 2 === 0;
        return (
          <group key={index}>
            {/* 空间管道光纤 */}
            <mesh position={[(x1 + x2) / 2, 0.36, (z1 + z2) / 2]} rotation={[0, -Math.atan2(dz, dx), 0]}>
              <boxGeometry args={[length, 0.04, 0.05]} />
              <meshBasicMaterial color={index % 2 === 0 ? SIGNAL : CYAN} toneMapped={false} transparent opacity={0.5 + intensity * 0.4} />
            </mesh>
            {/* 3D 测点指标高立柱 */}
            <mesh position={[x1, isHigh ? 0.6 : 0.44, z1]} geometry={isHigh ? gisPillarHighGeo : gisPillarNodeGeo}>
              <meshStandardMaterial color={STEEL_DARK} metalness={0.92} emissive={CYAN} emissiveIntensity={0.35 * intensity} />
            </mesh>
            {/* 测点发光核心 */}
            <mesh position={[x1, isHigh ? 0.96 : 0.62, z1]} geometry={gisBeaconCoreGeo}>
              <meshBasicMaterial color={index === 2 ? SAFETY : SIGNAL} toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {/* AIoT 工业协议网关机柜列（多层 LED 状态面板） */}
      {[-1.4, 1.4].map((x, index) => (
        <group key={x} position={[x, 0.22, 0]}>
          <mesh position={[0, 0.88, 0]} castShadow geometry={aiotServerCabinetGeo}>
            <meshStandardMaterial color={STEEL_MID} metalness={0.94} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.88, 0.35]} geometry={aiotCabinetDoorGeo}>
            <meshStandardMaterial color={STEEL_DARK} metalness={0.9} />
          </mesh>
          {/* 阵列式机架状态 LED 屏 */}
          {[0.35, 0.65, 0.95, 1.25, 1.55].map((y, ledIdx) => (
            <group key={ledIdx} position={[0, y, 0.37]}>
              <mesh>
                <boxGeometry args={[0.3, 0.05, 0.02]} />
                <meshBasicMaterial color={ledIdx % 2 === 0 ? SIGNAL : CYAN} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* 空间雷达天线旋转扫描总成（15km 缓冲区与 BFS 拓扑追踪） */}
      <group position={[0, 0.24, 0]}>
        <mesh position={[0, 1.05, 0]} geometry={radarMastPillarGeo}>
          <meshStandardMaterial color={STEEL_LIGHT} metalness={0.92} />
        </mesh>
        <group ref={radarRef} position={[0, 2.1, 0]}>
          <mesh rotation={[Math.PI / 3.5, 0, 0]} geometry={radarDishPlateGeo}>
            <meshStandardMaterial color={STEEL_DARK} metalness={0.88} emissive={SIGNAL} emissiveIntensity={0.65 * intensity} />
          </mesh>
          <mesh position={[0, 0.1, 0.22]} rotation={[Math.PI / 3.5, 0, 0]} geometry={radarFeedHornGeo}>
            <meshBasicMaterial color={CYAN} toneMapped={false} />
          </mesh>
          {/* 大角度半透明动态扫描扇面 */}
          <mesh position={[0, -0.22, 0.9]} rotation={[Math.PI / 2, 0, 0]} geometry={radarSweepFanGeo}>
            <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.3 + intensity * 0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      <FlowPulses start={[-1.4, 1.2, 0]} end={[0, 2.1, 0]} color={SIGNAL} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.4, 1.2, 0]} end={[0, 2.1, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
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
    const speedMult = intensity > 1 ? 1.7 : 1;
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.7 * speedMult;
      coreRef.current.rotation.x += delta * 0.4 * speedMult;
      coreRef.current.position.y = 1.5 + Math.sin(clock.elapsedTime * 2.5) * 0.08;
    }
    if (orbitXRef.current) orbitXRef.current.rotation.x += delta * 0.9 * speedMult;
    if (orbitYRef.current) orbitYRef.current.rotation.y += delta * 1.2 * speedMult;
    if (orbitZRef.current) orbitZRef.current.rotation.z -= delta * 1.0 * speedMult;
    if (satelliteGroupRef.current) satelliteGroupRef.current.rotation.y -= delta * 0.6 * speedMult;
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={PURPLE} motionEnabled={motionEnabled} />

      {/* 中央 ReAct AI 神经网络推理决策核心 */}
      <group position={[0, 1.5, 0]}>
        <group ref={coreRef}>
          {/* 正二十面体核心 */}
          <mesh geometry={agentIcosaMainGeo}>
            <meshStandardMaterial color={STEEL_DARK} metalness={0.9} roughness={0.1} emissive={PURPLE} emissiveIntensity={1.3 * intensity} />
          </mesh>
          <mesh geometry={agentIcosaInnerGeo}>
            <meshBasicMaterial color={CYAN} toneMapped={false} />
          </mesh>
          {/* 线框思维链 */}
          <mesh geometry={agentIcosaWireGeo}>
            <meshBasicMaterial color={SAFETY} wireframe toneMapped={false} transparent opacity={0.55 + intensity * 0.45} />
          </mesh>
        </group>

        {/* 3轴陀螺仪任务编排星环 */}
        <mesh ref={orbitXRef} rotation={[0, 0, Math.PI / 4]} geometry={agentOrbitTorusXGeo}>
          <meshBasicMaterial color={PURPLE} toneMapped={false} transparent opacity={0.6 + intensity * 0.4} />
        </mesh>
        <mesh ref={orbitYRef} rotation={[Math.PI / 3, 0, 0]} geometry={agentOrbitTorusYGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.55 + intensity * 0.4} />
        </mesh>
        <mesh ref={orbitZRef} rotation={[0, Math.PI / 4, 0]} geometry={agentOrbitTorusZGeo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} transparent opacity={0.5 + intensity * 0.4} />
        </mesh>
      </group>

      {/* 环绕多智能体工作决策卫星（Tool Calling: DB / 工单 / Docker 沙箱 / IM 消息） */}
      <group ref={satelliteGroupRef} position={[0, 1.5, 0]}>
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, idx) => (
          <group key={idx} position={[Math.cos(angle) * 1.65, Math.sin(angle * 3) * 0.32, Math.sin(angle) * 1.65]}>
            <mesh geometry={agentSatelliteBodyGeo}>
              <meshStandardMaterial color={STEEL_LIGHT} metalness={0.92} emissive={idx % 2 === 0 ? CYAN : GOLD} emissiveIntensity={0.8 * intensity} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <torusGeometry args={[0.24, 0.015, 6, 20]} />
              <meshBasicMaterial color={PURPLE} toneMapped={false} transparent opacity={0.7} />
            </mesh>
          </group>
        ))}
      </group>

      {intensity > 0.8 && (
        <pointLight position={[0, 1.6, 0]} color={PURPLE} intensity={16} distance={9} decay={2} />
      )}
      <FlowPulses start={[-1.3, 1.1, -1.05]} end={[0, 1.5, 0]} color={PURPLE} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.3, 1.1, 1.05]} end={[0, 1.5, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}

function LitreeOaZone({ intensity, motionEnabled }: ZoneProps) {
  const hubRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.5 : 1;
    if (hubRef.current) hubRef.current.rotation.y += delta * 0.45 * speedMult;
    if (ringRef.current) ringRef.current.rotation.z -= delta * 0.7 * speedMult;
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={SIGNAL} motionEnabled={motionEnabled} />
      {[[-1.3, -1.05], [1.3, -1.05], [-1.3, 1.05], [1.3, 1.05]].map(([x, z], idx) => (
        <group key={idx} position={[x, 0.22, z]}>
          <mesh position={[0, 0.48, 0]} castShadow geometry={agentMiddlePlatformGeo}>
            <meshStandardMaterial color={STEEL_MID} metalness={0.92} roughness={0.2} emissive={idx % 2 === 0 ? SIGNAL : GOLD} emissiveIntensity={0.28 * intensity} />
          </mesh>
          <mesh position={[0, 1.08, 0]} geometry={agentFloatingGemGeo}>
            <meshBasicMaterial color={idx % 2 === 0 ? CYAN : GOLD} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <group ref={hubRef} position={[0, 1.35, 0]}>
        <mesh geometry={oaHubCubeGeo}>
          <meshStandardMaterial color={STEEL_DARK} metalness={0.9} roughness={0.16} emissive={SIGNAL} emissiveIntensity={0.7 * intensity} />
        </mesh>
        <mesh geometry={oaHubInnerGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} />
        </mesh>
      </group>
      <mesh ref={ringRef} position={[0, 1.35, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={oaStateRingGeo}>
        <meshBasicMaterial color={GOLD} toneMapped={false} transparent opacity={0.55 + intensity * 0.35} />
      </mesh>
      <mesh position={[0, 0.62, 0]} geometry={oaSyncBridgeGeo}>
        <meshStandardMaterial color={STEEL_LIGHT} metalness={0.88} emissive={SIGNAL} emissiveIntensity={0.35 * intensity} />
      </mesh>
      {intensity > 0.8 && <pointLight position={[0, 1.5, 0]} color={SIGNAL} intensity={12} distance={8} decay={2} />}
      <FlowPulses start={[-1.3, 1.1, -1.05]} end={[0, 1.35, 0]} color={SIGNAL} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.3, 1.1, 1.05]} end={[0, 1.35, 0]} color={GOLD} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}

// ==========================================
// 4. WeLink 统一搜索与个性化打分引擎 (Search Zone)
// ==========================================
function WelinkSearchZone({ intensity, motionEnabled }: ZoneProps) {
  const prismRef = useRef<THREE.Mesh>(null);
  const scannerRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.6 : 1;
    if (prismRef.current) {
      prismRef.current.rotation.y += delta * 1.0 * speedMult;
      prismRef.current.position.y = 2.05 + Math.sin(clock.elapsedTime * 2.8) * 0.09;
    }
    if (scannerRef.current) {
      scannerRef.current.position.y = 0.55 + Math.sin(clock.elapsedTime * 3.2) * 0.5;
    }
    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = 0.18 + Math.sin(clock.elapsedTime * 3) * 0.08;
    }
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={SAFETY} motionEnabled={motionEnabled} />

      {/* 4联分布式 ES 搜索服务器机柜阵列（带抽屉导轨与指示灯） */}
      {[-1.35, -0.45, 0.45, 1.35].map((x, index) => (
        <group key={x} position={[x, 0.22, index % 2 === 0 ? 0.18 : -0.18]}>
          <mesh position={[0, 0.85, 0]} castShadow geometry={searchCabinetRackGeo}>
            <meshStandardMaterial color={index % 2 === 0 ? '#1b262c' : STEEL_MID} metalness={0.92} roughness={0.2} emissive={CYAN} emissiveIntensity={0.08 * intensity} />
          </mesh>
          {/* 独立服务器抽屉面板 */}
          {[0.25, 0.55, 0.85, 1.15, 1.45].map((y, trayIdx) => (
            <group key={trayIdx} position={[0, y, 0.33]}>
              <mesh geometry={searchServerTrayGeo}>
                <meshStandardMaterial color={STEEL_DARK} metalness={0.9} />
              </mesh>
              <mesh position={[0.12, 0, 0.02]}>
                <boxGeometry args={[0.06, 0.03, 0.01]} />
                <meshBasicMaterial color={trayIdx % 2 === 0 ? SAFETY : CYAN} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* 悬浮倒金字塔多维打分分发棱镜 */}
      <mesh ref={prismRef} position={[0, 2.05, 0]} rotation={[Math.PI, 0, 0]} geometry={searchPrismCrystalGeo}>
        <meshStandardMaterial color={STEEL_DARK} metalness={0.9} roughness={0.12} emissive={GOLD} emissiveIntensity={1.2 * intensity} />
      </mesh>

      {/* 打分向下投射的半透明光锥 */}
      <mesh ref={beamRef} position={[0, 1.45, 0]} rotation={[Math.PI, 0, 0]} geometry={searchBeamConeGeo}>
        <meshBasicMaterial color={GOLD} transparent opacity={0.2} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* 动态水平切片扫描激光 */}
      <group ref={scannerRef} position={[0, 0.85, 0]}>
        <mesh geometry={searchScannerBarGeo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} transparent opacity={0.75 + intensity * 0.25} />
        </mesh>
      </group>

      {/* 悬浮倒排索引分片数据块 */}
      {[-1.05, 0.0, 1.05].map((x, idx) => (
        <mesh key={idx} position={[x, 1.55, 0.5]} geometry={searchIndexCubeGeo}>
          <meshStandardMaterial color={STEEL_LIGHT} metalness={0.88} emissive={CYAN} emissiveIntensity={0.5 * intensity} />
        </mesh>
      ))}

      {intensity > 0.8 && (
        <pointLight position={[0, 2.1, 0]} color={GOLD} intensity={12} distance={7} decay={2} />
      )}
      <FlowPulses start={[-1.75, 0.4, 0]} end={[0, 2.05, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.75, 0.4, 0]} end={[0, 2.05, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}

// ==========================================
// 5. WeLink 双路数据湖管道与版本一致性治理 (Lake Zone)
// ==========================================
function WelinkDataLakeZone({ intensity, motionEnabled }: ZoneProps) {
  const helixLeftRef = useRef<THREE.Group>(null);
  const helixRightRef = useRef<THREE.Group>(null);
  const crystalRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.7 : 1;
    if (helixLeftRef.current) helixLeftRef.current.rotation.y += delta * 1.8 * speedMult;
    if (helixRightRef.current) helixRightRef.current.rotation.y -= delta * 1.5 * speedMult;
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.9 * speedMult;
      crystalRef.current.rotation.x += delta * 0.5 * speedMult;
    }
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={CYAN} motionEnabled={motionEnabled} />

      {/* 左柱：Flink 实时流式管道反应柱（透明防护管 + 内部双螺旋） */}
      <group position={[-1.0, 0.22, 0]}>
        <mesh position={[0, 0.95, 0]} castShadow geometry={lakeReactorTubeGeo}>
          <meshStandardMaterial color={STEEL_DARK} metalness={0.9} roughness={0.2} transparent opacity={0.65} emissive={CYAN} emissiveIntensity={0.15 * intensity} />
        </mesh>
        {/* 内部旋转流动线圈 */}
        <group ref={helixLeftRef} position={[0, 0.95, 0]}>
          {[-0.6, -0.2, 0.2, 0.6].map((y, cIdx) => (
            <mesh key={cIdx} position={[0, y, 0]} geometry={lakeHelixCoilGeo}>
              <meshBasicMaterial color={CYAN} wireframe toneMapped={false} transparent opacity={0.65 + intensity * 0.35} />
            </mesh>
          ))}
        </group>
        <mesh position={[0, 1.9, 0]} geometry={lakeCapHeavyGeo}>
          <meshStandardMaterial color={STEEL_MID} metalness={0.95} emissive={CYAN} emissiveIntensity={0.6 * intensity} />
        </mesh>
        <mesh position={[0, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={lakeFlowRingGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} />
        </mesh>
      </group>

      {/* 右柱：Spark 批处理离线计算反应柱（活力橙双螺旋） */}
      <group position={[1.0, 0.22, 0]}>
        <mesh position={[0, 0.95, 0]} castShadow geometry={lakeReactorTubeGeo}>
          <meshStandardMaterial color={STEEL_DARK} metalness={0.9} roughness={0.2} transparent opacity={0.65} emissive={SAFETY} emissiveIntensity={0.15 * intensity} />
        </mesh>
        <group ref={helixRightRef} position={[0, 0.95, 0]}>
          {[-0.6, -0.2, 0.2, 0.6].map((y, cIdx) => (
            <mesh key={cIdx} position={[0, y, 0]} geometry={lakeHelixCoilGeo}>
              <meshBasicMaterial color={SAFETY} wireframe toneMapped={false} transparent opacity={0.65 + intensity * 0.35} />
            </mesh>
          ))}
        </group>
        <mesh position={[0, 1.9, 0]} geometry={lakeCapHeavyGeo}>
          <meshStandardMaterial color={STEEL_MID} metalness={0.95} emissive={SAFETY} emissiveIntensity={0.6 * intensity} />
        </mesh>
        <mesh position={[0, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={lakeFlowRingGeo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} />
        </mesh>
      </group>

      {/* 中央 ACID 版本治理协调桥与锁晶体 */}
      <group position={[0, 1.15, 0]}>
        <mesh geometry={lakeBridgeTrussGeo}>
          <meshStandardMaterial color={STEEL_DARK} metalness={0.92} roughness={0.15} emissive={SIGNAL} emissiveIntensity={0.35 * intensity} />
        </mesh>
        <mesh ref={crystalRef} position={[0, 0.42, 0]} geometry={lakeAcidPrismGeo}>
          <meshStandardMaterial color={STEEL_DARK} metalness={0.9} emissive={GOLD} emissiveIntensity={1.3 * intensity} />
        </mesh>
      </group>

      {intensity > 0.8 && (
        <pointLight position={[0, 1.4, 0]} color={CYAN} intensity={12} distance={7} decay={2} />
      )}
      <FlowPulses start={[-1.0, 1.85, 0]} end={[1.0, 1.85, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.0, 0.45, 0]} end={[-1.0, 0.45, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}

// ==========================================
// 6. 森格实时通信网关与告警风暴治理 (Gateway Zone)
// ==========================================
function SengeGatewayZone({ intensity, motionEnabled }: ZoneProps) {
  const wavesRef = useRef<THREE.Group>(null);
  const dishGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.8 : 1;
    if (dishGroupRef.current) dishGroupRef.current.rotation.y += delta * 0.8 * speedMult;
    if (wavesRef.current) {
      wavesRef.current.children.forEach((child, idx) => {
        const time = clock.elapsedTime * 2.0 + idx * 1.1;
        const scale = 0.5 + (time % 2.6) * 0.85;
        child.scale.set(scale, scale, scale);
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (mat) mat.opacity = Math.max(0, 0.75 - scale * 0.26) * intensity;
      });
    }
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={SAFETY} motionEnabled={motionEnabled} />

      {/* Netty 高并发通信矩阵底座节点（环形 6 节点集群） */}
      {[0, 1, 2, 3, 4, 5].map((idx) => {
        const angle = (idx / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 1.25;
        const z = Math.sin(angle) * 1.25;
        return (
          <group key={idx} position={[x, 0.22, z]}>
            <mesh position={[0, 0.22, 0]} geometry={gatewayComputePodGeo}>
              <meshStandardMaterial color={STEEL_MID} metalness={0.92} emissive={idx % 2 === 0 ? SAFETY : CYAN} emissiveIntensity={0.3 * intensity} />
            </mesh>
            <mesh position={[0, 0.43, 0]}>
              <boxGeometry args={[0.2, 0.04, 0.2]} />
              <meshBasicMaterial color={SAFETY} toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {/* 中央通信重型铁塔与微波天线阵列 */}
      <group position={[0, 0.22, 0]}>
        <mesh position={[0, 1.2, 0]} castShadow geometry={gatewayTowerPillarGeo}>
          <meshStandardMaterial color={STEEL_MID} metalness={0.94} roughness={0.2} emissive={SAFETY} emissiveIntensity={0.2 * intensity} />
        </mesh>
        {/* 桁架十字交叉横担 */}
        {[0.9, 1.5, 2.0].map((y, tIdx) => (
          <mesh key={tIdx} position={[0, y, 0]} geometry={gatewayTrussCrossGeo}>
            <meshStandardMaterial color={STEEL_LIGHT} metalness={0.9} />
          </mesh>
        ))}
        {/* 塔顶 4 向微波天线 */}
        <group ref={dishGroupRef} position={[0, 2.25, 0]}>
          {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, idx) => (
            <mesh key={idx} position={[Math.cos(angle) * 0.38, 0, Math.sin(angle) * 0.38]} rotation={[0, -angle + Math.PI / 2, Math.PI / 4]} geometry={gatewayMicrowaveDishGeo}>
              <meshStandardMaterial color={STEEL_DARK} metalness={0.88} emissive={SAFETY} emissiveIntensity={0.6 * intensity} />
            </mesh>
          ))}
          {/* 避雷高频探针 */}
          <mesh position={[0, 0.35, 0]} geometry={gatewayLightningRodGeo}>
            <meshBasicMaterial color={CYAN} toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* 电磁波辐射扩散环（突发告警风暴滑动窗口平滑与抑制） */}
      <group ref={wavesRef} position={[0, 2.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        {[0, 1, 2].map((idx) => (
          <mesh key={idx} geometry={gatewayPulseWaveTorusGeo}>
            <meshBasicMaterial color={SAFETY} toneMapped={false} transparent opacity={0.6} />
          </mesh>
        ))}
      </group>

      {intensity > 0.8 && (
        <pointLight position={[0, 2.3, 0]} color={SAFETY} intensity={14} distance={8} decay={2} />
      )}
      <FlowPulses start={[-1.4, 0.4, 0]} end={[0, 2.25, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.4, 0.4, 0]} end={[0, 2.25, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}

// ==========================================
// 7. 森格智慧水务平台 0-1 架构底座与容器化交付 (Platform Zone)
// ==========================================
function SengePlatformZone({ intensity, motionEnabled }: ZoneProps) {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const valveRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.6 : 1;
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.5 * speedMult;
    if (ring2Ref.current) ring2Ref.current.rotation.z -= delta * 0.7 * speedMult;
    if (valveRef.current) valveRef.current.rotation.z -= delta * 1.4 * speedMult;
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={SIGNAL} motionEnabled={motionEnabled} />

      {/* 3层阶梯式云原生容器 Pod 集群模块（设备中台 / 告警引擎 / 运维中枢） */}
      {[
        [-0.8, 0.32, -0.4, STEEL_MID],
        [0.8, 0.32, -0.4, '#1e2c33'],
        [0, 0.8, 0.4, STEEL_LIGHT],
      ].map(([x, y, z, color], idx) => (
        <group key={idx} position={[x as number, y as number, z as number]}>
          <mesh castShadow geometry={platformK8sPodGeo}>
            <meshStandardMaterial color={color as string} metalness={0.92} roughness={0.2} emissive={SIGNAL} emissiveIntensity={0.18 * intensity} />
          </mesh>
          <mesh position={[0, 0.22, 0]} geometry={platformPodFrameOuterGeo}>
            <meshBasicMaterial color={idx === 2 ? SAFETY : SIGNAL} toneMapped={false} transparent opacity={0.6 + intensity * 0.4} />
          </mesh>
        </group>
      ))}

      {/* 工业流体管路、法兰与旋转控制阀门总成 */}
      <group position={[0, 0.5, -0.85]}>
        <mesh rotation={[0, 0, Math.PI / 2]} geometry={platformPipeMainGeo}>
          <meshStandardMaterial color={STEEL_LIGHT} metalness={0.95} roughness={0.18} emissive={SAFETY} emissiveIntensity={0.18 * intensity} />
        </mesh>
        {[-0.6, 0.6].map((px) => (
          <mesh key={px} position={[px, 0, 0]} rotation={[0, 0, Math.PI / 2]} geometry={platformPipeFlangeGeo}>
            <meshStandardMaterial color={STEEL_MID} metalness={0.9} />
          </mesh>
        ))}
        <mesh ref={valveRef} position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} geometry={platformValveWheelGeo}>
          <meshStandardMaterial color={SAFETY} metalness={0.85} emissive={SAFETY} emissiveIntensity={0.5 * intensity} />
        </mesh>
      </group>

      {/* 顶部服务网格双交错旋转负载均衡光环 */}
      <group position={[0, 1.55, 0]}>
        <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]} geometry={platformDualRing1Geo}>
          <meshBasicMaterial color={SIGNAL} wireframe toneMapped={false} transparent opacity={0.45 + intensity * 0.45} />
        </mesh>
        <mesh ref={ring2Ref} rotation={[Math.PI / 2.2, 0.3, 0]} geometry={platformDualRing2Geo}>
          <meshBasicMaterial color={CYAN} wireframe toneMapped={false} transparent opacity={0.35 + intensity * 0.4} />
        </mesh>
      </group>

      {/* 双向全息遥测态势监控看板 */}
      {[-0.9, 0.9].map((x, idx) => (
        <mesh key={idx} position={[x, 1.25, 0.7]} rotation={[-0.2, idx === 0 ? 0.35 : -0.35, 0]} geometry={platformTelemetryScreenGeo}>
          <meshBasicMaterial color={CYAN} wireframe toneMapped={false} transparent opacity={0.45 + intensity * 0.45} />
        </mesh>
      ))}

      {intensity > 0.8 && (
        <pointLight position={[0, 1.6, 0]} color={SIGNAL} intensity={12} distance={8} decay={2} />
      )}
      <FlowPulses start={[-1.4, 0.5, -0.85]} end={[1.4, 0.5, -0.85]} color={SIGNAL} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[0, 0.95, 0.4]} end={[0, 1.55, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={3} />
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
}: {
  activeExhibit: string | null;
  motionEnabled: boolean;
  onSelectExhibit?: (id: string) => void;
}) {
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
