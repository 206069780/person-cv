import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import type { MotionProps } from '../scene-types';

const framePillarGeo = new THREE.BoxGeometry(0.28, 7.2, 0.32);
const framePillarNeonGeo = new THREE.BoxGeometry(0.04, 6.8, 0.34);
const frameBeamGeo = new THREE.BoxGeometry(20.4, 0.28, 0.36);
const frameLightStripGeo = new THREE.BoxGeometry(16, 0.04, 0.04);
const ceilingSpineGeo = new THREE.BoxGeometry(0.06, 0.06, 36);
const ceilingFixtureGeo = new THREE.RingGeometry(0.85, 0.95, 6);

const frameSteelMat = new THREE.MeshStandardMaterial({ color: '#162228', metalness: 0.95, roughness: 0.25 });
const frameLightCyanMat = new THREE.MeshBasicMaterial({ color: '#28d7e5', toneMapped: false, transparent: true, opacity: 0.85 });
const frameLightOrangeMat = new THREE.MeshBasicMaterial({ color: '#ff6b3d', toneMapped: false, transparent: true, opacity: 0.85 });
const frameLightPurpleMat = new THREE.MeshBasicMaterial({ color: '#c084fc', toneMapped: false, transparent: true, opacity: 0.75 });

/**
 * 顶部工业结构桁架与天花板霓虹流光矩阵
 */
export function StructuralFrames({ motionEnabled }: MotionProps): React.JSX.Element {
  const frames = useMemo(() => Array.from({ length: 9 }, (_, index) => 16 - index * 4), []);
  const cyanStripRef = useRef<THREE.MeshBasicMaterial>(null);
  const orangeStripRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (!motionEnabled || document.documentElement.dataset.modalOpen === 'true') return;
    const time = clock.elapsedTime;
    if (cyanStripRef.current) {
      cyanStripRef.current.opacity = 0.7 + Math.sin(time * 2.5) * 0.25;
    }
    if (orangeStripRef.current) {
      orangeStripRef.current.opacity = 0.7 + Math.cos(time * 2.3) * 0.25;
    }
  });

  return (
    <group>
      {/* 1. 8组天顶横跨重型桁架与双色霓虹灯条 */}
      {frames.map((z, idx) => (
        <group key={z} position={[0, 0, z]}>
          {/* 左右主立柱 */}
          <mesh position={[-10.2, 3.6, 0]} geometry={framePillarGeo} material={frameSteelMat} />
          <mesh position={[10.2, 3.6, 0]} geometry={framePillarGeo} material={frameSteelMat} />

          {/* 立柱内嵌垂直激光缝 */}
          <mesh position={[-10.05, 3.6, 0]} geometry={framePillarNeonGeo}>
            <meshBasicMaterial color={idx % 2 === 0 ? '#28d7e5' : '#ff6b3d'} toneMapped={false} transparent opacity={0.8} />
          </mesh>
          <mesh position={[10.05, 3.6, 0]} geometry={framePillarNeonGeo}>
            <meshBasicMaterial color={idx % 2 === 0 ? '#ff6b3d' : '#28d7e5'} toneMapped={false} transparent opacity={0.8} />
          </mesh>

          {/* 横梁主体 */}
          <mesh position={[0, 7.15, 0]} geometry={frameBeamGeo} material={frameSteelMat} />

          {/* 横梁底部青蓝霓虹光带 */}
          <mesh position={[0, 6.95, 0.08]} geometry={frameLightStripGeo}>
            <meshBasicMaterial ref={cyanStripRef} color="#28d7e5" toneMapped={false} transparent opacity={0.85} />
          </mesh>
          {/* 横梁顶部活力橙霓虹封边 */}
          <mesh position={[0, 7.32, -0.08]} geometry={frameLightStripGeo}>
            <meshBasicMaterial ref={orangeStripRef} color="#ff6b3d" toneMapped={false} transparent opacity={0.8} />
          </mesh>

          {/* 天花板悬吊式六边形霓虹光盘 */}
          {[-5.5, 5.5].map((x) => (
            <mesh key={x} position={[x, 6.92, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={ceilingFixtureGeo}>
              <meshBasicMaterial color={idx % 2 === 0 ? '#28d7e5' : '#c084fc'} toneMapped={false} transparent opacity={0.65} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 2. 纵贯天花板的 3 组贯通式霓虹脊骨光轨 (Left, Center, Right) */}
      <mesh position={[-10.2, 7.2, 0]} geometry={ceilingSpineGeo}>
        <meshBasicMaterial color="#28d7e5" toneMapped={false} />
      </mesh>
      <mesh position={[0, 7.35, 0]} geometry={ceilingSpineGeo}>
        <meshBasicMaterial color="#ff6b3d" toneMapped={false} transparent opacity={0.9} />
      </mesh>
      <mesh position={[10.2, 7.2, 0]} geometry={ceilingSpineGeo}>
        <meshBasicMaterial color="#28d7e5" toneMapped={false} />
      </mesh>
    </group>
  );
}
