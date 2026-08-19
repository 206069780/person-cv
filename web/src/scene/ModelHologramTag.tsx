import { useMemo, useRef } from 'react';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { getModelRepresentation, ModelRepresentation } from '../data/model-representations';
import { EXHIBITS, ExhibitLayout } from './scene-layout';

// 预生成未选中时的 Compact 全息标牌 CanvasTexture（大字号、高对比、绝无遮挡与模糊）
function createCompactTagTexture(model: ModelRepresentation): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext('2d')!;

  // 1. 深邃科技半透底板
  ctx.fillStyle = 'rgba(5, 12, 17, 0.94)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. 外发光边框
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

  // 3. 序号徽章
  ctx.fillStyle = model.accentColor;
  ctx.fillRect(16, 18, 76, 36);

  ctx.font = 'bold 22px "IBM Plex Mono", Consolas, monospace';
  ctx.fillStyle = '#040d12';
  ctx.textAlign = 'center';
  ctx.fillText(model.order, 54, 44);

  // 4. 英文代号与主标题
  ctx.textAlign = 'left';
  ctx.font = 'bold 16px "IBM Plex Mono", Consolas, monospace';
  ctx.fillStyle = model.accentColor;
  ctx.fillText(model.shortLabel, 104, 34);

  ctx.font = 'bold 24px "Noto Sans SC", "PingFang SC", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(model.title, 184, 44);

  // 分隔线
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(16, 68);
  ctx.lineTo(canvas.width - 16, 68);
  ctx.stroke();

  // 5. 代表实际系统（大字清晰）
  ctx.font = '16px "Noto Sans SC", "PingFang SC", sans-serif';
  ctx.fillStyle = '#b2c7d2';
  const entityShort = model.entityName.length > 22 ? `${model.entityName.slice(0, 21)}...` : model.entityName;
  ctx.fillText(`代表: ${entityShort}`, 16, 98);

  // 6. 点击提示
  ctx.font = 'bold 13px "IBM Plex Mono", "Noto Sans SC", sans-serif';
  ctx.fillStyle = model.accentColor;
  ctx.fillText('▶ 点击对焦观察 3D 模型', 16, 124);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

// 预生成选中时的轻量 3D 顶部对焦标识
function createInspectingTagTexture(model: ModelRepresentation): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 110;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(6, 14, 20, 0.94)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = model.accentColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  // 顶部状态
  ctx.font = 'bold 16px "IBM Plex Mono", Consolas, monospace';
  ctx.fillStyle = model.accentColor;
  ctx.textAlign = 'left';
  ctx.fillText(`MODEL [${model.order}] · ${model.shortLabel}`, 18, 32);

  ctx.font = 'bold 14px "IBM Plex Mono", Consolas, monospace';
  ctx.fillStyle = '#ff6b3d';
  ctx.textAlign = 'right';
  ctx.fillText('● 正在对焦观察', canvas.width - 18, 32);

  // 中文标题
  ctx.textAlign = 'left';
  ctx.font = 'bold 26px "Noto Sans SC", "PingFang SC", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(model.title, 18, 76);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

// 共享几何体（选中时轻盈的高科技瞄准定位标，绝不遮挡模型，也不会产生 3D 透视斜切糊字）
const reticleRingOuterGeo = new THREE.TorusGeometry(0.88, 0.016, 8, 48);
const reticleRingInnerGeo = new THREE.TorusGeometry(0.56, 0.012, 8, 36);
const reticleCrossGeo = new THREE.BoxGeometry(0.18, 0.015, 0.015);
const reticleBeamConeGeo = new THREE.CylinderGeometry(0.01, 0.45, 1.4, 16, 1, true);
const reticleTopPlateGeo = new THREE.PlaneGeometry(1.8, 0.42);
const reticleTopPlateWireGeo = new THREE.PlaneGeometry(1.84, 0.46);

const panelCompactGeo = new THREE.PlaneGeometry(1.7, 0.46);
const panelCompactWireGeo = new THREE.PlaneGeometry(1.74, 0.5);

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

    // Billboard 效果：标牌始终面向摄像机方位
    tagGroupRef.current.quaternion.copy(camera.quaternion);

    if (motionEnabled) {
      const floatOffset = Math.sin(clock.elapsedTime * 2 + exhibit.position[0]) * 0.035;
      tagGroupRef.current.position.y = (isActive ? 3.35 : 2.95) + floatOffset;
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
        // 选中状态：在模型正上方呈现一个高科技全息瞄准环与聚焦激光锥，文字交给 2D HUD 高清展示，绝不遮挡模型与产生糊字
        <group>
          {/* 3D 顶部紧凑状态牌 */}
          {inspectingTexture && (
            <group
              ref={tagGroupRef}
              position={[0, 3.35, 0]}
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
                  depthWrite={false}
                  side={THREE.DoubleSide}
                />
              </mesh>
              <mesh position={[0, 0, -0.01]} geometry={reticleTopPlateWireGeo}>
                <meshBasicMaterial color={model.accentColor} wireframe transparent toneMapped={false} opacity={0.35} depthWrite={false} />
              </mesh>
            </group>
          )}

          {/* 3D 锁定瞄准环 */}
          <group position={[0, 2.7, 0]}>
            <group ref={reticleRef} rotation={[Math.PI / 2, 0, 0]}>
              <mesh geometry={reticleRingOuterGeo}>
                <meshBasicMaterial color={model.accentColor} toneMapped={false} transparent opacity={0.75} />
              </mesh>
              <mesh geometry={reticleRingInnerGeo}>
                <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={0.55} />
              </mesh>
              {/* 4向十字准星 */}
              {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, idx) => (
                <mesh key={idx} position={[Math.cos(angle) * 0.72, Math.sin(angle) * 0.72, 0]} rotation={[0, 0, angle]} geometry={reticleCrossGeo}>
                  <meshBasicMaterial color={model.accentColor} toneMapped={false} />
                </mesh>
              ))}
            </group>

            {/* 聚光通透光锥引线直指模型核心 */}
            <mesh position={[0, -0.7, 0]} geometry={reticleBeamConeGeo}>
              <meshBasicMaterial color={model.accentColor} toneMapped={false} transparent opacity={0.25} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      ) : (
        // 未选中状态：悬浮于模型上方的高清全息标牌（高 2.95m，点击可秒级对焦）
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
                opacity={0.92}
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

