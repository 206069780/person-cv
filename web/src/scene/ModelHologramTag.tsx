import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { getModelRepresentation, ModelRepresentation } from '../data/model-representations';
import { EXHIBITS, ExhibitLayout } from './scene-layout';

// 预生成每个展品的 Compact 全息标牌 CanvasTexture（未选中时展示，高过模型顶部，绝无遮挡）
function createCompactTagTexture(model: ModelRepresentation): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 120;
  const ctx = canvas.getContext('2d')!;

  // 1. 半透明深邃科技底板
  ctx.fillStyle = 'rgba(6, 14, 20, 0.9)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 发光边框
  ctx.strokeStyle = model.accentColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  // 四角高科技标线
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  const cLen = 12;
  ctx.beginPath();
  ctx.moveTo(2, 2 + cLen); ctx.lineTo(2, 2); ctx.lineTo(2 + cLen, 2);
  ctx.moveTo(canvas.width - 2 - cLen, 2); ctx.lineTo(canvas.width - 2, 2); ctx.lineTo(canvas.width - 2, 2 + cLen);
  ctx.moveTo(2, canvas.height - 2 - cLen); ctx.lineTo(2, canvas.height - 2); ctx.lineTo(2 + cLen, canvas.height - 2);
  ctx.moveTo(canvas.width - 2 - cLen, canvas.height - 2); ctx.lineTo(canvas.width - 2, canvas.height - 2); ctx.lineTo(canvas.width - 2, canvas.height - 2 - cLen);
  ctx.stroke();

  // 2. 序号色块
  ctx.fillStyle = model.accentColor;
  ctx.fillRect(14, 16, 68, 32);

  ctx.font = 'bold 20px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillStyle = '#040d12';
  ctx.textAlign = 'center';
  ctx.fillText(model.order, 48, 39);

  // 3. 英文代号与主标题
  ctx.textAlign = 'left';
  ctx.font = 'bold 16px "IBM Plex Mono", Consolas, sans-serif';
  ctx.fillStyle = model.accentColor;
  ctx.fillText(model.shortLabel, 94, 34);

  ctx.font = 'bold 24px "Noto Sans SC", "PingFang SC", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(model.title, 168, 43);

  // 4. 底部微弱分隔线与代表系统提示
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(14, 62);
  ctx.lineTo(canvas.width - 14, 62);
  ctx.stroke();

  ctx.font = '14px "Noto Sans SC", "PingFang SC", sans-serif';
  ctx.fillStyle = '#9cb5c1';
  const entityShort = model.entityName.length > 22 ? `${model.entityName.slice(0, 21)}...` : model.entityName;
  ctx.fillText(`代表: ${entityShort}`, 14, 94);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

// 共享几何体（选中时轻盈的高科技瞄准定位标，绝不遮挡模型，也不会被模型遮挡）
const reticleRingOuterGeo = new THREE.TorusGeometry(0.85, 0.016, 8, 48);
const reticleRingInnerGeo = new THREE.TorusGeometry(0.55, 0.012, 8, 36);
const reticleCrossGeo = new THREE.BoxGeometry(0.18, 0.015, 0.015);
const reticleBeamConeGeo = new THREE.CylinderGeometry(0.01, 0.45, 1.2, 16, 1, true);

interface SingleHologramTagProps {
  exhibit: ExhibitLayout;
  isActive: boolean;
  motionEnabled: boolean;
}

function SingleHologramTag({ exhibit, isActive, motionEnabled }: SingleHologramTagProps) {
  const model = getModelRepresentation(exhibit.id);
  const tagGroupRef = useRef<THREE.Group>(null);
  const reticleRef = useRef<THREE.Group>(null);
  const camera = useThree((state) => state.camera);

  // 纹理缓存
  const compactTexture = useMemo(() => (model ? createCompactTagTexture(model) : null), [model]);

  useFrame(({ clock }, delta) => {
    if (!tagGroupRef.current) return;

    // Billboard 效果：标牌始终面向摄像机方位
    tagGroupRef.current.quaternion.copy(camera.quaternion);

    if (motionEnabled) {
      const floatOffset = Math.sin(clock.elapsedTime * 2 + exhibit.position[0]) * 0.04;
      tagGroupRef.current.position.y = 2.95 + floatOffset;
    }

    if (reticleRef.current && motionEnabled) {
      reticleRef.current.rotation.z += delta * 0.8;
    }
  });

  if (!model) return null;

  return (
    <group position={[0, 0, 0]}>
      {isActive ? (
        // 选中时：在模型正上方呈现一个轻量、通透的 3D 瞄准定位激光标（文字完全交给 2D HUD 浮窗展示，0 遮挡）
        <group position={[0, 3.1, 0]}>
          <group ref={reticleRef} rotation={[Math.PI / 2, 0, 0]}>
            <mesh geometry={reticleRingOuterGeo}>
              <meshBasicMaterial color={model.accentColor} toneMapped={false} transparent opacity={0.7} />
            </mesh>
            <mesh geometry={reticleRingInnerGeo}>
              <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={0.5} />
            </mesh>
            {/* 4向十字准星 */}
            {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, idx) => (
              <mesh key={idx} position={[Math.cos(angle) * 0.7, Math.sin(angle) * 0.7, 0]} rotation={[0, 0, angle]} geometry={reticleCrossGeo}>
                <meshBasicMaterial color={model.accentColor} toneMapped={false} />
              </mesh>
            ))}
          </group>

          {/* 聚光通透光锥引线 */}
          <mesh position={[0, -0.6, 0]} geometry={reticleBeamConeGeo}>
            <meshBasicMaterial color={model.accentColor} toneMapped={false} transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ) : (
        // 未选中时：悬浮于模型顶部之上的小巧全息标牌（高 2.95m，彻底避开模型所有机柜与天线）
        compactTexture && (
          <group ref={tagGroupRef} position={[0, 2.95, 0]}>
            <mesh>
              <planeGeometry args={[1.7, 0.44]} />
              <meshBasicMaterial map={compactTexture} transparent toneMapped={false} opacity={0.88} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[1.74, 0.48]} />
              <meshBasicMaterial color={model.accentColor} wireframe transparent toneMapped={false} opacity={0.25} />
            </mesh>
            {/* 底部小引线 */}
            <mesh position={[0, -0.32, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.24, 6]} />
              <meshBasicMaterial color={model.accentColor} toneMapped={false} transparent opacity={0.5} />
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
