import { useMemo, useRef } from 'react';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { getModelRepresentation, ModelRepresentation } from '../data/model-representations';
import { EXHIBITS, ExhibitLayout } from './scene-layout';

// 预生成未选中时的 Compact 全息标牌 CanvasTexture
function createCompactTagTexture(model: ModelRepresentation): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 130;
  const ctx = canvas.getContext('2d')!;

  // 1. 半透明深邃科技底板
  ctx.fillStyle = 'rgba(6, 14, 20, 0.92)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 发光边框
  ctx.strokeStyle = model.accentColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  // 四角高科技标线
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  const cLen = 14;
  ctx.beginPath();
  ctx.moveTo(2, 2 + cLen); ctx.lineTo(2, 2); ctx.lineTo(2 + cLen, 2);
  ctx.moveTo(canvas.width - 2 - cLen, 2); ctx.lineTo(canvas.width - 2, 2); ctx.lineTo(canvas.width - 2, 2 + cLen);
  ctx.moveTo(2, canvas.height - 2 - cLen); ctx.lineTo(2, canvas.height - 2); ctx.lineTo(2 + cLen, canvas.height - 2);
  ctx.moveTo(canvas.width - 2 - cLen, canvas.height - 2); ctx.lineTo(canvas.width - 2, canvas.height - 2); ctx.lineTo(canvas.width - 2, canvas.height - 2 - cLen);
  ctx.stroke();

  // 2. 序号色块
  ctx.fillStyle = model.accentColor;
  ctx.fillRect(16, 18, 72, 34);

  ctx.font = 'bold 20px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillStyle = '#040d12';
  ctx.textAlign = 'center';
  ctx.fillText(model.order, 52, 43);

  // 3. 英文代号与主标题
  ctx.textAlign = 'left';
  ctx.font = 'bold 16px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillStyle = model.accentColor;
  ctx.fillText(model.shortLabel, 100, 36);

  ctx.font = 'bold 24px "Noto Sans SC", "PingFang SC", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(model.title, 172, 45);

  // 分隔线
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(16, 68);
  ctx.lineTo(canvas.width - 16, 68);
  ctx.stroke();

  // 4. 代表实际系统
  ctx.font = '15px "Noto Sans SC", "PingFang SC", sans-serif';
  ctx.fillStyle = '#9cb5c1';
  const entityShort = model.entityName.length > 23 ? `${model.entityName.slice(0, 22)}...` : model.entityName;
  ctx.fillText(`代表: ${entityShort}`, 16, 96);

  // 5. 点击提示
  ctx.font = '12px "IBM Plex Mono", "Noto Sans SC", sans-serif';
  ctx.fillStyle = model.accentColor;
  ctx.fillText('▶ 点击对焦观察', canvas.width - 120, 118);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

