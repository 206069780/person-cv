import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { resumeData } from '../data/resume-data';

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

/**
 * 用 HTML5 Canvas 动态绘制极高分辨率的赛博全息个人 Profile 与架构主看板 (1024x560 高性能版)
 */
function createProfileHologramCanvas(coverImage?: HTMLImageElement | null): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 560;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 背景：深邃赛博金属渐变与网格
  const grad = ctx.createLinearGradient(0, 0, 1024, 560);
  grad.addColorStop(0, '#040d12');
  grad.addColorStop(0.5, '#071820');
  grad.addColorStop(1, '#051117');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 赛博网格背景
  ctx.strokeStyle = 'rgba(40, 215, 229, 0.07)';
  ctx.lineWidth = 1;
  const gridSize = 24;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // 四角赛博裁切瞄准角标
  ctx.strokeStyle = '#28d7e5';
  ctx.lineWidth = 2.5;
  const bracketSize = 20;
  const pad = 12;
  // 左上
  ctx.beginPath();
  ctx.moveTo(pad, pad + bracketSize);
  ctx.lineTo(pad, pad);
  ctx.lineTo(pad + bracketSize, pad);
  ctx.stroke();
  // 右上
  ctx.beginPath();
  ctx.moveTo(canvas.width - pad - bracketSize, pad);
  ctx.lineTo(canvas.width - pad, pad);
  ctx.lineTo(canvas.width - pad, pad + bracketSize);
  ctx.stroke();
  // 左下
  ctx.beginPath();
  ctx.moveTo(pad, canvas.height - pad - bracketSize);
  ctx.lineTo(pad, canvas.height - pad);
  ctx.lineTo(pad + bracketSize, canvas.height - pad);
  ctx.stroke();
  // 右下
  ctx.beginPath();
  ctx.moveTo(canvas.width - pad - bracketSize, canvas.height - pad);
  ctx.lineTo(canvas.width - pad, canvas.height - pad);
  ctx.lineTo(canvas.width - pad, canvas.height - pad - bracketSize);
  ctx.stroke();

  // 顶部状态栏
  ctx.fillStyle = 'rgba(40, 215, 229, 0.12)';
  ctx.fillRect(pad + 6, pad + 6, canvas.width - (pad + 6) * 2, 26);
  ctx.fillStyle = '#28d7e5';
  ctx.font = 'bold 12px "IBM Plex Mono", Consolas, monospace';
  ctx.fillText('/// SYS.STATUS: LIVE 24/7 · NEURAL BACKEND ARCHITECTURE DISPLAY · NODE: 0x7F001', 28, 30);
  ctx.fillStyle = '#ff6b3d';
  ctx.fillText('● 100,000+ WATER STATIONS ONLINE', canvas.width - 260, 30);

  // 左侧：如果有简历封面图，绘制带霓虹框的图片；否则绘制赛博形象/徽标
  const picX = 40;
  const picY = 60;
  const picW = 290;
  const picH = 410;

  ctx.fillStyle = '#0a1a22';
  ctx.fillRect(picX, picY, picW, picH);

  if (coverImage && coverImage.complete && coverImage.naturalWidth > 0) {
    ctx.drawImage(coverImage, picX + 4, picY + 4, picW - 8, picH - 8);
    // 扫描线滤镜
    ctx.fillStyle = 'rgba(40, 215, 229, 0.04)';
    for (let sy = picY; sy < picY + picH; sy += 4) {
      ctx.fillRect(picX, sy, picW, 1);
    }
  } else {
    // 动态绘制极客头像徽章
    const avatarGrad = ctx.createRadialGradient(picX + picW / 2, picY + picH / 2, 20, picX + picW / 2, picY + picH / 2, 140);
    avatarGrad.addColorStop(0, '#133e45');
    avatarGrad.addColorStop(1, '#061318');
    ctx.fillStyle = avatarGrad;
    ctx.fillRect(picX, picY, picW, picH);

    ctx.strokeStyle = '#28d7e5';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(picX + 20, picY + 30, picW - 40, picH - 60);

    ctx.fillStyle = '#28d7e5';
    ctx.font = 'bold 32px "IBM Plex Mono", Consolas, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('F D P', picX + picW / 2, picY + 140);
    ctx.font = 'bold 14px "IBM Plex Mono", Consolas, sans-serif';
    ctx.fillText('FU DAO PIN', picX + picW / 2, picY + 175);
    ctx.fillStyle = '#83a8b4';
    ctx.font = '10px "IBM Plex Mono", Consolas, sans-serif';
    ctx.fillText('SENIOR JAVA ARCHITECT', picX + picW / 2, picY + 200);
    ctx.fillText('AIoT · GIS · AGENT · DATA LAKE', picX + picW / 2, picY + 220);

    // 绘制装饰电路环
    ctx.strokeStyle = 'rgba(255, 107, 61, 0.6)';
    ctx.beginPath();
    ctx.arc(picX + picW / 2, picY + picH / 2 + 60, 55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#28d7e5';
    ctx.beginPath();
    ctx.arc(picX + picW / 2, picY + picH / 2 + 60, 45, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.textAlign = 'left';
  }

  // 霓虹框线
  ctx.strokeStyle = '#28d7e5';
  ctx.lineWidth = 2;
  ctx.strokeRect(picX, picY, picW, picH);
  ctx.strokeStyle = '#ff6b3d';
  ctx.lineWidth = 1;
  ctx.strokeRect(picX - 3, picY - 3, picW + 6, picH + 6);

  // 右侧核心信息面板
  const infoX = 360;
  const infoY = 65;

  // 姓名与职位主标题
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(resumeData.profile.name, infoX, infoY + 32);

  ctx.fillStyle = '#28d7e5';
  ctx.font = 'bold 18px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillText(`${resumeData.profile.title}  |  ${resumeData.profile.experience}`, infoX + 150, infoY + 24);

  ctx.fillStyle = '#83a8b4';
  ctx.font = '12px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillText('CORE VALUES: 高并发 · AIoT 空间计算 · 双路数据湖 · 智能体微服务中台', infoX, infoY + 60);

  // 分割装饰光带
  ctx.fillStyle = '#28d7e5';
  ctx.fillRect(infoX, infoY + 72, 610, 2);
  ctx.fillStyle = '#ff6b3d';
  ctx.fillRect(infoX, infoY + 72, 120, 3);

  // 4 个核心架构指标卡（矩阵排布）
  const metrics = [
    { label: 'GLOBAL WATER NETWORK', value: '100,000+', desc: '国内外水站高并发 AIoT 接入 · 毫秒调度', color: '#28d7e5' },
    { label: 'WELINK UNIFIED SEARCH', value: '10,000,000+', desc: '华为云千亿级文档搜索 · 动态个性化打分', color: '#ff6b3d' },
    { label: 'HIGH-FREQUENCY GATEWAY', value: '10,000+ TPS', desc: 'Netty/WebSocket 长连接网关 · 告警风暴治理', color: '#34d399' },
    { label: 'AGENT ORCHESTRATION', value: '99.95%', desc: 'LangChain/Spring AI 智能体编排 · 沙箱执行', color: '#c084fc' },
  ];

  metrics.forEach((m, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const mx = infoX + col * 310;
    const my = infoY + 90 + row * 95;
    const mw = 295;
    const mh = 82;

    // 卡片背景
    ctx.fillStyle = 'rgba(10, 26, 34, 0.85)';
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = m.color;
    ctx.lineWidth = 1;
    ctx.strokeRect(mx, my, mw, mh);

    // 左侧彩色指示条
    ctx.fillStyle = m.color;
    ctx.fillRect(mx, my, 4, mh);

    // 内容
    ctx.fillStyle = '#83a8b4';
    ctx.font = 'bold 9px "IBM Plex Mono", Consolas, monospace';
    ctx.fillText(m.label, mx + 12, my + 18);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "IBM Plex Mono", Consolas, sans-serif';
    ctx.fillText(m.value, mx + 12, my + 46);

    ctx.fillStyle = '#94b3be';
    ctx.font = '9px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(m.desc, mx + 12, my + 68);
  });

  // 底部技术栈霓虹芯片矩阵
  const skills = [
    'JAVA 17/21', 'SPRING CLOUD', 'NETTY', 'POSTGIS', 'FLINK', 'SPARK', 'ELASTICSEARCH',
    'REDIS CLUSTER', 'KAFKA', 'DOCKER', 'LANGCHAIN', 'TDENGINE',
  ];

  const skillY = infoY + 300;
  ctx.fillStyle = '#28d7e5';
  ctx.font = 'bold 11px "IBM Plex Mono", Consolas, monospace';
  ctx.fillText('/// CORE ENGINEERING STACK MATRIX:', infoX, skillY);

  let sx = infoX;
  let sy = skillY + 10;
  skills.forEach((skill, idx) => {
    ctx.font = 'bold 9px "IBM Plex Mono", Consolas, monospace';
    const tagW = ctx.measureText(skill).width + 16;
    if (sx + tagW > infoX + 610) {
      sx = infoX;
      sy += 24;
    }

    ctx.fillStyle = 'rgba(40, 215, 229, 0.12)';
    ctx.fillRect(sx, sy, tagW, 18);
    ctx.strokeStyle = idx % 3 === 0 ? '#ff6b3d' : idx % 2 === 0 ? '#28d7e5' : '#c084fc';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx, sy, tagW, 18);

    ctx.fillStyle = '#e2f4f8';
    ctx.fillText(skill, sx + 8, sy + 13);
    sx += tagW + 8;
  });

  // 底部版权装饰
  ctx.fillStyle = 'rgba(131, 168, 180, 0.6)';
  ctx.font = '9px "IBM Plex Mono", Consolas, monospace';
  ctx.fillText('FU DAOPIN · 3D INTERACTIVE RESUME & ENGINEERING MUSEUM · 2026', infoX, 535);

  return canvas;
}

