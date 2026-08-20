import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { getResumeData } from '../../data/resume-data';
import type { Locale } from '../../i18n/locale';
import { i18n } from '../../i18n';
import { createBillboardTexture } from '../textures/billboard-texture';
import { createProfileHologramCanvas } from '../textures/profile-hologram-texture';

const CYAN = '#28d7e5';
const SAFETY = '#ff6b3d';
const PURPLE = '#c084fc';
const EMERALD = '#34d399';
const GOLD = '#fbbf24';
const STEEL_DARK = '#071015';
const STEEL_PANEL = '#0e1c22';

// 共享几何体池
const wallNorthGeo = new THREE.PlaneGeometry(36, 13);
const wallSideGeo = new THREE.PlaneGeometry(42, 13);
const mainScreenFrameGeo = new THREE.BoxGeometry(11.4, 6.6, 0.28);
const mainScreenPanelGeo = new THREE.PlaneGeometry(10.8, 6.0);
const screenBezelGeo = new THREE.BoxGeometry(11.0, 0.08, 0.32);
const neonTubeHorizGeo = new THREE.BoxGeometry(40, 0.07, 0.07);
const neonTubeSideGeo = new THREE.BoxGeometry(44, 0.07, 0.07);
const neonTubeVertGeo = new THREE.BoxGeometry(0.07, 11, 0.07);
const wallSeamGeo = new THREE.BoxGeometry(0.04, 11.5, 0.04);
const billboardFrameGeo = new THREE.BoxGeometry(5.0, 2.7, 0.18);
const billboardGlowGeo = new THREE.PlaneGeometry(5.2, 2.9);
const billboardPlaneGeo = new THREE.PlaneGeometry(4.7, 2.4);
const pillarLightGeo = new THREE.CylinderGeometry(0.09, 0.09, 10.5, 12);
const portalPillarGeo = new THREE.BoxGeometry(0.5, 8.2, 0.5);
const portalBeamGeo = new THREE.BoxGeometry(13, 0.4, 0.5);
const portalStripGeo = new THREE.BoxGeometry(12.6, 0.08, 0.52);

