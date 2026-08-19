import { useRef } from 'react';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { EXHIBITS, getZoneFocus } from './scene-layout';

const ACCENTS = {
  signal: '#62e8cf',
  safety: '#ff6b3d',
  cyber: '#00d8ff',
} as const;

interface ExhibitBeaconProps {
  id: string;
  position: readonly [number, number, number];
  accent: keyof typeof ACCENTS;
  active: boolean;
  focusIntensity: number;
  interactive: boolean;
  motionEnabled: boolean;
  onSelect: (id: string) => void;
}

// 轻量级、高通透、无实体穿模的地面全息雷达光圈与聚焦高光
const groundBeaconRingGeo = new THREE.RingGeometry(2.1, 2.35, 48);
const groundActiveHaloGeo = new THREE.RingGeometry(2.45, 2.75, 48);

function ExhibitBeacon({ id, position, accent, active, focusIntensity, motionEnabled, onSelect }: ExhibitBeaconProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const color = active ? '#ff6b3d' : ACCENTS[accent];

  useFrame(({ clock }, delta) => {
    if (!motionEnabled) return;
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * (active ? 0.6 : 0.25);
    }
    if (haloRef.current && active) {
      haloRef.current.rotation.z -= delta * 0.45;
      const mat = haloRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.35 + Math.sin(clock.elapsedTime * 3) * 0.2;
      }
    }
  });

  const select = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(id);
  };

  const handlePointerOver = () => {
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = '';
  };

  return (
    <group position={position}>
      {/* 1. 地面隐形高灵敏度点击拾取圆盘 */}
      <mesh
        position={[0, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={select}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        visible={false}
      >
        <circleGeometry args={[2.8, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* 2. 地面全息旋转刻度光环（紧贴地表，完全不遮挡 3D 精细模型） */}
      <mesh
        ref={ringRef}
        position={[0, 0.025, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={groundBeaconRingGeo}
      >
        <meshBasicMaterial
          color={color}
          wireframe
          toneMapped={false}
          transparent
          opacity={active ? 0.75 : 0.25 + focusIntensity * 0.35}
        />
      </mesh>

      {/* 3. 激活状态下的外圈扩散脉冲环 */}
      {active && (
        <mesh
          ref={haloRef}
          position={[0, 0.028, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={groundActiveHaloGeo}
        >
          <meshBasicMaterial
            color={color}
            toneMapped={false}
            transparent
            opacity={0.45}
          />
        </mesh>
      )}

      {/* 4. 激活状态下的柔和展台向上投射高光 */}
      {active && (
        <pointLight position={[0, 2.2, 0]} color={color} intensity={12} distance={6.5} decay={2} />
      )}
    </group>
  );
}

interface ExhibitHotspotsProps {
  activeExhibit: string | null;
  motionEnabled: boolean;
  onSelectExhibit: (id: string) => void;
}

export function ExhibitHotspots({ activeExhibit, motionEnabled, onSelectExhibit }: ExhibitHotspotsProps) {
  return (
    <>
      {EXHIBITS.map((exhibit) => {
        const focus = getZoneFocus(activeExhibit, exhibit.id);
        return (
          <ExhibitBeacon
            key={exhibit.id}
            id={exhibit.id}
            position={exhibit.position}
            accent={exhibit.accent}
            active={activeExhibit === exhibit.id}
            focusIntensity={focus.intensity}
            interactive={focus.interactive}
            motionEnabled={motionEnabled}
            onSelect={onSelectExhibit}
          />
        );
      })}
    </>
  );
}

