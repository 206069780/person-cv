import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { resumeData } from '../data/resume-data';

const CYAN = '#28d7e5';
const SAFETY = '#ff6b3d';
const PURPLE = '#c084fc';
const EMERALD = '#34d399';
const GOLD = '#fbbf24';
const STEEL_DARK = '#091319';
const STEEL_PANEL = '#122027';

// 共享几何体池
const wallNorthGeo = new THREE.PlaneGeometry(36, 12);
const wallSideGeo = new THREE.PlaneGeometry(42, 12);
const mainScreenFrameGeo = new THREE.BoxGeometry(11.2, 6.4, 0.28);
const mainScreenPanelGeo = new THREE.PlaneGeometry(10.6, 5.8);
const screenBezelGeo = new THREE.BoxGeometry(10.8, 0.08, 0.32);
const neonTubeHorizGeo = new THREE.BoxGeometry(40, 0.06, 0.06);
const neonTubeVertGeo = new THREE.BoxGeometry(0.06, 10, 0.06);
const billboardFrameGeo = new THREE.BoxGeometry(4.8, 2.6, 0.18);
const billboardPlaneGeo = new THREE.PlaneGeometry(4.5, 2.3);
const pillarLightGeo = new THREE.CylinderGeometry(0.08, 0.08, 9.5, 12);
const portalPillarGeo = new THREE.BoxGeometry(0.45, 7.5, 0.45);
const portalBeamGeo = new THREE.BoxGeometry(12, 0.35, 0.45);
const portalStripGeo = new THREE.BoxGeometry(11.6, 0.06, 0.48);

/**
 * 用 HTML5 Canvas 动态绘制极高分辨率的赛博全息个人 Profile 与架构主看板
 */