// 预生成选中时的 Active 高清全息解构面板 CanvasTexture（位于高空开阔区，绝不遮挡文字）
function createActiveTagTexture(model: ModelRepresentation): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. 深邃半透明磨砂科技底板
  ctx.fillStyle = 'rgba(5, 13, 19, 0.94)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 外边框与霓虹发光
  ctx.strokeStyle = model.accentColor;
  ctx.lineWidth = 5;
  ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

  // 内嵌细线
  ctx.strokeStyle = 'rgba(40, 215, 229, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // 顶部状态栏
  ctx.fillStyle = 'rgba(40, 215, 229, 0.12)';
  ctx.fillRect(12, 12, canvas.width - 24, 52);

  ctx.font = 'bold 20px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillStyle = model.accentColor;
  ctx.textAlign = 'left';
  ctx.fillText(`◆ 3D DIGITAL TWIN · MODEL [${model.order}] · ${model.shortLabel}`, 28, 46);

  ctx.font = 'bold 16px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillStyle = '#ff6b3d';
  ctx.textAlign = 'right';
  ctx.fillText('STATUS: ACTIVE INSPECTION', canvas.width - 28, 46);

  // 主标题与副标题
  ctx.textAlign = 'left';
  ctx.font = 'bold 32px "Noto Sans SC", "PingFang SC", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(model.title, 28, 106);

  ctx.font = '16px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillStyle = '#8fa2ab';
  ctx.fillText(model.subTitle, 28, 134);

  // 代表实际系统实体卡片
  ctx.fillStyle = 'rgba(0, 168, 157, 0.16)';
  ctx.fillRect(28, 150, canvas.width - 56, 88);
  ctx.strokeStyle = 'rgba(0, 168, 157, 0.6)';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 150, canvas.width - 56, 88);

  ctx.font = 'bold 14px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillStyle = '#28d7e5';
  ctx.fillText('【 3D 模型代表实际系统架构 】', 42, 178);

  ctx.font = 'bold 19px "Noto Sans SC", "PingFang SC", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(model.entityName, 42, 206);

  ctx.font = '15px "Noto Sans SC", "PingFang SC", sans-serif';
  ctx.fillStyle = '#a9bec9';
  ctx.fillText(model.entityDescription, 42, 226);

  // 3D 视觉构件隐喻解析
  ctx.font = 'bold 15px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillStyle = model.accentColor;
  ctx.fillText('【 3D 视觉构件隐喻与架构映射 】', 28, 268);

  const startY = 296;
  model.components.slice(0, 3).forEach((comp, idx) => {
    const y = startY + idx * 42;
    // 标签块
    ctx.fillStyle = 'rgba(255, 107, 61, 0.18)';
    ctx.fillRect(28, y - 18, 160, 28);
    ctx.strokeStyle = '#ff6b3d';
    ctx.lineWidth = 1;
    ctx.strokeRect(28, y - 18, 160, 28);

    ctx.font = 'bold 13px "Noto Sans SC", "PingFang SC", sans-serif';
    ctx.fillStyle = '#ff9f7d';
    ctx.fillText(comp.name, 36, y);

    // 隐喻内容
    ctx.font = '15px "Noto Sans SC", "PingFang SC", sans-serif';
    ctx.fillStyle = '#d5e4ea';
    const text = comp.metaphor;
    ctx.fillText(text.length > 35 ? `${text.slice(0, 34)}...` : text, 200, y);
  });

  // 底部操作指引栏
  ctx.fillStyle = 'rgba(10, 24, 32, 0.9)';
  ctx.fillRect(12, canvas.height - 42, canvas.width - 24, 30);

  ctx.font = 'bold 13px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillStyle = '#28d7e5';
  ctx.fillText('◀ 按住左键 360° 空间旋转 · 滚轮缩放 · 点击其他展位对焦切换 · 右侧查看案例 ▶', 28, canvas.height - 22);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

// 共享几何体
const panelActiveGeo = new THREE.PlaneGeometry(2.4, 1.2);
const panelActiveWireGeo = new THREE.PlaneGeometry(2.44, 1.24);
const panelCompactGeo = new THREE.PlaneGeometry(1.68, 0.44);
const panelCompactWireGeo = new THREE.PlaneGeometry(1.72, 0.48);
const leadLineGeo = new THREE.CylinderGeometry(0.01, 0.01, 1.5, 6);
const leadConeGeo = new THREE.CylinderGeometry(0.01, 0.35, 1.2, 16, 1, true);
const leadAnchorRingGeo = new THREE.TorusGeometry(0.24, 0.015, 6, 24);

interface SingleHologramTagProps {
  exhibit: ExhibitLayout;
  isActive: boolean;
  motionEnabled: boolean;
  onSelectExhibit: (id: string) => void;
}