export function NeonWalls({ motionEnabled, locale }: { motionEnabled: boolean; locale: Locale }) {
  const mainScreenMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const scanLineRef = useRef<THREE.Mesh>(null);
  const leftLightRef = useRef<THREE.MeshBasicMaterial>(null);
  const rightLightRef = useRef<THREE.MeshBasicMaterial>(null);

  const t = useMemo(() => i18n.getFixedT(locale), [locale]);
  const resume = useMemo(() => getResumeData(locale), [locale]);

  // 异步加载用户简历封面图（仅加载一次，locale 切换时复用）
  const [coverImage, setCoverImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/resume-cover.png';
    const onload = () => setCoverImage(img);
    const onerror = () => setCoverImage(null);
    img.onload = onload;
    img.onerror = onerror;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  // 主屏全息看板 canvas 纹理：随 locale 与封面图重绘
  const mainScreenTexture = useMemo(() => {
    const canvas = createProfileHologramCanvas({
      name: resume.profile.name,
      title: resume.profile.title,
      experience: resume.profile.experience,
      coreValues: t('scene.hologram.coreValues'),
      metrics: [
        { label: 'GLOBAL WATER NETWORK', value: '100,000+', desc: t('scene.hologram.metricWater'), color: '#28d7e5' },
        { label: 'WELINK UNIFIED SEARCH', value: '10,000,000+', desc: t('scene.hologram.metricSearch'), color: '#ff6b3d' },
        { label: 'HIGH-FREQUENCY GATEWAY', value: '10,000+ TPS', desc: t('scene.hologram.metricGateway'), color: '#34d399' },
        { label: 'AGENT ORCHESTRATION', value: '99.95%', desc: t('scene.hologram.metricAgent'), color: '#c084fc' },
      ],
    }, coverImage);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, [t, resume, coverImage]);

  useEffect(() => {
    if (mainScreenMatRef.current) {
      mainScreenMatRef.current.map = mainScreenTexture;
      mainScreenMatRef.current.needsUpdate = true;
    }
    return () => {
      mainScreenTexture.dispose();
    };
  }, [mainScreenTexture]);

  // 侧边看板贴图：随 locale 重绘，副标题走 i18n
  const billboardTextures = useMemo(() => ({
    west1: createBillboardTexture({ title: '⚡ HIGH CONCURRENCY CORE', subtitle: t('scene.billboards.west1'), tags: ['Netty 4.1', 'Spring Cloud', 'Kafka', 'Redis'], accent: CYAN }),
    west2: createBillboardTexture({ title: '🌐 10W+ AIoT WATER NETWORK', subtitle: t('scene.billboards.west2'), tags: ['PostGIS 3D', 'MQTT / Modbus', 'TDengine', 'BFS'], accent: EMERALD }),
    west3: createBillboardTexture({ title: '🚀 DISTRIBUTED ARCHITECTURE', subtitle: t('scene.billboards.west3'), tags: ['Rate Limiter', 'TTL Context', 'Sentinel'], accent: SAFETY }),
    east1: createBillboardTexture({ title: '🤖 AI AGENT & WORKFLOW', subtitle: t('scene.billboards.east1'), tags: ['Spring AI', 'LangChain', 'Docker Sandbox'], accent: PURPLE }),
    east2: createBillboardTexture({ title: '🌊 FLINK & SPARK DATA LAKE', subtitle: t('scene.billboards.east2'), tags: ['Flink Streaming', 'Spark Batch', 'ACID Lake'], accent: CYAN }),
    east3: createBillboardTexture({ title: '🔍 10M+ UNIFIED SEARCH', subtitle: t('scene.billboards.east3'), tags: ['Elasticsearch 8', 'Dynamic Scoring', 'Routing'], accent: GOLD }),
  }), [t]);

  useEffect(() => {
    const textures = Object.values(billboardTextures);
    return () => textures.forEach((texture) => texture.dispose());
  }, [billboardTextures]);

  // 动态全息主屏扫描线与两侧霓虹柱呼吸动效
  useFrame(({ clock }) => {
    if (!motionEnabled) return;
    const time = clock.elapsedTime;
    if (scanLineRef.current) {
      scanLineRef.current.position.y = 4.4 + Math.sin(time * 2.2) * 2.7;
    }
    if (leftLightRef.current) {
      leftLightRef.current.opacity = 0.65 + Math.sin(time * 2.8) * 0.28;
    }
    if (rightLightRef.current) {
      rightLightRef.current.opacity = 0.65 + Math.cos(time * 2.6) * 0.28;
    }
  });

  return (
    <group>
      {/* 1. 北侧远景主墙面 (z = -17.8) */}
      <mesh position={[0, 5.8, -17.8]} receiveShadow geometry={wallNorthGeo}>
        <meshStandardMaterial color={STEEL_DARK} metalness={0.92} roughness={0.35} />
      </mesh>

      {/* 2. 西侧左墙面 (x = -16.8) */}
      <mesh position={[-16.8, 5.8, 3]} rotation={[0, Math.PI / 2, 0]} receiveShadow geometry={wallSideGeo}>
        <meshStandardMaterial color={STEEL_DARK} metalness={0.92} roughness={0.35} />
      </mesh>

      {/* 3. 东侧右墙面 (x = 16.8) */}
      <mesh position={[16.8, 5.8, 3]} rotation={[0, -Math.PI / 2, 0]} receiveShadow geometry={wallSideGeo}>
        <meshStandardMaterial color={STEEL_DARK} metalness={0.92} roughness={0.35} />
      </mesh>

      {/* 4. 北墙中央：巨幅赛博全息主大屏 (x=0, y=4.6, z=-17.2) */}
      <group position={[0, 4.6, -17.2]}>
        <mesh geometry={mainScreenFrameGeo}>
          <meshStandardMaterial color={STEEL_PANEL} metalness={0.94} roughness={0.2} emissive={CYAN} emissiveIntensity={0.12} />
        </mesh>
        {/* 屏幕多重霓虹封边 */}
        <mesh position={[0, 3.2, 0.12]} geometry={screenBezelGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} />
        </mesh>
        <mesh position={[0, -3.2, 0.12]} geometry={screenBezelGeo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} />
        </mesh>
        <mesh position={[-5.6, 0, 0.12]} rotation={[0, 0, Math.PI / 2]} geometry={screenBezelGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} />
        </mesh>
        <mesh position={[5.6, 0, 0.12]} rotation={[0, 0, Math.PI / 2]} geometry={screenBezelGeo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} />
        </mesh>

        {/* 主显示屏面 */}
        <mesh position={[0, 0, 0.16]} geometry={mainScreenPanelGeo}>
          <meshBasicMaterial ref={mainScreenMatRef} toneMapped={false} />
        </mesh>
        {/* 动态激光扫描线 */}
        <mesh ref={scanLineRef} position={[0, 0, 0.19]}>
          <boxGeometry args={[10.7, 0.05, 0.01]} />
          <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.8} />
        </mesh>

        {/* 垂直激光能量光柱 */}
        <mesh position={[-5.8, 0, 0.18]} geometry={pillarLightGeo}>
          <meshBasicMaterial ref={leftLightRef} color={CYAN} toneMapped={false} transparent opacity={0.75} />
        </mesh>
        <mesh position={[5.8, 0, 0.18]} geometry={pillarLightGeo}>
          <meshBasicMaterial ref={rightLightRef} color={SAFETY} toneMapped={false} transparent opacity={0.75} />
        </mesh>

        {/* 主屏局部发光 */}
        <pointLight position={[0, 0, 3.2]} color={CYAN} intensity={20} distance={16} decay={2} />
      </group>

      {/* 5. 北墙多层全景霓虹带 (Multi-tier North Neon Lines) */}
      <mesh position={[0, 11.2, -17.6]} geometry={neonTubeHorizGeo}>
        <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 9.4, -17.6]} geometry={neonTubeHorizGeo}>
        <meshBasicMaterial color={PURPLE} toneMapped={false} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 0.45, -17.6]} geometry={neonTubeHorizGeo}>
        <meshBasicMaterial color={SAFETY} toneMapped={false} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0.15, -17.6]} geometry={neonTubeHorizGeo}>
        <meshBasicMaterial color={EMERALD} toneMapped={false} transparent opacity={0.7} />
      </mesh>

      {/* 6. 西墙（左侧）霓虹灯阵列与立体发光广告牌 */}
      <group position={[-16.4, 4.2, 0]}>
        {/* 顶部/底部/中部贯穿式霓虹灯管 */}
        <mesh position={[0, 6.8, 3]} rotation={[0, Math.PI / 2, 0]} geometry={neonTubeSideGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 5.2, 3]} rotation={[0, Math.PI / 2, 0]} geometry={neonTubeSideGeo}>
          <meshBasicMaterial color={EMERALD} toneMapped={false} transparent opacity={0.75} />
        </mesh>
        <mesh position={[0, -3.7, 3]} rotation={[0, Math.PI / 2, 0]} geometry={neonTubeSideGeo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, -4.0, 3]} rotation={[0, Math.PI / 2, 0]} geometry={neonTubeSideGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.7} />
        </mesh>

        {/* 墙面垂直发光分割缝 */}
        {[-14, -4, 4, 14, 22].map((z) => (
          <mesh key={z} position={[0.02, 1.6, z]} geometry={wallSeamGeo}>
            <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.6} />
          </mesh>
        ))}

        {/* 看板 1: 高并发架构 */}
        <group position={[0, 0.6, -8]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, 0, -0.02]} geometry={billboardGlowGeo}>
            <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.25} />
          </mesh>
          <mesh geometry={billboardFrameGeo}>
            <meshStandardMaterial color={STEEL_PANEL} metalness={0.9} emissive={CYAN} emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.11]} geometry={billboardPlaneGeo}>
            <meshBasicMaterial map={billboardTextures.west1} toneMapped={false} />
          </mesh>
        </group>

        {/* 看板 2: AIoT 空间水网 */}
        <group position={[0, 0.6, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, 0, -0.02]} geometry={billboardGlowGeo}>
            <meshBasicMaterial color={EMERALD} toneMapped={false} transparent opacity={0.25} />
          </mesh>
          <mesh geometry={billboardFrameGeo}>
            <meshStandardMaterial color={STEEL_PANEL} metalness={0.9} emissive={EMERALD} emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.11]} geometry={billboardPlaneGeo}>
            <meshBasicMaterial map={billboardTextures.west2} toneMapped={false} />
          </mesh>
        </group>

        {/* 看板 3: 分布式治理 */}
        <group position={[0, 0.6, 8]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, 0, -0.02]} geometry={billboardGlowGeo}>
            <meshBasicMaterial color={SAFETY} toneMapped={false} transparent opacity={0.25} />
          </mesh>
          <mesh geometry={billboardFrameGeo}>
            <meshStandardMaterial color={STEEL_PANEL} metalness={0.9} emissive={SAFETY} emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.11]} geometry={billboardPlaneGeo}>
            <meshBasicMaterial map={billboardTextures.west3} toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* 7. 东墙（右侧）霓虹灯阵列与立体发光广告牌 */}
      <group position={[16.4, 4.2, 0]}>
        {/* 顶部/底部/中部贯穿式霓虹灯管 */}
        <mesh position={[0, 6.8, 3]} rotation={[0, -Math.PI / 2, 0]} geometry={neonTubeSideGeo}>
          <meshBasicMaterial color={PURPLE} toneMapped={false} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 5.2, 3]} rotation={[0, -Math.PI / 2, 0]} geometry={neonTubeSideGeo}>
          <meshBasicMaterial color={GOLD} toneMapped={false} transparent opacity={0.75} />
        </mesh>
        <mesh position={[0, -3.7, 3]} rotation={[0, -Math.PI / 2, 0]} geometry={neonTubeSideGeo}>
          <meshBasicMaterial color={GOLD} toneMapped={false} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, -4.0, 3]} rotation={[0, -Math.PI / 2, 0]} geometry={neonTubeSideGeo}>
          <meshBasicMaterial color={PURPLE} toneMapped={false} transparent opacity={0.7} />
        </mesh>

        {/* 墙面垂直发光分割缝 */}
        {[-14, -4, 4, 14, 22].map((z) => (
          <mesh key={z} position={[-0.02, 1.6, z]} geometry={wallSeamGeo}>
            <meshBasicMaterial color={PURPLE} toneMapped={false} transparent opacity={0.6} />
          </mesh>
        ))}

        {/* 看板 1: AI Agent 智能体 */}
        <group position={[0, 0.6, -8]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh position={[0, 0, -0.02]} geometry={billboardGlowGeo}>
            <meshBasicMaterial color={PURPLE} toneMapped={false} transparent opacity={0.25} />
          </mesh>
          <mesh geometry={billboardFrameGeo}>
            <meshStandardMaterial color={STEEL_PANEL} metalness={0.9} emissive={PURPLE} emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.11]} geometry={billboardPlaneGeo}>
            <meshBasicMaterial map={billboardTextures.east1} toneMapped={false} />
          </mesh>
        </group>

        {/* 看板 2: 双路数据湖 */}
        <group position={[0, 0.6, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh position={[0, 0, -0.02]} geometry={billboardGlowGeo}>
            <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.25} />
          </mesh>
          <mesh geometry={billboardFrameGeo}>
            <meshStandardMaterial color={STEEL_PANEL} metalness={0.9} emissive={CYAN} emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.11]} geometry={billboardPlaneGeo}>
            <meshBasicMaterial map={billboardTextures.east2} toneMapped={false} />
          </mesh>
        </group>

        {/* 看板 3: WeLink 统一搜索 */}
        <group position={[0, 0.6, 8]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh position={[0, 0, -0.02]} geometry={billboardGlowGeo}>
            <meshBasicMaterial color={GOLD} toneMapped={false} transparent opacity={0.25} />
          </mesh>
          <mesh geometry={billboardFrameGeo}>
            <meshStandardMaterial color={STEEL_PANEL} metalness={0.9} emissive={GOLD} emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.11]} geometry={billboardPlaneGeo}>
            <meshBasicMaterial map={billboardTextures.east3} toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* 8. 南侧入口迎宾赛博拱门 (z = 21.5) */}
      <group position={[0, 0, 21.5]}>
        <mesh position={[-6.2, 4.1, 0]} geometry={portalPillarGeo}>
          <meshStandardMaterial color={STEEL_DARK} metalness={0.92} emissive={CYAN} emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[6.2, 4.1, 0]} geometry={portalPillarGeo}>
          <meshStandardMaterial color={STEEL_DARK} metalness={0.92} emissive={SAFETY} emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, 8.0, 0]} geometry={portalBeamGeo}>
          <meshStandardMaterial color={STEEL_DARK} metalness={0.92} />
        </mesh>
        {/* 门梁双层霓虹光带 */}
        <mesh position={[0, 7.85, 0]} geometry={portalStripGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} />
        </mesh>
        <mesh position={[0, 8.15, 0]} geometry={portalStripGeo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} />
        </mesh>
        {/* 立柱垂直霓虹管 */}
        <mesh position={[-6.2, 4.1, 0.28]} geometry={neonTubeVertGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} />
        </mesh>
        <mesh position={[6.2, 4.1, 0.28]} geometry={neonTubeVertGeo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 4.2, -1.2]} color={CYAN} intensity={14} distance={12} decay={2} />
      </group>
    </group>
  );
}
