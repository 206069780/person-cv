import { useMemo, useRef } from 'react';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { getModelRepresentation, ModelRepresentation } from '../data/model-representations';
import { EXHIBITS, ExhibitLayout } from './scene-layout';

// 预生成未选中时的高清全息标牌 CanvasTexture（1024x320 极清采样、大字号高对比、始终正对摄像机）
function createCompactTagTexture(model: ModelRepresentation): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  // 1. 深邃科技高对比半透底板
  ctx.fillStyle = 'rgba(4, 11, 16, 0.96)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. 科技网格微点阵
  ctx.fillStyle = 'rgba(40, 215, 229, 0.05)';
  for (let x = 16; x < canvas.width; x += 32) {
    for (let y = 16; y < canvas.height; y += 32) {
      ctx.fillRect(x, y, 2, 2);
    }
  }

  // 3. 强调色霓虹外发光边框
  ctx.strokeStyle = model.accentColor;
  ctx.lineWidth = 5;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

  // 四角高科技加固标线
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3.5;
  const cLen = 24;
  // 左上
  ctx.beginPath(); ctx.moveTo(4, 4 + cLen); ctx.lineTo(4, 4); ctx.lineTo(4 + cLen, 4); ctx.stroke();
  // 右上
  ctx.beginPath(); ctx.moveTo(canvas.width - 4 - cLen, 4); ctx.lineTo(canvas.width - 4, 4); ctx.lineTo(canvas.width - 4, 4 + cLen); ctx.stroke();
  // 左下
  ctx.beginPath(); ctx.moveTo(4, canvas.height - 4 - cLen); ctx.lineTo(4, canvas.height - 4); ctx.lineTo(4 + cLen, canvas.height - 4); ctx.stroke();
  // 右下
  ctx.beginPath(); ctx.moveTo(canvas.width - 4 - cLen, canvas.height - 4); ctx.lineTo(canvas.width - 4, canvas.height - 4); ctx.lineTo(canvas.width - 4, canvas.height - 4 - cLen); ctx.stroke();

  // 4. 序号徽章
  ctx.fillStyle = model.accentColor;
  ctx.fillRect(28, 26, 100, 46);

  ctx.font = 'bold 28px "IBM Plex Mono", Consolas, monospace';
  ctx.fillStyle = '#030a0e';
  ctx.textAlign = 'center';
  ctx.fillText(model.order, 78, 59);

  // 5. 英文代号
  ctx.textAlign = 'left';
  ctx.font = 'bold 24px "IBM Plex Mono", Consolas, monospace';
  ctx.fillStyle = model.accentColor;
  ctx.fillText(model.shortLabel, 146, 58);

  // 6. 右侧状态指示灯
  ctx.textAlign = 'right';
  ctx.font = 'bold 20px "IBM Plex Mono", "Noto Sans SC", sans-serif';
  ctx.fillStyle = 'rgba(40, 215, 229, 0.88)';
  ctx.fillText('● 3D 孪生就绪 · 待聚焦', canvas.width - 32, 58);

  // 7. 分隔线
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(28, 92);
  ctx.lineTo(canvas.width - 28, 92);
  ctx.stroke();

  // 8. 中文主标题（超清醒目）
  ctx.textAlign = 'left';
  ctx.font = 'bold 36px "Noto Sans SC", "PingFang SC", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(model.title, 28, 148);

  // 9. 代表实际业务系统
  ctx.font = '22px "Noto Sans SC", "PingFang SC", sans-serif';
  ctx.fillStyle = '#c5d8e2';
  const entityShort = model.entityName.length > 28 ? `${model.entityName.slice(0, 27)}...` : model.entityName;
  ctx.fillText(`代表业务: ${entityShort}`, 28, 206);

  // 10. 点击提示
  ctx.font = 'bold 20px "IBM Plex Mono", "Noto Sans SC", sans-serif';
  ctx.fillStyle = model.accentColor;
  ctx.fillText('▶ 点击对焦观察 3D 模型架构', 28, 268);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  return texture;
}