function SingleHologramTag({ exhibit, isActive, motionEnabled, onSelectExhibit }: SingleHologramTagProps) {
  const model = getModelRepresentation(exhibit.id);
  const tagGroupRef = useRef<THREE.Group>(null);
  const anchorRef = useRef<THREE.Mesh>(null);
  const camera = useThree((state) => state.camera);

  // 纹理缓存
  const compactTexture = useMemo(() => (model ? createCompactTagTexture(model) : null), [model]);
  const activeTexture = useMemo(() => (model ? createActiveTagTexture(model) : null), [model]);

  useFrame(({ clock }, delta) => {
    if (!tagGroupRef.current) return;

    // Billboard 效果：面板始终面向摄像机朝向
    tagGroupRef.current.quaternion.copy(camera.quaternion);

    if (motionEnabled) {
      // 微微科技悬浮浮动
      const floatOffset = Math.sin(clock.elapsedTime * 2 + exhibit.position[0]) * 0.035;
      tagGroupRef.current.position.y = (isActive ? 3.65 : 2.95) + floatOffset;
    }

    if (anchorRef.current && motionEnabled) {
      anchorRef.current.rotation.z += delta * 0.9;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelectExhibit(exhibit.id);
  };

  const handlePointerOver = () => {
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = '';
  };

  if (!model) return null;

  return (
    <group position={[0, 0, 0]}>
      {isActive ? (
        // 选中状态：悬浮在高空开阔区（y = 3.65m）的大型全息解构展板，底部有导引光束，绝无模型构件遮挡
        <group>
          {/* 主全息面板主体（始终面向相机） */}
          <group ref={tagGroupRef} position={[0, 3.65, 0]}>
            <mesh
              geometry={panelActiveGeo}
              onClick={handleClick}
              onPointerOver={handlePointerOver}
              onPointerOut={handlePointerOut}
            >
              <meshBasicMaterial
                map={activeTexture!}
                transparent
                toneMapped={false}
                opacity={0.97}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* 背部科技微发光框架 */}
            <mesh position={[0, 0, -0.01]} geometry={panelActiveWireGeo}>
              <meshBasicMaterial color={model.accentColor} wireframe transparent toneMapped={false} opacity={0.35} depthWrite={false} />
            </mesh>
          </group>

          {/* 底部全息导引激光束（贯通高空全息板与展台核心） */}
          <group position={[0, 2.3, 0]}>
            <mesh geometry={leadLineGeo}>
              <meshBasicMaterial color={model.accentColor} toneMapped={false} transparent opacity={0.8} />
            </mesh>
            <mesh position={[0, 0.2, 0]} geometry={leadConeGeo}>
              <meshBasicMaterial color={model.accentColor} toneMapped={false} transparent opacity={0.22} side={THREE.DoubleSide} />
            </mesh>
            {/* 展品顶部发光微锚点 */}
            <mesh ref={anchorRef} position={[0, -0.8, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={leadAnchorRingGeo}>
              <meshBasicMaterial color={model.accentColor} toneMapped={false} transparent opacity={0.8} />
            </mesh>
          </group>
        </group>
      ) : (
        // 未选中状态：悬浮于模型上方的小巧全息标牌（y = 2.95m，点击可秒级对焦）
        compactTexture && (
          <group
            ref={tagGroupRef}
            position={[0, 2.95, 0]}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <mesh geometry={panelCompactGeo}>
              <meshBasicMaterial
                map={compactTexture}
                transparent
                toneMapped={false}
                opacity={0.9}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[0, 0, -0.01]} geometry={panelCompactWireGeo}>
              <meshBasicMaterial color={model.accentColor} wireframe transparent toneMapped={false} opacity={0.3} depthWrite={false} />
            </mesh>
            {/* 底部微引线 */}
            <mesh position={[0, -0.32, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.24, 6]} />
              <meshBasicMaterial color={model.accentColor} toneMapped={false} transparent opacity={0.6} />
            </mesh>
          </group>
        )
      )}
    </group>
  );
}

export function ModelHologramTags({
  activeExhibit,
  motionEnabled,
  onSelectExhibit,
}: {
  activeExhibit: string | null;
  motionEnabled: boolean;
  onSelectExhibit: (id: string) => void;
}) {
  return (
    <>
      {EXHIBITS.map((exhibit) => (
        <group key={`tag-${exhibit.id}`} position={exhibit.position}>
          <SingleHologramTag
            exhibit={exhibit}
            isActive={activeExhibit === exhibit.id}
            motionEnabled={motionEnabled}
            onSelectExhibit={onSelectExhibit}
          />
        </group>
      ))}
    </>
  );
}