/**
 * 绘制侧边霓虹广告看板纹理 (512x256 高性能轻量版)
 */
function createBillboardTexture(title: string, sub: string, tags: string[], accent: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 背景
  ctx.fillStyle = '#050f14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 边框发光
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);

  // 装饰网格
  ctx.fillStyle = 'rgba(40, 215, 229, 0.06)';
  for (let y = 18; y < canvas.height - 18; y += 8) {
    ctx.fillRect(18, y, canvas.width - 36, 1);
  }

  // 标题
  ctx.fillStyle = accent;
  ctx.font = 'bold 22px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillText(title, 24, 45);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(sub, 24, 76);

  // 分割线
  ctx.fillStyle = accent;
  ctx.fillRect(24, 94, canvas.width - 48, 2);

  // 标签
  let tx = 24;
  let ty = 125;
  tags.forEach((tag) => {
    ctx.font = 'bold 12px "IBM Plex Mono", Consolas, monospace';
    const tw = ctx.measureText(tag).width + 16;
    if (tx + tw > canvas.width - 24) {
      tx = 24;
      ty += 34;
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(tx, ty - 14, tw, 22);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1;
    ctx.strokeRect(tx, ty - 14, tw, 22);

    ctx.fillStyle = '#e8f7fa';
    ctx.fillText(tag, tx + 8, ty + 2);
    tx += tw + 10;
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export function NeonWalls({ motionEnabled }: { motionEnabled: boolean }) {
  const mainScreenMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const scanLineRef = useRef<THREE.Mesh>(null);
  const leftLightRef = useRef<THREE.MeshBasicMaterial>(null);
  const rightLightRef = useRef<THREE.MeshBasicMaterial>(null);

  // 尝试加载用户简历封面图并合成全息主看板
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/resume-cover.png';

    const renderCanvas = (imageObj?: HTMLImageElement | null) => {
      const canvas = createProfileHologramCanvas(imageObj);
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      if (mainScreenMatRef.current) {
        mainScreenMatRef.current.map = texture;
        mainScreenMatRef.current.needsUpdate = true;
      }
    };

    img.onload = () => renderCanvas(img);
    img.onerror = () => renderCanvas(null);

    renderCanvas(null);
  }, []);

  // 侧边看板贴图 (静态缓存)
  const billboardTextures = useMemo(() => ({
    west1: createBillboardTexture('⚡ HIGH CONCURRENCY CORE', '亿级高并发实时调度架构', ['Netty 4.1', 'Spring Cloud', 'Kafka', 'Redis'], CYAN),
    west2: createBillboardTexture('🌐 10W+ AIoT WATER NETWORK', '国内外智慧水站空间拓扑', ['PostGIS 3D', 'MQTT / Modbus', 'TDengine', 'BFS'], EMERALD),
    west3: createBillboardTexture('🚀 DISTRIBUTED ARCHITECTURE', '全链路分布式高可用治理', ['Rate Limiter', 'TTL Context', 'Sentinel'], SAFETY),
    east1: createBillboardTexture('🤖 AI AGENT & WORKFLOW', '生产级企业智能体编排中台', ['Spring AI', 'LangChain', 'Docker Sandbox'], PURPLE),
    east2: createBillboardTexture('🌊 FLINK & SPARK DATA LAKE', '双路实时/离线数据湖治理', ['Flink Streaming', 'Spark Batch', 'ACID Lake'], CYAN),
    east3: createBillboardTexture('🔍 10M+ UNIFIED SEARCH', '华为云 WeLink 千万级搜索', ['Elasticsearch 8', 'Dynamic Scoring', 'Routing'], GOLD),
  }), []);

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
