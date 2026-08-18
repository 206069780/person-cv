import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { getModelRepresentation, ModelRepresentation } from '../data/model-representations';
import { EXHIBITS, ExhibitLayout } from './scene-layout';

// 预生成每个展品的 Compact 和 Active 全息 CanvasTexture 纹理缓存
function createCompactTexture(model: ModelRepresentation): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext('2d')!;

  // 1. 半透明深邃背景与微发光边框
  ctx.fillStyle = 'rgba(6, 14, 20, 0.88)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = model.accentColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  // 四角高科技标线
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  const cLen = 14;
  ctx.beginPath();
  // 左上
  ctx.moveTo(2, 2 + cLen); ctx.lineTo(2, 2); ctx.lineTo(2 + cLen, 2);
  // 右上
  ctx.moveTo(canvas.width - 2 - cLen, 2); ctx.lineTo(canvas.width - 2, 2); ctx.lineTo(canvas.width - 2, 2 + cLen);
  // 左下
  ctx.moveTo(2, canvas.height - 2 - cLen); ctx.lineTo(2, canvas.height - 2); ctx.lineTo(2 + cLen, canvas.height - 2);
  // 右下
  ctx.moveTo(canvas.width - 2 - cLen, canvas.height - 2); ctx.lineTo(canvas.width - 2, canvas.height - 2); ctx.lineTo(canvas.width - 2, canvas.height - 2 - cLen);
  ctx.stroke();

  // 2. 左侧序号色块
  ctx.fillStyle = model.accentColor;
  ctx.fillRect(16, 20, 72, 34);

  ctx.font = 'bold 20px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillStyle = '#040d12';
  ctx.textAlign = 'center';
  ctx.fillText(model.order, 52, 45);

  // 3. 英文代号与主标题
  ctx.textAlign = 'left';
  ctx.font = 'bold 16px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillStyle = model.accentColor;
  ctx.fillText(model.shortLabel, 100, 36);

  ctx.font = 'bold 24px "Noto Sans SC", "PingFang SC", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(model.title, 172, 46);

  // 分隔线
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(16, 68);
  ctx.lineTo(canvas.width - 16, 68);
  ctx.stroke();

  // 4. 代表实际系统（一句话）
  ctx.font = '15px "Noto Sans SC", "PingFang SC", sans-serif';
  ctx.fillStyle = '#9fb3bd';
  const entityShort = model.entityName.length > 25 ? `${model.entityName.slice(0, 24)}...` : model.entityName;
  ctx.fillText(`代表: ${entityShort}`, 16, 96);

  // 5. 构件摘要
  ctx.font = '13px "IBM Plex Mono", "Noto Sans SC", sans-serif';
  ctx.fillStyle = model.accentColor;
  ctx.fillText(`构件: ${model.visualMetaphorSummary}`, 16, 122);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function createActiveTexture(model: ModelRepresentation): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 540;
  const ctx = canvas.getContext('2d')!;

  // 1. 深邃赛博半透明底板
  ctx.fillStyle = 'rgba(5, 12, 18, 0.94)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 外边框与高亮霓虹
  ctx.strokeStyle = model.accentColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

  // 内嵌细线
  ctx.strokeStyle = 'rgba(40, 215, 229, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

  // 顶部发光栏
  ctx.fillStyle = 'rgba(40, 215, 229, 0.12)';
  ctx.fillRect(14, 14, canvas.width - 28, 64);

  // 顶部标题
  ctx.font = 'bold 22px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillStyle = model.accentColor;
  ctx.textAlign = 'left';
  ctx.fillText(`◆ 3D DIGITAL TWIN · MODEL [${model.order}] · ${model.shortLabel}`, 32, 54);

  ctx.font = 'bold 18px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillStyle = '#ff6b3d';
  ctx.textAlign = 'right';
  ctx.fillText('STATUS: ACTIVE INSPECTION', canvas.width - 32, 54);

  // 主标题
  ctx.textAlign = 'left';
  ctx.font = 'bold 36px "Noto Sans SC", "PingFang SC", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(model.title, 32, 124);

  ctx.font = '18px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillStyle = '#8fa2ab';
  ctx.fillText(model.subTitle, 32, 154);

  // 代表实际架构实体区块（非常醒目的高亮卡片）
  ctx.fillStyle = 'rgba(0, 168, 157, 0.16)';
  ctx.fillRect(32, 172, canvas.width - 64, 100);
  ctx.strokeStyle = 'rgba(0, 168, 157, 0.6)';
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 172, canvas.width - 64, 100);

  ctx.font = 'bold 15px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillStyle = '#28d7e5';
  ctx.fillText('【 3D 模型代表实际系统架构 】', 48, 202);

  ctx.font = 'bold 21px "Noto Sans SC", "PingFang SC", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(model.entityName, 48, 234);

  ctx.font = '16px "Noto Sans SC", "PingFang SC", sans-serif';
  ctx.fillStyle = '#b0c2cb';
  ctx.fillText(model.entityDescription, 48, 258);

  // 3D 视觉构件隐喻与映射解析 (Visual Metaphor Breakdown)
  ctx.font = 'bold 16px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillStyle = model.accentColor;
  ctx.fillText('【 3D 视觉构件隐喻与架构映射 】', 32, 305);

  const startY = 336;
  model.components.slice(0, 3).forEach((comp, idx) => {
    const y = startY + idx * 46;
    // 构件标签块
    ctx.fillStyle = 'rgba(255, 107, 61, 0.18)';
    ctx.fillRect(32, y - 22, 170, 32);
    ctx.strokeStyle = '#ff6b3d';
    ctx.lineWidth = 1;
    ctx.strokeRect(32, y - 22, 170, 32);

    ctx.font = 'bold 14px "Noto Sans SC", "PingFang SC", sans-serif';
    ctx.fillStyle = '#ff9f7d';
    ctx.fillText(comp.name, 42, y);

    // 象征内容
    ctx.font = '16px "Noto Sans SC", "PingFang SC", sans-serif';
    ctx.fillStyle = '#d8e5ea';
    const text = comp.metaphor;
    ctx.fillText(text.length > 34 ? `${text.slice(0, 33)}...` : text, 216, y);
  });

  // 底部控制指示条
  ctx.fillStyle = 'rgba(10, 24, 32, 0.9)';
  ctx.fillRect(14, canvas.height - 48, canvas.width - 28, 34);

  ctx.font = 'bold 14px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillStyle = '#28d7e5';
  ctx.fillText('◀ 按住鼠标左键 360° 空间观察 · 滚轮缩放 · 点击右侧查看全量工程落地与难点 ▶', 32, canvas.height - 26);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

