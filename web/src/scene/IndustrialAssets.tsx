import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { EXHIBITS, ExhibitLayout, getZoneFocus } from './scene-layout';

const SIGNAL = '#00a89d';
const CYAN = '#28d7e5';
const SAFETY = '#ff6b3d';
const STEEL = '#304149';
const STEEL_LIGHT = '#4a626c';
const DARK = '#0a1419';
const GOLD = '#f5a623';

// 共享几何体池
const baseCylinderGeo = new THREE.CylinderGeometry(2.35, 2.55, 0.16, 16);
const baseTorusGeo = new THREE.TorusGeometry(2.05, 0.028, 8, 64);
const baseOuterRingGeo = new THREE.RingGeometry(2.1, 2.3, 32);
const pulseSphereGeo = new THREE.SphereGeometry(0.055, 8, 8);

// Litree Overview 几何体
const corePillarGeo = new THREE.BoxGeometry(0.22, 1.65, 0.22);
const corePillarCapGeo = new THREE.BoxGeometry(0.28, 0.08, 0.28);
const coreOctahedronGeo = new THREE.OctahedronGeometry(0.55, 0);
const coreOctaWireGeo = new THREE.OctahedronGeometry(0.72, 0);
const coreGimbalOuterGeo = new THREE.TorusGeometry(1.05, 0.022, 8, 48);
const coreGimbalInnerGeo = new THREE.TorusGeometry(0.82, 0.02, 8, 40);
const coreHoloDiscGeo = new THREE.RingGeometry(0.65, 1.45, 16);
const coreShardGeo = new THREE.BoxGeometry(0.18, 0.28, 0.18);

// AIoT & GIS 几何体
const protocolRackGeo = new THREE.BoxGeometry(0.38, 1.65, 0.65);
const protocolCapGeo = new THREE.BoxGeometry(0.44, 0.08, 0.72);
const gisRingGeo = new THREE.RingGeometry(0.75, 1.85, 6);
const gisNodeGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.14, 10);
const gisNodeCoreGeo = new THREE.SphereGeometry(0.08, 8, 8);
const radarMastGeo = new THREE.CylinderGeometry(0.035, 0.065, 1.85, 12);
const radarDishGeo = new THREE.ConeGeometry(0.32, 0.18, 12);
const radarSweepGeo = new THREE.CylinderGeometry(0.01, 1.75, 0.02, 12, 1, true, 0, Math.PI / 3);

// Agent 几何体
const agentCoreGeo = new THREE.IcosahedronGeometry(0.52, 0);
const agentWireGeo = new THREE.IcosahedronGeometry(0.68, 1);
const agentOrbitXGeo = new THREE.TorusGeometry(1.22, 0.02, 8, 56);
const agentOrbitYGeo = new THREE.TorusGeometry(1.05, 0.02, 8, 48);
const agentOrbitZGeo = new THREE.TorusGeometry(0.88, 0.018, 8, 40);
const agentSatelliteGeo = new THREE.DodecahedronGeometry(0.14, 0);
const agentPedestalGeo = new THREE.BoxGeometry(0.3, 0.85, 0.3);

// WeLink Search 几何体
const searchRackGeo = new THREE.BoxGeometry(0.38, 1.6, 0.62);
const searchLedGeo = new THREE.BoxGeometry(0.24, 0.035, 0.02);
const searchPrismGeo = new THREE.ConeGeometry(0.48, 0.72, 4);
const searchScannerGeo = new THREE.BoxGeometry(2.4, 0.025, 0.025);
const searchShardBoxGeo = new THREE.BoxGeometry(0.22, 0.12, 0.18);