function createProfileHologramCanvas(coverImage?: HTMLImageElement | null): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1120;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 背景：深邃赛博金属渐变与网格
  const grad = ctx.createLinearGradient(0, 0, 2048, 1120);
  grad.addColorStop(0, '#040d12');
  grad.addColorStop(0.5, '#071820');
  grad.addColorStop(1, '#051117');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 赛博网格背景
  ctx.strokeStyle = 'rgba(40, 215, 229, 0.07)';
  ctx.lineWidth = 1;
  const gridSize = 40;
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
  ctx.lineWidth = 4;
  const bracketSize = 36;
  const pad = 24;
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
  ctx.fillRect(pad + 10, pad + 10, canvas.width - (pad + 10) * 2, 48);
  ctx.fillStyle = '#28d7e5';
  ctx.font = 'bold 22px "IBM Plex Mono", Consolas, monospace';
  ctx.fillText('/// SYS.STATUS: LIVE 24/7 · NEURAL BACKEND ARCHITECTURE DISPLAY · NODE_ID: 0x7F001', 54, 58);
  ctx.fillStyle = '#ff6b3d';
  ctx.fillText('● 100,000+ WATER STATIONS ONLINE', canvas.width - 480, 58);

  // 左侧：如果有简历封面图，绘制带霓虹框的图片；否则绘制赛博形象/徽标
  const picX = 80;
  const picY = 120;
  const picW = 580;
  const picH = 820;

  ctx.fillStyle = '#0a1a22';
  ctx.fillRect(picX, picY, picW, picH);

  if (coverImage && coverImage.complete && coverImage.naturalWidth > 0) {
    ctx.drawImage(coverImage, picX + 8, picY + 8, picW - 16, picH - 16);
    // 扫描线滤镜
    ctx.fillStyle = 'rgba(40, 215, 229, 0.04)';
    for (let sy = picY; sy < picY + picH; sy += 6) {
      ctx.fillRect(picX, sy, picW, 2);
    }
  } else {
    // 动态绘制极客头像徽章
    const avatarGrad = ctx.createRadialGradient(picX + picW / 2, picY + picH / 2, 40, picX + picW / 2, picY + picH / 2, 280);
    avatarGrad.addColorStop(0, '#133e45');
    avatarGrad.addColorStop(1, '#061318');
    ctx.fillStyle = avatarGrad;
    ctx.fillRect(picX, picY, picW, picH);

    ctx.strokeStyle = '#28d7e5';
    ctx.lineWidth = 3;
    ctx.strokeRect(picX + 40, picY + 60, picW - 80, picH - 120);

    ctx.fillStyle = '#28d7e5';
    ctx.font = 'bold 64px "IBM Plex Mono", Consolas, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('F D P', picX + picW / 2, picY + 280);
    ctx.font = 'bold 26px "IBM Plex Mono", Consolas, sans-serif';
    ctx.fillText('FU DAO PIN', picX + picW / 2, picY + 340);
    ctx.fillStyle = '#83a8b4';
    ctx.font = '18px "IBM Plex Mono", Consolas, sans-serif';
    ctx.fillText('SENIOR JAVA ARCHITECT', picX + picW / 2, picY + 390);
    ctx.fillText('AIoT · GIS · AGENT · DATA LAKE', picX + picW / 2, picY + 430);

    // 绘制装饰电路环
    ctx.strokeStyle = 'rgba(255, 107, 61, 0.6)';
    ctx.beginPath();
    ctx.arc(picX + picW / 2, picY + picH / 2 + 120, 110, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#28d7e5';
    ctx.beginPath();
    ctx.arc(picX + picW / 2, picY + picH / 2 + 120, 90, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.textAlign = 'left';
  }

  // 霓虹框线
  ctx.strokeStyle = '#28d7e5';
  ctx.lineWidth = 3;
  ctx.strokeRect(picX, picY, picW, picH);
  ctx.strokeStyle = '#ff6b3d';
  ctx.lineWidth = 2;
  ctx.strokeRect(picX - 6, picY - 6, picW + 12, picH + 12);

  // 右侧核心信息面板
  const infoX = 720;
  const infoY = 130;

  // 姓名与职位主标题
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 78px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(resumeData.profile.name, infoX, infoY + 60);

  ctx.fillStyle = '#28d7e5';
  ctx.font = 'bold 36px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillText(`${resumeData.profile.title}  |  ${resumeData.profile.experience}`, infoX + 280, infoY + 45);

  ctx.fillStyle = '#83a8b4';
  ctx.font = '22px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillText('CORE VALUES: 高并发 · AIoT 空间计算 · 双路数据湖 · 智能体微服务中台', infoX, infoY + 115);

  // 分割装饰光带
  ctx.fillStyle = '#28d7e5';
  ctx.fillRect(infoX, infoY + 140, 1220, 3);
  ctx.fillStyle = '#ff6b3d';
  ctx.fillRect(infoX, infoY + 140, 240, 5);

  // 4 个核心架构指标卡（矩阵排布）
  const metrics = [
    { label: 'GLOBAL WATER NETWORK', value: '100,000+', desc: '国内外水站高并发 AIoT 接入 · 毫秒级调度', color: '#28d7e5' },
    { label: 'WELINK UNIFIED SEARCH', value: '10,000,000+', desc: '华为云千亿级文档搜索 · 动态个性化打分', color: '#ff6b3d' },
    { label: 'HIGH-FREQUENCY GATEWAY', value: '10,000+ TPS', desc: 'Netty/WebSocket 长连接网关 · 告警风暴治理', color: '#34d399' },
    { label: 'AGENT ORCHESTRATION', value: '99.95%', desc: 'LangChain/Spring AI 智能体编排 · 沙箱代码执行', color: '#c084fc' },
  ];

  metrics.forEach((m, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const mx = infoX + col * 620;
    const my = infoY + 175 + row * 190;
    const mw = 590;
    const mh = 160;

    // 卡片背景
    ctx.fillStyle = 'rgba(10, 26, 34, 0.85)';
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = m.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(mx, my, mw, mh);

    // 左侧彩色指示条
    ctx.fillStyle = m.color;
    ctx.fillRect(mx, my, 6, mh);

    // 内容
    ctx.fillStyle = '#83a8b4';
    ctx.font = 'bold 16px "IBM Plex Mono", Consolas, monospace';
    ctx.fillText(m.label, mx + 24, my + 34);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px "IBM Plex Mono", Consolas, sans-serif';
    ctx.fillText(m.value, mx + 24, my + 88);

    ctx.fillStyle = '#94b3be';
    ctx.font = '16px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(m.desc, mx + 24, my + 130);
  });

  // 底部技术栈霓虹芯片矩阵
  const skills = [
    'JAVA 17/21', 'SPRING CLOUD', 'NETTY', 'POSTGIS / GIS', 'FLINK', 'SPARK', 'ELASTICSEARCH',
    'REDIS CLUSTER', 'KAFKA', 'DOCKER / K8S', 'LANGCHAIN / AGENT', 'MYSQL / TDENGINE',
  ];

  const skillY = infoY + 590;
  ctx.fillStyle = '#28d7e5';
  ctx.font = 'bold 18px "IBM Plex Mono", Consolas, monospace';
  ctx.fillText('/// CORE ENGINEERING STACK MATRIX:', infoX, skillY);

  let sx = infoX;
  let sy = skillY + 18;
  skills.forEach((skill, idx) => {
    ctx.font = 'bold 16px "IBM Plex Mono", Consolas, monospace';
    const tagW = ctx.measureText(skill).width + 24;
    if (sx + tagW > infoX + 1220) {
      sx = infoX;
      sy += 42;
    }

    ctx.fillStyle = 'rgba(40, 215, 229, 0.12)';
    ctx.fillRect(sx, sy, tagW, 32);
    ctx.strokeStyle = idx % 3 === 0 ? '#ff6b3d' : idx % 2 === 0 ? '#28d7e5' : '#c084fc';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx, sy, tagW, 32);

    ctx.fillStyle = '#e2f4f8';
    ctx.fillText(skill, sx + 12, sy + 22);
    sx += tagW + 12;
  });

  // 底部版权装饰
  ctx.fillStyle = 'rgba(131, 168, 180, 0.6)';
  ctx.font = '14px "IBM Plex Mono", Consolas, monospace';
  ctx.fillText('FU DAOPIN · 3D INTERACTIVE RESUME & ENGINEERING MUSEUM · 2026', infoX, 1070);

  return canvas;
}

