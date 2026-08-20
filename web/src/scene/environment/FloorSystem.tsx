import { useMemo } from 'react';
import * as THREE from 'three';

import { EXHIBITS } from '../scene-layout';

const floorPlaneGeo = new THREE.PlaneGeometry(36, 42);
const floorPlaneMat = new THREE.MeshStandardMaterial({
  color: '#050c10',
  metalness: 0.95,
  roughness: 0.16,
});
const floorCenterDiscGeo = new THREE.CircleGeometry(4.2, 64);
const floorCenterDiscMat = new THREE.MeshStandardMaterial({
  color: '#061a20',
  metalness: 0.7,
  roughness: 0.18,
  emissive: new THREE.Color('#00d8ff'),
  emissiveIntensity: 0.22,
});
const floorCenterRingGeo = new THREE.TorusGeometry(4.6, 0.06, 8, 72);
const floorCenterRingMat = new THREE.MeshBasicMaterial({ color: '#28d7e5', toneMapped: false });
const floorInnerRingGeo = new THREE.TorusGeometry(2.8, 0.035, 8, 56);
const floorInnerRingMat = new THREE.MeshBasicMaterial({ color: '#ff6b3d', toneMapped: false });

const mainTrackGeo = new THREE.BoxGeometry(0.8, 0.025, 34);
const mainTrackMat = new THREE.MeshStandardMaterial({
  color: '#08252b',
  metalness: 0.6,
  roughness: 0.18,
  emissive: new THREE.Color('#28d7e5'),
  emissiveIntensity: 0.25,
});
const mainTrackNeonGeo = new THREE.BoxGeometry(0.04, 0.03, 34);
const trackNeonMat = new THREE.MeshBasicMaterial({ color: '#28d7e5', toneMapped: false });

const railGeo = new THREE.BoxGeometry(0.025, 0.02, 36);
const crossRailGeo = new THREE.BoxGeometry(22, 0.02, 0.025);
const floorGridLineLongGeo = new THREE.BoxGeometry(0.03, 0.015, 38);
const floorGridLineCrossGeo = new THREE.BoxGeometry(32, 0.015, 0.03);
const floorBorderLongGeo = new THREE.BoxGeometry(0.06, 0.02, 40);
const floorBorderCrossGeo = new THREE.BoxGeometry(34, 0.02, 0.06);

const railCenterMat = new THREE.MeshBasicMaterial({ color: '#28d7e5', toneMapped: false, transparent: true, opacity: 0.85 });
const railSideMat = new THREE.MeshBasicMaterial({ color: '#1a4347', toneMapped: false, transparent: true, opacity: 0.55 });
const crossRailMat = new THREE.MeshBasicMaterial({ color: '#ff6b3d', toneMapped: false, transparent: true, opacity: 0.45 });
const floorGridMatCyan = new THREE.MeshBasicMaterial({ color: '#28d7e5', toneMapped: false, transparent: true, opacity: 0.4 });
const floorGridMatOrange = new THREE.MeshBasicMaterial({ color: '#ff6b3d', toneMapped: false, transparent: true, opacity: 0.35 });

/**
 * 展馆地表系统：镜面反光钛金地面 + 赛博霓虹导引光轨与网格矩阵
 */
export function FloorSystem(): React.JSX.Element {
  const rails = useMemo(() => Array.from({ length: 11 }, (_, index) => -10 + index * 2), []);
  const crossRails = useMemo(() => Array.from({ length: 17 }, (_, index) => -14 + index * 2), []);
  const gridLongs = useMemo(() => [-14, -7, 7, 14], []);
  const gridCrosses = useMemo(() => [-16, -10, -2, 6, 14, 20], []);

  return (
    <group>
      {/* 1. 高反光深邃金属地台 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow geometry={floorPlaneGeo} material={floorPlaneMat} />

      {/* 2. 中央核心区发光能源圆盘与多层霓虹光环 */}
      <mesh position={[0, 0.035, -10.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow geometry={floorCenterDiscGeo} material={floorCenterDiscMat} />
      <mesh position={[0, 0.085, -10.5]} rotation={[Math.PI / 2, 0, 0]} geometry={floorCenterRingGeo} material={floorCenterRingMat} />
      <mesh position={[0, 0.09, -10.5]} rotation={[Math.PI / 2, 0, 0]} geometry={floorInnerRingGeo} material={floorInnerRingMat} />

      {/* 3. 中央主走廊钛合金发光轨道 */}
      <mesh position={[0, 0.06, 2]} geometry={mainTrackGeo} material={mainTrackMat} />
      <mesh position={[-0.38, 0.075, 2]} geometry={mainTrackNeonGeo} material={trackNeonMat} />
      <mesh position={[0.38, 0.075, 2]} geometry={mainTrackNeonGeo} material={trackNeonMat} />

      {/* 4. 放射状地面引导轨道 */}
      {rails.map((x) => (
        <mesh
          key={`x-${x}`}
          position={[x, 0.015, 2]}
          geometry={railGeo}
          material={x === 0 ? railCenterMat : railSideMat}
        />
      ))}
      {crossRails.map((z) => (
        <mesh
          key={`z-${z}`}
          position={[0, 0.016, z]}
          geometry={crossRailGeo}
          material={crossRailMat}
        />
      ))}

      {/* 5. 地表大跨度赛博霓虹网格嵌条 */}
      {gridLongs.map((x, idx) => (
        <mesh
          key={`gl-${x}`}
          position={[x, 0.022, 1]}
          geometry={floorGridLineLongGeo}
          material={idx % 2 === 0 ? floorGridMatCyan : floorGridMatOrange}
        />
      ))}
      {gridCrosses.map((z, idx) => (
        <mesh
          key={`gc-${z}`}
          position={[0, 0.024, z]}
          geometry={floorGridLineCrossGeo}
          material={idx % 2 === 0 ? floorGridMatCyan : floorGridMatOrange}
        />
      ))}

      {/* 6. 展馆外轮廓地面霓虹封边框 */}
      <mesh position={[-16.8, 0.03, 1]} geometry={floorBorderLongGeo}>
        <meshBasicMaterial color="#28d7e5" toneMapped={false} />
      </mesh>
      <mesh position={[16.8, 0.03, 1]} geometry={floorBorderLongGeo}>
        <meshBasicMaterial color="#c084fc" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.03, -17.8]} geometry={floorBorderCrossGeo}>
        <meshBasicMaterial color="#28d7e5" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.03, 20.8]} geometry={floorBorderCrossGeo}>
        <meshBasicMaterial color="#ff6b3d" toneMapped={false} />
      </mesh>

      {/* 7. 地面通往 7 个展台的直通光轨 */}
      {EXHIBITS.map((exhibit) => {
        const [ex, , ez] = exhibit.position;
        const dx = ex;
        const dz = ez - 2;
        const len = Math.hypot(dx, dz);
        const angle = -Math.atan2(dz, dx);
        return (
          <group key={exhibit.id} position={[dx / 2, 0.032, 2 + dz / 2]} rotation={[0, angle, 0]}>
            <mesh>
              <boxGeometry args={[len, 0.018, 0.05]} />
              <meshBasicMaterial
                color={exhibit.accent === 'safety' ? '#ff6b3d' : exhibit.accent === 'cyber' ? '#c084fc' : '#28d7e5'}
                toneMapped={false}
                transparent
                opacity={0.8}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