interface SingleHologramTagProps {
  exhibit: ExhibitLayout;
  isActive: boolean;
  motionEnabled: boolean;
}

function SingleHologramTag({ exhibit, isActive, motionEnabled }: SingleHologramTagProps) {
  const model = getModelRepresentation(exhibit.id);
  const tagGroupRef = useRef<THREE.Group>(null);
  const camera = useThree((state) => state.camera);

  // 纹理缓存
  const compactTexture = useMemo(() => (model ? createCompactTexture(model) : null), [model]);
  const activeTexture = useMemo(() => (model ? createActiveTexture(model) : null), [model]);

  useFrame(({ clock }) => {
    if (!tagGroupRef.current) return;
    // Billboard 效果：让标牌始终面向摄像机方位（围绕 Y 轴旋转），保持清晰正对用户
    tagGroupRef.current.quaternion.copy(camera.quaternion);

    if (motionEnabled) {
      // 微微浮动
      const floatOffset = Math.sin(clock.elapsedTime * 2 + exhibit.position[0]) * 0.04;
      tagGroupRef.current.position.y = (isActive ? 3.35 : 2.65) + floatOffset;
    }
  });

  if (!model || !compactTexture || !activeTexture) return null;

  return (
    <group ref={tagGroupRef} position={[0, isActive ? 3.35 : 2.65, 0]}>
      {isActive ? (
        // 选中时的大型全息解构蓝图面板
        <group>
          {/* 主全息面板 */}
          <mesh>
            <planeGeometry args={[3.2, 1.7]} />
            <meshBasicMaterial map={activeTexture} transparent toneMapped={false} opacity={0.96} side={THREE.DoubleSide} />
          </mesh>

          {/* 背部科技微发光框架 */}
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[3.26, 1.76]} />
            <meshBasicMaterial color={model.accentColor} wireframe transparent toneMapped={false} opacity={0.35} />
          </mesh>

          {/* 底部与展台相连的光纤引线 */}
          <mesh position={[0, -1.05, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.6, 6]} />
            <meshBasicMaterial color={model.accentColor} toneMapped={false} transparent opacity={0.8} />
          </mesh>
        </group>
      ) : (
        // 未选中时的紧凑小标牌
        <group>
          <mesh>
            <planeGeometry args={[1.75, 0.48]} />
            <meshBasicMaterial map={compactTexture} transparent toneMapped={false} opacity={0.88} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[1.79, 0.52]} />
            <meshBasicMaterial color={model.accentColor} wireframe transparent toneMapped={false} opacity={0.25} />
          </mesh>
          {/* 底部小引线 */}
          <mesh position={[0, -0.38, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.32, 6]} />
            <meshBasicMaterial color={model.accentColor} toneMapped={false} transparent opacity={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function ModelHologramTags({
  activeExhibit,
  motionEnabled,
}: {
  activeExhibit: string | null;
  motionEnabled: boolean;
}) {
  return (
    <>
      {EXHIBITS.map((exhibit) => (
        <group key={`tag-${exhibit.id}`} position={exhibit.position}>
          <SingleHologramTag
            exhibit={exhibit}
            isActive={activeExhibit === exhibit.id}
            motionEnabled={motionEnabled}
          />
        </group>
      ))}
    </>
  );
}