/**
 * 绘制侧边霓虹广告看板纹理
 */
function createBillboardTexture(title: string, sub: string, tags: string[], accent: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 背景
  ctx.fillStyle = '#050f14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 边框发光
  ctx.strokeStyle = accent;
  ctx.lineWidth = 8;
  ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(26, 26, canvas.width - 52, canvas.height - 52);

  // 装饰网格
  ctx.fillStyle = 'rgba(40, 215, 229, 0.06)';
  for (let y = 36; y < canvas.height - 36; y += 12) {
    ctx.fillRect(36, y, canvas.width - 72, 2);
  }

  // 标题
  ctx.fillStyle = accent;
  ctx.font = 'bold 44px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillText(title, 48, 90);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(sub, 48, 150);

  // 分割线
  ctx.fillStyle = accent;
  ctx.fillRect(48, 185, canvas.width - 96, 3);

  // 标签
  let tx = 48;
  let ty = 240;
  tags.forEach((tag) => {
    ctx.font = 'bold 22px "IBM Plex Mono", Consolas, monospace';
    const tw = ctx.measureText(tag).width + 30;
    if (tx + tw > canvas.width - 48) {
      tx = 48;
      ty += 60;
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(tx, ty - 26, tw, 38);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(tx, ty - 26, tw, 38);

    ctx.fillStyle = '#e8f7fa';
    ctx.fillText(tag, tx + 15, ty);
    tx += tw + 16;
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

export function NeonWalls({ motionEnabled }: { motionEnabled: boolean }) {
  const mainScreenMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const scanLineRef = useRef<THREE.Mesh>(null);
  const leftLightBarRef = useRef<THREE.Mesh>(null);
  const rightLightBarRef = useRef<THREE.Mesh>(null);

  // 尝试加载用户简历封面图并合成全息主看板
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/resume-cover.png';

    const renderCanvas = (imageObj?: HTMLImageElement | null) => {
      const canvas = createProfileHologramCanvas(imageObj);
      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 8;
      texture.needsUpdate = true;
      if (mainScreenMatRef.current) {
        mainScreenMatRef.current.map = texture;
        mainScreenMatRef.current.needsUpdate = true;
      }
    };

    img.onload = () => renderCanvas(img);
    img.onerror = () => renderCanvas(null);

    // 默认先生成一版
    renderCanvas(null);
  }, []);

  // 侧边看板贴图
  const billboardTextures = useMemo(() => ({
    west1: createBillboardTexture('⚡ HIGH CONCURRENCY CORE', '亿级高并发实时调度架构', ['Netty 4.1', 'Spring Cloud', 'Kafka', 'Redis Cluster'], CYAN),
    west2: createBillboardTexture('🌐 10W+ AIoT WATER NETWORK', '国内外智慧水站空间拓扑', ['PostGIS 3D', 'MQTT / Modbus', 'TDengine', 'Spatial BFS'], EMERALD),
    west3: createBillboardTexture('🚀 DISTRIBUTED ARCHITECTURE', '全链路分布式高可用治理', ['Rate Limiter', 'TransmittableThreadLocal', 'Sentinel'], SAFETY),
    east1: createBillboardTexture('🤖 AI AGENT & WORKFLOW', '生产级企业智能体编排中台', ['Spring AI', 'LangChain', 'Docker Sandbox', 'StateMachine'], PURPLE),
    east2: createBillboardTexture('🌊 FLINK & SPARK DATA LAKE', '双路实时/离线数据湖治理', ['Flink Streaming', 'Spark Batch', 'ACID Consistency'], CYAN),
    east3: createBillboardTexture('🔍 10M+ UNIFIED SEARCH', '华为云 WeLink 千万级搜索', ['Elasticsearch 8', 'Dynamic Scoring', 'Segment Routing'], GOLD),
  }), []);

  // 动态扫描线与霓虹灯呼吸流光动效
  useFrame(({ clock }, delta) => {
    if (!motionEnabled) return;
    const time = clock.elapsedTime;

    // 主屏垂直激光扫描线
    if (scanLineRef.current) {
      scanLineRef.current.position.y = 4.2 + Math.sin(time * 2.2) * 2.6;
    }

    // 侧边霓虹柱呼吸光感
    if (leftLightBarRef.current) {
      const mat = leftLightBarRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = 0.55 + Math.sin(time * 3.0) * 0.25;
    }
    if (rightLightBarRef.current) {
      const mat = rightLightBarRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = 0.55 + Math.cos(time * 2.8) * 0.25;
    }
  });

  return (
    <group>
      {/* 1. 北侧远景主墙面 (z = -17.8) */}
      <mesh position={[0, 5.5, -17.8]} receiveShadow geometry={wallNorthGeo}>
        <meshStandardMaterial color={STEEL_DARK} metalness={0.92} roughness={0.35} />
      </mesh>

      {/* 2. 西侧左墙面 (x = -16.8) */}
      <mesh position={[-16.8, 5.5, 3]} rotation={[0, Math.PI / 2, 0]} receiveShadow geometry={wallSideGeo}>
        <meshStandardMaterial color={STEEL_DARK} metalness={0.92} roughness={0.35} />
      </mesh>

      {/* 3. 东侧右墙面 (x = 16.8) */}
      <mesh position={[16.8, 5.5, 3]} rotation={[0, -Math.PI / 2, 0]} receiveShadow geometry={wallSideGeo}>
        <meshStandardMaterial color={STEEL_DARK} metalness={0.92} roughness={0.35} />
      </mesh>

      {/* 4. 北墙中央：巨幅 4K 赛博全息个人 Profile 架构主大屏 (x=0, y=4.4, z=-17.2) */}
      <group position={[0, 4.4, -17.2]}>
        {/* 外框重型机械机箱 */}
        <mesh castShadow geometry={mainScreenFrameGeo}>
          <meshStandardMaterial color={STEEL_PANEL} metalness={0.94} roughness={0.2} emissive={CYAN} emissiveIntensity={0.08} />
        </mesh>
        {/* 顶部/底部发光霓虹封边 */}
        <mesh position={[0, 3.1, 0.12]} geometry={screenBezelGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} />
        </mesh>
        <mesh position={[0, -3.1, 0.12]} geometry={screenBezelGeo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} />
        </mesh>
        {/* 主显示屏面 */}
        <mesh position={[0, 0, 0.16]} geometry={mainScreenPanelGeo}>
          <meshBasicMaterial ref={mainScreenMatRef} toneMapped={false} />
        </mesh>
        {/* 动态全息激光扫描线 */}
        <mesh ref={scanLineRef} position={[0, 0, 0.19]}>
          <boxGeometry args={[10.5, 0.04, 0.01]} />
          <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.7} />
        </mesh>

        {/* 主屏两侧垂直霓虹光能立柱 */}
        <mesh ref={leftLightBarRef} position={[-5.5, 0, 0.18]} geometry={pillarLightGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.65} />
        </mesh>
        <mesh ref={rightLightBarRef} position={[5.5, 0, 0.18]} geometry={pillarLightGeo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} transparent opacity={0.65} />
        </mesh>

        {/* 主屏专属局部点光源，照亮中央核心台 */}
        <pointLight position={[0, 1.2, 2.5]} color={CYAN} intensity={24} distance={14} decay={2} />
        <pointLight position={[0, -1.8, 2.0]} color={SAFETY} intensity={16} distance={12} decay={2} />
      </group>

      {/* 5. 环形墙面水平/垂直霓虹光带 (Neon Perimeter Lines) */}
      {/* 北墙光带 */}
      <mesh position={[0, 8.8, -17.6]} geometry={neonTubeHorizGeo}>
        <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 0.35, -17.6]} geometry={neonTubeHorizGeo}>
        <meshBasicMaterial color={SAFETY} toneMapped={false} transparent opacity={0.7} />
      </mesh>

      {/* 西墙（左侧）光带与 3 组立体霓虹广告牌 */}
      <group position={[-16.4, 4.2, 0]}>
        {/* 西墙上下霓虹轨 */}
        <mesh position={[0, 4.6, 3]} rotation={[0, Math.PI / 2, 0]} geometry={neonTubeHorizGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.65} />
        </mesh>
        <mesh position={[0, -3.8, 3]} rotation={[0, Math.PI / 2, 0]} geometry={neonTubeHorizGeo}>
          <meshBasicMaterial color={EMERALD} toneMapped={false} transparent opacity={0.65} />
        </mesh>

        {/* 看板 1: 高并发架构 */}
        <group position={[0, 0.5, -8]} rotation={[0, Math.PI / 2, 0]}>
          <mesh geometry={billboardFrameGeo}>
            <meshStandardMaterial color={STEEL_PANEL} metalness={0.9} emissive={CYAN} emissiveIntensity={0.15} />
          </mesh>
          <mesh position={[0, 0, 0.11]} geometry={billboardPlaneGeo}>
            <meshBasicMaterial map={billboardTextures.west1} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 0, 1.2]} color={CYAN} intensity={14} distance={9} decay={2} />
        </group>

        {/* 看板 2: AIoT 空间水网 */}
        <group position={[0, 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh geometry={billboardFrameGeo}>
            <meshStandardMaterial color={STEEL_PANEL} metalness={0.9} emissive={EMERALD} emissiveIntensity={0.15} />
          </mesh>
          <mesh position={[0, 0, 0.11]} geometry={billboardPlaneGeo}>
            <meshBasicMaterial map={billboardTextures.west2} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 0, 1.2]} color={EMERALD} intensity={14} distance={9} decay={2} />
        </group>

        {/* 看板 3: 分布式治理 */}
        <group position={[0, 0.5, 8]} rotation={[0, Math.PI / 2, 0]}>
          <mesh geometry={billboardFrameGeo}>
            <meshStandardMaterial color={STEEL_PANEL} metalness={0.9} emissive={SAFETY} emissiveIntensity={0.15} />
          </mesh>
          <mesh position={[0, 0, 0.11]} geometry={billboardPlaneGeo}>
            <meshBasicMaterial map={billboardTextures.west3} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 0, 1.2]} color={SAFETY} intensity={14} distance={9} decay={2} />
        </group>
      </group>

      {/* 东墙（右侧）光带与 3 组立体霓虹广告牌 */}
      <group position={[16.4, 4.2, 0]}>
        {/* 东墙上下霓虹轨 */}
        <mesh position={[0, 4.6, 3]} rotation={[0, -Math.PI / 2, 0]} geometry={neonTubeHorizGeo}>
          <meshBasicMaterial color={PURPLE} toneMapped={false} transparent opacity={0.65} />
        </mesh>
        <mesh position={[0, -3.8, 3]} rotation={[0, -Math.PI / 2, 0]} geometry={neonTubeHorizGeo}>
          <meshBasicMaterial color={GOLD} toneMapped={false} transparent opacity={0.65} />
        </mesh>

        {/* 看板 1: AI Agent 智能体 */}
        <group position={[0, 0.5, -8]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh geometry={billboardFrameGeo}>
            <meshStandardMaterial color={STEEL_PANEL} metalness={0.9} emissive={PURPLE} emissiveIntensity={0.15} />
          </mesh>
          <mesh position={[0, 0, 0.11]} geometry={billboardPlaneGeo}>
            <meshBasicMaterial map={billboardTextures.east1} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 0, 1.2]} color={PURPLE} intensity={14} distance={9} decay={2} />
        </group>

        {/* 看板 2: 双路数据湖 */}
        <group position={[0, 0.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh geometry={billboardFrameGeo}>
            <meshStandardMaterial color={STEEL_PANEL} metalness={0.9} emissive={CYAN} emissiveIntensity={0.15} />
          </mesh>
          <mesh position={[0, 0, 0.11]} geometry={billboardPlaneGeo}>
            <meshBasicMaterial map={billboardTextures.east2} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 0, 1.2]} color={CYAN} intensity={14} distance={9} decay={2} />
        </group>

        {/* 看板 3: WeLink 统一搜索 */}
        <group position={[0, 0.5, 8]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh geometry={billboardFrameGeo}>
            <meshStandardMaterial color={STEEL_PANEL} metalness={0.9} emissive={GOLD} emissiveIntensity={0.15} />
          </mesh>
          <mesh position={[0, 0, 0.11]} geometry={billboardPlaneGeo}>
            <meshBasicMaterial map={billboardTextures.east3} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 0, 1.2]} color={GOLD} intensity={14} distance={9} decay={2} />
        </group>
      </group>

      {/* 6. 南侧入口迎宾赛博霓虹拱门 (z = 21.5) */}
      <group position={[0, 0, 21.5]}>
        <mesh position={[-5.8, 3.75, 0]} geometry={portalPillarGeo}>
          <meshStandardMaterial color={STEEL_DARK} metalness={0.92} emissive={CYAN} emissiveIntensity={0.15} />
        </mesh>
        <mesh position={[5.8, 3.75, 0]} geometry={portalPillarGeo}>
          <meshStandardMaterial color={STEEL_DARK} metalness={0.92} emissive={SAFETY} emissiveIntensity={0.15} />
        </mesh>
        <mesh position={[0, 7.3, 0]} geometry={portalBeamGeo}>
          <meshStandardMaterial color={STEEL_DARK} metalness={0.92} />
        </mesh>
        <mesh position={[0, 7.15, 0]} geometry={portalStripGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} />
        </mesh>
        <mesh position={[-5.8, 3.75, 0.25]} geometry={neonTubeVertGeo}>
          <meshBasicMaterial color={CYAN} toneMapped={false} />
        </mesh>
        <mesh position={[5.8, 3.75, 0.25]} geometry={neonTubeVertGeo}>
          <meshBasicMaterial color={SAFETY} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 4.0, -1.5]} color={CYAN} intensity={12} distance={10} decay={2} />
      </group>
    </group>
  );
}