// WeLink Data Lake 几何体
const lakeColumnGeo = new THREE.CylinderGeometry(0.48, 0.48, 1.7, 20);
const lakeVortexGeo = new THREE.CylinderGeometry(0.36, 0.36, 1.4, 16);
const lakeCapGeo = new THREE.CylinderGeometry(0.54, 0.54, 0.12, 20);
const lakeBridgeGeo = new THREE.BoxGeometry(1.2, 0.14, 0.28);
const lakeAcidCrystalGeo = new THREE.OctahedronGeometry(0.22, 0);
const lakeRingGeo = new THREE.TorusGeometry(0.62, 0.022, 8, 32);

// Senge Gateway 几何体
const gatewayMastGeo = new THREE.CylinderGeometry(0.08, 0.16, 2.2, 16);
const gatewayCrossArmGeo = new THREE.BoxGeometry(1.35, 0.04, 0.04);
const gatewayDishGeo = new THREE.ConeGeometry(0.2, 0.12, 12);
const gatewayPulseWaveGeo = new THREE.TorusGeometry(1.3, 0.025, 6, 48);
const gatewayMatrixNodeGeo = new THREE.BoxGeometry(0.22, 0.32, 0.22);

// Senge Platform 几何体
const platformPodGeo = new THREE.BoxGeometry(0.82, 0.38, 0.68);
const platformPodFrameGeo = new THREE.BoxGeometry(0.86, 0.04, 0.72);
const platformMeshRingGeo = new THREE.TorusGeometry(1.45, 0.026, 8, 56);
const platformPipeGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.9, 12);
const platformValveGeo = new THREE.TorusGeometry(0.14, 0.035, 8, 20);
const platformHoloPanelGeo = new THREE.PlaneGeometry(0.52, 0.32);

interface ZoneProps {
  exhibit: ExhibitLayout;
  intensity: number;
  motionEnabled: boolean;
}

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
      const next = (value + delta * (0.15 + index * 0.012)) % 1;
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