// 预生成选中时的高清全息标牌 CanvasTexture（大字号、高对比、始终正对摄像机）
function createInspectingTagTexture(model: ModelRepresentation): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 280;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(5, 13, 19, 0.96)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 强调色边框
  ctx.strokeStyle = model.accentColor;
  ctx.lineWidth = 5;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

  // 顶部状态与序号
  ctx.font = 'bold 24px "IBM Plex Mono", Consolas, monospace';
  ctx.fillStyle = model.accentColor;
  ctx.textAlign = 'left';
  ctx.fillText(`MODEL [${model.order}] · ${model.shortLabel}`, 28, 54);

  ctx.font = 'bold 22px "IBM Plex Mono", Consolas, monospace';
  ctx.fillStyle = '#ff6b3d';
  ctx.textAlign = 'right';
  ctx.fillText('● 正在对焦观察中', canvas.width - 28, 54);

  // 分隔线
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(28, 84);
  ctx.lineTo(canvas.width - 28, 84);
  ctx.stroke();

  // 中文标题
  ctx.textAlign = 'left';
  ctx.font = 'bold 38px "Noto Sans SC", "PingFang SC", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(model.title, 28, 144);

  // 代表业务系统
  ctx.font = '22px "Noto Sans SC", "PingFang SC", sans-serif';
  ctx.fillStyle = '#c5d8e2';
  const entityShort = model.entityName.length > 28 ? `${model.entityName.slice(0, 27)}...` : model.entityName;
  ctx.fillText(`代表业务: ${entityShort}`, 28, 198);

  // 交互引导
  ctx.font = 'bold 20px "IBM Plex Mono", "Noto Sans SC", sans-serif';
  ctx.fillStyle = '#ff6b3d';
  ctx.fillText('⚡ 鼠标拖拽 360° 旋转 · 滚轮缩放 · 右侧查看案例详情', 28, 246);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  return texture;
}

// 共享几何体（选中时轻盈的高科技瞄准定位标，绝不遮挡模型，也不会产生 3D 透视斜切糊字）
const reticleRingOuterGeo = new THREE.TorusGeometry(0.72, 0.014, 8, 48);
const reticleRingInnerGeo = new THREE.TorusGeometry(0.48, 0.01, 8, 36);
const reticleCrossGeo = new THREE.BoxGeometry(0.14, 0.012, 0.012);
const reticleBeamConeGeo = new THREE.CylinderGeometry(0.006, 0.22, 1.1, 16, 1, true);
const reticleTopPlateGeo = new THREE.PlaneGeometry(2.1, 0.58);
const reticleTopPlateWireGeo = new THREE.PlaneGeometry(2.14, 0.62);

const panelCompactGeo = new THREE.PlaneGeometry(2.1, 0.65);
const panelCompactWireGeo = new THREE.PlaneGeometry(2.14, 0.69);

interface SingleHologramTagProps {
  exhibit: ExhibitLayout;
  isActive: boolean;
  motionEnabled: boolean;
  onSelectExhibit: (id: string) => void;
}

function SingleHologramTag({ exhibit, isActive, motionEnabled, onSelectExhibit }: SingleHologramTagProps) {
  const model = getModelRepresentation(exhibit.id);
  const tagGroupRef = useRef<THREE.Group>(null);
  const reticleRef = useRef<THREE.Group>(null);
  const camera = useThree((state) => state.camera);

  // 纹理缓存
  const compactTexture = useMemo(() => (model ? createCompactTagTexture(model) : null), [model]);
  const inspectingTexture = useMemo(() => (model ? createInspectingTagTexture(model) : null), [model]);

  useFrame(({ clock }, delta) => {
    if (!tagGroupRef.current) return;

    // Billboard 核心：确保文字面板始终严格平行于摄像机视线（完全面向镜头正前方，绝不倾斜或背对）
    tagGroupRef.current.quaternion.copy(camera.quaternion);

    if (motionEnabled) {
      const floatOffset = Math.sin(clock.elapsedTime * 2 + exhibit.position[0]) * 0.035;
      tagGroupRef.current.position.y = (isActive ? 3.95 : 3.65) + floatOffset;
    }

    if (reticleRef.current && motionEnabled) {
      reticleRef.current.rotation.z += delta * 0.8;
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
        // 选中状态：在模型正上方呈现一个高科技全息瞄准环与聚焦激光锥，文字面板始终正对摄像机视野
        <group>
          {/* 3D 顶部紧凑状态牌（抬升高度 + depthTest=false + renderOrder=99，彻底解决穿模） */}
          {inspectingTexture && (
            <group
              ref={tagGroupRef}
              position={[0, 3.95, 0]}
              renderOrder={99}
              onClick={handleClick}
              onPointerOver={handlePointerOver}
              onPointerOut={handlePointerOut}
            >
              <mesh geometry={reticleTopPlateGeo}>
                <meshBasicMaterial
                  map={inspectingTexture}
                  transparent
                  toneMapped={false}
                  opacity={0.96}
                  depthTest={false}
                  depthWrite={false}
                  side={THREE.DoubleSide}
                />
              </mesh>
              <mesh position={[0, 0, -0.01]} geometry={reticleTopPlateWireGeo}>
                <meshBasicMaterial
                  color={model.accentColor}
                  wireframe
                  transparent
                  toneMapped={false}
                  opacity={0.35}
                  depthTest={false}
                  depthWrite={false}
                />
              </mesh>
            </group>
          )}

          {/* 3D 锁定瞄准环 */}
          <group position={[0, 3.2, 0]} renderOrder={90}>
            <group ref={reticleRef} rotation={[Math.PI / 2, 0, 0]}>
              <mesh geometry={reticleRingOuterGeo}>
                <meshBasicMaterial color={model.accentColor} toneMapped={false} transparent opacity={0.8} depthTest={false} depthWrite={false} />
              </mesh>
              <mesh geometry={reticleRingInnerGeo}>
                <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={0.6} depthTest={false} depthWrite={false} />
              </mesh>
              {/* 4向十字准星 */}
              {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, idx) => (
                <mesh key={idx} position={[Math.cos(angle) * 0.72, Math.sin(angle) * 0.72, 0]} rotation={[0, 0, angle]} geometry={reticleCrossGeo}>
                  <meshBasicMaterial color={model.accentColor} toneMapped={false} depthTest={false} depthWrite={false} />
                </mesh>
              ))}
            </group>

            {/* 聚光通透光锥引线直指模型核心 */}
            <mesh position={[0, -1.0, 0]} geometry={reticleBeamConeGeo}>
              <meshBasicMaterial color={model.accentColor} toneMapped={false} transparent opacity={0.25} depthTest={false} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      ) : (
        // 未选中状态：悬浮于模型上方的高清全息标牌（抬高至 3.65m + 禁用 depthTest，消除模型交错穿模）
        compactTexture && (
          <group
            ref={tagGroupRef}
            position={[0, 3.65, 0]}
            renderOrder={99}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <mesh geometry={panelCompactGeo}>
              <meshBasicMaterial
                map={compactTexture}
                transparent
                toneMapped={false}
                opacity={0.96}
                depthTest={false}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[0, 0, -0.01]} geometry={panelCompactWireGeo}>
              <meshBasicMaterial
                color={model.accentColor}
                wireframe
                transparent
                toneMapped={false}
                opacity={0.35}
                depthTest={false}
                depthWrite={false}
              />
            </mesh>
            {/* 底部高科技引线连通至模型顶部 */}
            <mesh position={[0, -0.55, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.45, 6]} />
              <meshBasicMaterial color={model.accentColor} toneMapped={false} transparent opacity={0.7} depthTest={false} depthWrite={false} />
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