function ZoneBase({ intensity, accent = SIGNAL }: { intensity: number; accent?: string }) {
  return (
    <group>
      <mesh position={[0, 0.08, 0]} receiveShadow geometry={baseCylinderGeo}>
        <meshStandardMaterial color={DARK} metalness={0.86} roughness={0.28} emissive={accent} emissiveIntensity={0.06 * intensity} />
      </mesh>
      <mesh position={[0, 0.175, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={baseTorusGeo}>
        <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.25 + intensity * 0.45} />
      </mesh>
      <mesh position={[0, 0.185, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={baseOuterRingGeo}>
        <meshBasicMaterial color={accent} wireframe toneMapped={false} transparent opacity={0.12 + intensity * 0.22} />
      </mesh>
    </group>
  );
}

// 1. Litree 架构底座与微服务治理 (Core Zone)
function LitreeOverviewCoreZone({ intensity, motionEnabled }: ZoneProps) {
  const coreRef = useRef<THREE.Group>(null);
  const gimbalOuterRef = useRef<THREE.Mesh>(null);
  const gimbalInnerRef = useRef<THREE.Mesh>(null);
  const shardGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.6 : 1;
    if (coreRef.current) coreRef.current.rotation.y += delta * 0.5 * speedMult;
    if (gimbalOuterRef.current) gimbalOuterRef.current.rotation.x += delta * 0.7 * speedMult;
    if (gimbalInnerRef.current) gimbalInnerRef.current.rotation.z -= delta * 0.85 * speedMult;
    if (shardGroupRef.current) shardGroupRef.current.rotation.y -= delta * 0.3 * speedMult;
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={CYAN} />

      {/* 4角高耸服务计算立柱 */}
      {[-1, 1].flatMap((x) => [-1, 1].map((z) => (
        <group key={`${x}-${z}`} position={[x * 1.35, 0.82, z * 1.1]}>
          <mesh castShadow geometry={corePillarGeo}>
            <meshStandardMaterial color={STEEL} metalness={0.92} roughness={0.2} emissive={CYAN} emissiveIntensity={0.15 * intensity} />
          </mesh>
          <mesh position={[0, 0.85, 0]} geometry={corePillarCapGeo}>
            <meshStandardMaterial color={DARK} metalness={0.8} emissive={CYAN} emissiveIntensity={0.4 * intensity} />
          </mesh>
          <mesh position={[0, 0, 0.12]}>
            <boxGeometry args={[0.04, 1.45, 0.02]} />
            <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.6 + intensity * 0.3} />
          </mesh>
        </group>
      )))}

      {/* 悬浮微服务能量中枢 */}
      <group position={[0, 1.25, 0]}>
        <group ref={coreRef}>
          <mesh geometry={coreOctahedronGeo}>
            <meshStandardMaterial color={DARK} metalness={0.8} roughness={0.15} emissive={CYAN} emissiveIntensity={0.9 * intensity} />
          </mesh>
          <mesh geometry={coreOctaWireGeo}>
            <meshBasicMaterial color={CYAN} wireframe toneMapped={false} transparent opacity={0.4 + intensity * 0.4} />
          </mesh>
        </group>

        {/* 嵌套双轴万向环 */}
        <mesh ref={gimbalOuterRef} rotation={[Math.PI / 4, 0, 0]} geometry={coreGimbalOuterGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.45 + intensity * 0.45} />
        </mesh>
        <mesh ref={gimbalInnerRef} rotation={[0, 0, Math.PI / 3]} geometry={coreGimbalInnerGeo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} transparent opacity={0.4 + intensity * 0.4} />
        </mesh>

        {/* 顶部全息光盘 */}
        <mesh position={[0, 0.95, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={coreHoloDiscGeo}>
          <meshBasicMaterial color={CYAN} wireframe toneMapped={false} transparent opacity={0.25 + intensity * 0.35} />
        </mesh>
      </group>

      {/* 环绕数据分片 */}
      <group ref={shardGroupRef} position={[0, 1.25, 0]}>
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, idx) => (
          <mesh key={idx} position={[Math.cos(angle) * 1.6, Math.sin(angle * 2) * 0.2, Math.sin(angle) * 1.6]} geometry={coreShardGeo}>
            <meshStandardMaterial color={STEEL_LIGHT} metalness={0.9} emissive={idx % 2 === 0 ? CYAN : SAFETY} emissiveIntensity={0.3 * intensity} />
          </mesh>
        ))}
      </group>

      {intensity > 0.8 && (
        <pointLight position={[0, 1.3, 0]} color={CYAN} intensity={12} distance={7} decay={2} />
      )}
      <FlowPulses start={[-1.3, 1.6, -1.1]} end={[0, 1.25, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.3, 1.6, 1.1]} end={[0, 1.25, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}

// 2. Litree AIoT 协议引擎与空间拓扑 (Protocol & GIS Zone)
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
    if (radarRef.current) radarRef.current.rotation.y += delta * 1.2 * speedMult;
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={SIGNAL} />

      {/* GIS 空间六边形网格拓扑底盘 */}
      <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={gisRingGeo}>
        <meshBasicMaterial color={SIGNAL} wireframe toneMapped={false} transparent opacity={0.25 + intensity * 0.35} />
      </mesh>

      {/* GIS 拓扑测点与空间连线 */}
      {links.map(([x1, z1, x2, z2], index) => {
        const dx = x2 - x1;
        const dz = z2 - z1;
        const length = Math.hypot(dx, dz);
        return (
          <group key={index}>
            <mesh position={[(x1 + x2) / 2, 0.32, (z1 + z2) / 2]} rotation={[0, -Math.atan2(dz, dx), 0]}>
              <boxGeometry args={[length, 0.035, 0.04]} />
              <meshBasicMaterial color={index % 2 === 0 ? SIGNAL : CYAN} toneMapped={false} transparent opacity={0.4 + intensity * 0.4} />
            </mesh>
            <mesh position={[x1, 0.38, z1]} geometry={gisNodeGeo}>
              <meshStandardMaterial color={STEEL} emissive={CYAN} emissiveIntensity={0.35 * intensity} />
            </mesh>
            <mesh position={[x1, 0.48, z1]} geometry={gisNodeCoreGeo}>
              <meshBasicMaterial color={index === 2 ? SAFETY : SIGNAL} toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {/* AIoT 工业网关机柜列 */}
      {[-1.35, 1.35].map((x, index) => (
        <group key={x} position={[x, 0.22, 0]}>
          <mesh position={[0, 0.85, 0]} castShadow geometry={protocolRackGeo}>
            <meshStandardMaterial color={STEEL} metalness={0.92} roughness={0.22} />
          </mesh>
          <mesh position={[0, 1.72, 0]} geometry={protocolCapGeo}>
            <meshBasicMaterial color={index === 1 ? SAFETY : CYAN} toneMapped={false} transparent opacity={0.45 + intensity * 0.4} />
          </mesh>
          {[0.5, 0.85, 1.2, 1.55].map((y, ledIdx) => (
            <mesh key={ledIdx} position={[0, y, 0.34]} geometry={searchLedGeo}>
              <meshBasicMaterial color={ledIdx % 2 === 0 ? SIGNAL : CYAN} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 空间雷达旋转扫描探头 */}
      <group position={[0, 0.2, 0]}>
        <mesh position={[0, 0.95, 0]} geometry={radarMastGeo}>
          <meshStandardMaterial color={STEEL} metalness={0.9} />
        </mesh>
        <group ref={radarRef} position={[0, 1.85, 0]}>
          <mesh rotation={[Math.PI / 4, 0, 0]} geometry={radarDishGeo}>
            <meshStandardMaterial color={DARK} metalness={0.8} emissive={SIGNAL} emissiveIntensity={0.5 * intensity} />
          </mesh>
          <mesh position={[0, -0.2, 0.8]} rotation={[Math.PI / 2, 0, 0]} geometry={radarSweepGeo}>
            <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.25 + intensity * 0.35} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      <FlowPulses start={[-1.35, 1.1, 0]} end={[0, 1.85, 0]} color={SIGNAL} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.35, 1.1, 0]} end={[0, 1.85, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}

// 3. Litree OA 中台与 AI Agent 智能体 (Agent Zone)
function LitreeAgentZone({ intensity, motionEnabled }: ZoneProps) {
  const coreRef = useRef<THREE.Group>(null);
  const orbitXRef = useRef<THREE.Mesh>(null);
  const orbitYRef = useRef<THREE.Mesh>(null);
  const orbitZRef = useRef<THREE.Mesh>(null);
  const satelliteGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.7 : 1;
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.6 * speedMult;
      coreRef.current.rotation.x += delta * 0.3 * speedMult;
    }
    if (orbitXRef.current) orbitXRef.current.rotation.x += delta * 0.8 * speedMult;
    if (orbitYRef.current) orbitYRef.current.rotation.y += delta * 1.1 * speedMult;
    if (orbitZRef.current) orbitZRef.current.rotation.z -= delta * 0.9 * speedMult;
    if (satelliteGroupRef.current) satelliteGroupRef.current.rotation.y -= delta * 0.5 * speedMult;
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={CYAN} />

      {/* 4座分布式执行中台立柱 */}
      {[[-1.25, -1.0], [1.25, -1.0], [-1.25, 1.0], [1.25, 1.0]].map(([x, z], idx) => (
        <group key={idx} position={[x, 0.1, z]}>
          <mesh position={[0, 0.42, 0]} castShadow geometry={agentPedestalGeo}>
            <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.25} emissive={idx === 0 ? SAFETY : CYAN} emissiveIntensity={0.18 * intensity} />
          </mesh>
          <mesh position={[0, 0.88, 0]}>
            <boxGeometry args={[0.34, 0.05, 0.34]} />
            <meshBasicMaterial color={idx % 2 === 0 ? CYAN : SIGNAL} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* 中央 AI 神经网络推理核心 */}
      <group position={[0, 1.45, 0]}>
        <group ref={coreRef}>
          <mesh geometry={agentCoreGeo}>
            <meshStandardMaterial color={DARK} metalness={0.8} roughness={0.12} emissive={CYAN} emissiveIntensity={1.2 * intensity} />
          </mesh>
          <mesh geometry={agentWireGeo}>
            <meshBasicMaterial color={SAFETY} wireframe toneMapped={false} transparent opacity={0.45 + intensity * 0.45} />
          </mesh>
        </group>

        {/* 3轴陀螺仪任务编排轨道 */}
        <mesh ref={orbitXRef} rotation={[0, 0, Math.PI / 4]} geometry={agentOrbitXGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.5 + intensity * 0.4} />
        </mesh>
        <mesh ref={orbitYRef} rotation={[Math.PI / 3, 0, 0]} geometry={agentOrbitYGeo}>
          <meshBasicMaterial color={SIGNAL} toneMapped={false} transparent opacity={0.45 + intensity * 0.4} />
        </mesh>
        <mesh ref={orbitZRef} rotation={[0, Math.PI / 4, 0]} geometry={agentOrbitZGeo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} transparent opacity={0.4 + intensity * 0.4} />
        </mesh>
      </group>

      {/* 环绕多智能体工作节点 */}
      <group ref={satelliteGroupRef} position={[0, 1.45, 0]}>
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, idx) => (
          <mesh key={idx} position={[Math.cos(angle) * 1.55, Math.sin(angle * 3) * 0.28, Math.sin(angle) * 1.55]} geometry={agentSatelliteGeo}>
            <meshStandardMaterial color={STEEL} metalness={0.9} emissive={idx % 2 === 0 ? CYAN : GOLD} emissiveIntensity={0.6 * intensity} />
          </mesh>
        ))}
      </group>

      {intensity > 0.8 && (
        <pointLight position={[0, 1.5, 0]} color={CYAN} intensity={14} distance={8} decay={2} />
      )}
      <FlowPulses start={[-1.25, 0.9, -1.0]} end={[0, 1.45, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.25, 0.9, 1.0]} end={[0, 1.45, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}

// 4. WeLink 统一搜索与个性化打分引擎 (Search Zone)
function WelinkSearchZone({ intensity, motionEnabled }: ZoneProps) {
  const prismRef = useRef<THREE.Mesh>(null);
  const scannerRef = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.6 : 1;
    if (prismRef.current) {
      prismRef.current.rotation.y += delta * 0.9 * speedMult;
      prismRef.current.position.y = 1.95 + Math.sin(clock.elapsedTime * 2.5) * 0.08;
    }
    if (scannerRef.current) {
      scannerRef.current.position.y = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.45;
    }
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={SAFETY} />

      {/* 分布式 ES 搜索机柜阵列 */}
      {[-1.35, -0.45, 0.45, 1.35].map((x, index) => (
        <group key={x} position={[x, 0.1, index % 2 === 0 ? 0.15 : -0.15]}>
          <mesh position={[0, 0.85, 0]} castShadow geometry={searchRackGeo}>
            <meshStandardMaterial color={index % 2 === 0 ? '#384d56' : STEEL} metalness={0.9} roughness={0.25} emissive={CYAN} emissiveIntensity={0.08 * intensity} />
          </mesh>
          <mesh position={[0, 1.68, 0]} geometry={protocolCapGeo}>
            <meshBasicMaterial color={index === 2 ? SAFETY : CYAN} toneMapped={false} transparent opacity={0.4 + intensity * 0.4} />
          </mesh>
          {[0.4, 0.75, 1.1, 1.45].map((y, ledIdx) => (
            <mesh key={ledIdx} position={[0, y, 0.32]} geometry={searchLedGeo}>
              <meshBasicMaterial color={ledIdx === 2 ? SAFETY : CYAN} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 悬浮倒金字塔打分路由分发棱镜 */}
      <mesh ref={prismRef} position={[0, 1.95, 0]} rotation={[Math.PI, 0, 0]} geometry={searchPrismGeo}>
        <meshStandardMaterial color={DARK} metalness={0.88} roughness={0.15} emissive={GOLD} emissiveIntensity={0.85 * intensity} />
      </mesh>

      {/* 动态水平切片扫描激光 */}
      <group ref={scannerRef} position={[0, 0.8, 0]}>
        <mesh geometry={searchScannerGeo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} transparent opacity={0.65 + intensity * 0.35} />
        </mesh>
      </group>

      {/* 悬浮索引分片数据块 */}
      {[-1.0, 0.0, 1.0].map((x, idx) => (
        <mesh key={idx} position={[x, 1.45, 0.45]} geometry={searchShardBoxGeo}>
          <meshStandardMaterial color={STEEL_LIGHT} metalness={0.8} emissive={CYAN} emissiveIntensity={0.4 * intensity} />
        </mesh>
      ))}

      {intensity > 0.8 && (
        <pointLight position={[0, 2.0, 0]} color={GOLD} intensity={10} distance={6} decay={2} />
      )}
      <FlowPulses start={[-1.75, 0.3, 0]} end={[0, 1.95, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.75, 0.3, 0]} end={[0, 1.95, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}

// 5. WeLink 双路数据湖管道与版本一致性治理 (Lake Zone)
function WelinkDataLakeZone({ intensity, motionEnabled }: ZoneProps) {
  const vortexLeftRef = useRef<THREE.Mesh>(null);
  const vortexRightRef = useRef<THREE.Mesh>(null);
  const crystalRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.7 : 1;
    if (vortexLeftRef.current) vortexLeftRef.current.rotation.y += delta * 1.5 * speedMult;
    if (vortexRightRef.current) vortexRightRef.current.rotation.y -= delta * 1.2 * speedMult;
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.8 * speedMult;
      crystalRef.current.rotation.x += delta * 0.4 * speedMult;
    }
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={CYAN} />

      {/* 左柱：Flink 实时流式管道反应柱 */}
      <group position={[-0.95, 0.1, 0]}>
        <mesh position={[0, 0.9, 0]} castShadow geometry={lakeColumnGeo}>
          <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.3} transparent opacity={0.7} emissive={CYAN} emissiveIntensity={0.12 * intensity} />
        </mesh>
        <mesh ref={vortexLeftRef} position={[0, 0.9, 0]} geometry={lakeVortexGeo}>
          <meshBasicMaterial color={CYAN} wireframe toneMapped={false} transparent opacity={0.5 + intensity * 0.4} />
        </mesh>
        <mesh position={[0, 1.78, 0]} geometry={lakeCapGeo}>
          <meshStandardMaterial color={DARK} metalness={0.9} emissive={CYAN} emissiveIntensity={0.5 * intensity} />
        </mesh>
        <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={lakeRingGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* 右柱：Spark 批处理离线计算反应柱 */}
      <group position={[0.95, 0.1, 0]}>
        <mesh position={[0, 0.9, 0]} castShadow geometry={lakeColumnGeo}>
          <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.3} transparent opacity={0.7} emissive={SAFETY} emissiveIntensity={0.12 * intensity} />
        </mesh>
        <mesh ref={vortexRightRef} position={[0, 0.9, 0]} geometry={lakeVortexGeo}>
          <meshBasicMaterial color={SAFETY} wireframe toneMapped={false} transparent opacity={0.5 + intensity * 0.4} />
        </mesh>
        <mesh position={[0, 1.78, 0]} geometry={lakeCapGeo}>
          <meshStandardMaterial color={DARK} metalness={0.9} emissive={SAFETY} emissiveIntensity={0.5 * intensity} />
        </mesh>
        <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={lakeRingGeo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* 中央 ACID 版本治理协调桥与锁晶体 */}
      <group position={[0, 1.0, 0]}>
        <mesh geometry={lakeBridgeGeo}>
          <meshStandardMaterial color={DARK} metalness={0.9} roughness={0.2} emissive={SIGNAL} emissiveIntensity={0.25 * intensity} />
        </mesh>
        <mesh ref={crystalRef} position={[0, 0.35, 0]} geometry={lakeAcidCrystalGeo}>
          <meshStandardMaterial color={DARK} metalness={0.8} emissive={GOLD} emissiveIntensity={1.1 * intensity} />
        </mesh>
      </group>

      {intensity > 0.8 && (
        <pointLight position={[0, 1.3, 0]} color={CYAN} intensity={10} distance={6} decay={2} />
      )}
      <FlowPulses start={[-0.95, 1.7, 0]} end={[0.95, 1.7, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[0.95, 0.4, 0]} end={[-0.95, 0.4, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}

// 6. 森格实时通信网关与告警风暴治理 (Gateway Zone)
function SengeGatewayZone({ intensity, motionEnabled }: ZoneProps) {
  const wavesRef = useRef<THREE.Group>(null);
  const dishGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.8 : 1;
    if (dishGroupRef.current) dishGroupRef.current.rotation.y += delta * 0.7 * speedMult;
    if (wavesRef.current) {
      wavesRef.current.children.forEach((child, idx) => {
        const time = clock.elapsedTime * 1.8 + idx * 1.2;
        const scale = 0.6 + (time % 2.5) * 0.8;
        child.scale.set(scale, scale, scale);
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (mat) mat.opacity = Math.max(0, 0.7 - scale * 0.28) * intensity;
      });
    }
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={SAFETY} />

      {/* Netty 高并发通信矩阵底座节点 */}
      {[-1.1, 0, 1.1].map((x, idx) => (
        <group key={idx} position={[x, 0.1, idx === 1 ? -0.4 : 0.4]}>
          <mesh position={[0, 0.2, 0]} geometry={gatewayMatrixNodeGeo}>
            <meshStandardMaterial color={STEEL} metalness={0.9} emissive={idx === 1 ? SAFETY : SIGNAL} emissiveIntensity={0.25 * intensity} />
          </mesh>
          <mesh position={[0, 0.38, 0]}>
            <boxGeometry args={[0.18, 0.04, 0.18]} />
            <meshBasicMaterial color={idx % 2 === 0 ? CYAN : SAFETY} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* 中央主通信塔与天线阵列 */}
      <group position={[0, 0.1, 0]}>
        <mesh position={[0, 1.1, 0]} castShadow geometry={gatewayMastGeo}>
          <meshStandardMaterial color={STEEL} metalness={0.92} roughness={0.2} emissive={SAFETY} emissiveIntensity={0.15 * intensity} />
        </mesh>
        <mesh position={[0, 1.6, 0]} geometry={gatewayCrossArmGeo}>
          <meshStandardMaterial color={STEEL_LIGHT} metalness={0.88} />
        </mesh>
        <group ref={dishGroupRef} position={[0, 2.1, 0]}>
          {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, idx) => (
            <mesh key={idx} position={[Math.cos(angle) * 0.35, 0, Math.sin(angle) * 0.35]} rotation={[0, -angle + Math.PI / 2, Math.PI / 4]} geometry={gatewayDishGeo}>
              <meshStandardMaterial color={DARK} metalness={0.8} emissive={SAFETY} emissiveIntensity={0.5 * intensity} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 电磁波辐射扩散环（告警风暴抑制波） */}
      <group ref={wavesRef} position={[0, 2.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        {[0, 1, 2].map((idx) => (
          <mesh key={idx} geometry={gatewayPulseWaveGeo}>
            <meshBasicMaterial color={SAFETY} toneMapped={false} transparent opacity={0.5} />
          </mesh>
        ))}
      </group>

      {intensity > 0.8 && (
        <pointLight position={[0, 2.2, 0]} color={SAFETY} intensity={12} distance={7} decay={2} />
      )}
      <FlowPulses start={[-1.4, 0.3, 0]} end={[0, 2.1, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.4, 0.3, 0]} end={[0, 2.1, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}

// 7. 森格智慧水务平台 0-1 架构底座与容器化交付 (Platform Zone)
function SengePlatformZone({ intensity, motionEnabled }: ZoneProps) {
  const meshRingRef = useRef<THREE.Mesh>(null);
  const valveRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.6 : 1;
    if (meshRingRef.current) meshRingRef.current.rotation.z += delta * 0.45 * speedMult;
    if (valveRef.current) valveRef.current.rotation.z -= delta * 1.2 * speedMult;
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={SIGNAL} />

      {/* 3层阶梯式云原生容器 Pod 集群模块 */}
      {[
        [-0.75, 0.28, -0.35, STEEL],
        [0.75, 0.28, -0.35, '#39505a'],
        [0, 0.72, 0.35, STEEL_LIGHT],
      ].map(([x, y, z, color], idx) => (
        <group key={idx} position={[x as number, y as number, z as number]}>
          <mesh castShadow geometry={platformPodGeo}>
            <meshStandardMaterial color={color as string} metalness={0.9} roughness={0.25} emissive={SIGNAL} emissiveIntensity={0.12 * intensity} />
          </mesh>
          <mesh position={[0, 0.2, 0]} geometry={platformPodFrameGeo}>
            <meshBasicMaterial color={idx === 2 ? SAFETY : SIGNAL} toneMapped={false} transparent opacity={0.5 + intensity * 0.4} />
          </mesh>
        </group>
      ))}

      {/* 工业流体管路与阀门计量结构 */}
      <mesh position={[0, 0.45, -0.75]} rotation={[0, 0, Math.PI / 2]} geometry={platformPipeGeo}>
        <meshStandardMaterial color={STEEL} metalness={0.94} roughness={0.2} emissive={SAFETY} emissiveIntensity={0.15 * intensity} />
      </mesh>
      <mesh ref={valveRef} position={[0, 0.45, -0.75]} rotation={[0, Math.PI / 2, 0]} geometry={platformValveGeo}>
        <meshStandardMaterial color={SAFETY} metalness={0.8} emissive={SAFETY} emissiveIntensity={0.4 * intensity} />
      </mesh>

      {/* 顶部服务网格负载均衡旋转光环 */}
      <mesh ref={meshRingRef} position={[0, 1.45, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={platformMeshRingGeo}>
        <meshBasicMaterial color={SIGNAL} wireframe toneMapped={false} transparent opacity={0.35 + intensity * 0.45} />
      </mesh>

      {/* 全息遥测监控面板 */}
      {[-0.85, 0.85].map((x, idx) => (
        <mesh key={idx} position={[x, 1.15, 0.65]} rotation={[-0.2, idx === 0 ? 0.35 : -0.35, 0]} geometry={platformHoloPanelGeo}>
          <meshBasicMaterial color={CYAN} wireframe toneMapped={false} transparent opacity={0.4 + intensity * 0.4} />
        </mesh>
      ))}

      {intensity > 0.8 && (
        <pointLight position={[0, 1.5, 0]} color={SIGNAL} intensity={10} distance={7} decay={2} />
      )}
      <FlowPulses start={[-1.4, 0.45, -0.75]} end={[1.4, 0.45, -0.75]} color={SIGNAL} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[0, 0.9, 0.35]} end={[0, 1.45, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={3} />
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

export function IndustrialAssets({ activeExhibit, motionEnabled }: { activeExhibit: string | null; motionEnabled: boolean }) {
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
          >
            <IndustrialZone exhibit={exhibit} intensity={focus.intensity} motionEnabled={motionEnabled} />
          </group>
        );
      })}
    </>
  );
}
