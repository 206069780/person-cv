import React, { useEffect, useRef } from 'react';
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

const borderMatCyan = new THREE.MeshBasicMaterial({ color: '#28d7e5', toneMapped: false });
const borderMatPurple = new THREE.MeshBasicMaterial({ color: '#c084fc', toneMapped: false });
const borderMatOrange = new THREE.MeshBasicMaterial({ color: '#ff6b3d', toneMapped: false });

const trackMatCyan = new THREE.MeshBasicMaterial({ color: '#28d7e5', toneMapped: false, transparent: true, opacity: 0.8 });
const trackMatSafety = new THREE.MeshBasicMaterial({ color: '#ff6b3d', toneMapped: false, transparent: true, opacity: 0.8 });
const trackMatCyber = new THREE.MeshBasicMaterial({ color: '#c084fc', toneMapped: false, transparent: true, opacity: 0.8 });

// 预计算 7 根通往展台的直通光轨数据与共享几何体
const EXHIBIT_TRACKS = EXHIBITS.map((exhibit) => {
  const [ex, , ez] = exhibit.position;
  const dx = ex;
  const dz = ez - 2;
  const len = Math.hypot(dx, dz);
  const angle = -Math.atan2(dz, dx);
  return {
    id: exhibit.id,
    position: [dx / 2, 0.032, 2 + dz / 2] as const,
    rotation: [0, angle, 0] as const,
    geometry: new THREE.BoxGeometry(len, 0.018, 0.05),
    material: exhibit.accent === 'safety' ? trackMatSafety : exhibit.accent === 'cyber' ? trackMatCyber : trackMatCyan,
  };
});

const RAILS_X = Array.from({ length: 11 }, (_, index) => -10 + index * 2);
const SIDE_RAILS_X = RAILS_X.filter((x) => x !== 0);
const CROSS_RAILS_Z = Array.from({ length: 17 }, (_, index) => -14 + index * 2);
const GRID_LONGS = [-14, -7, 7, 14];
const GRID_CROSSES = [-16, -10, -2, 6, 14, 20];

/**
 * 展馆地表系统：镜面反光钛金地面 + 赛博霓虹导引光轨与网格矩阵（高性能批处理版）
 */
function FloorSystemComponent(): React.JSX.Element {
  const sideRailsRef = useRef<THREE.InstancedMesh>(null);
  const crossRailsRef = useRef<THREE.InstancedMesh>(null);
  const gridLongCyanRef = useRef<THREE.InstancedMesh>(null);
  const gridLongOrangeRef = useRef<THREE.InstancedMesh>(null);
  const gridCrossCyanRef = useRef<THREE.InstancedMesh>(null);
  const gridCrossOrangeRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const dummy = new THREE.Object3D();

    // 1. 10 根侧翼导轨
    if (sideRailsRef.current) {
      SIDE_RAILS_X.forEach((x, i) => {
        dummy.position.set(x, 0.015, 2);
        dummy.updateMatrix();
        sideRailsRef.current?.setMatrixAt(i, dummy.matrix);
      });
      sideRailsRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. 17 根横向导轨
    if (crossRailsRef.current) {
      CROSS_RAILS_Z.forEach((z, i) => {
        dummy.position.set(0, 0.016, z);
        dummy.updateMatrix();
        crossRailsRef.current?.setMatrixAt(i, dummy.matrix);
      });
      crossRailsRef.current.instanceMatrix.needsUpdate = true;
    }

    // 3. 地表长网格线
    let cLong = 0;
    let oLong = 0;
    GRID_LONGS.forEach((x, idx) => {
      dummy.position.set(x, 0.022, 1);
      dummy.updateMatrix();
      if (idx % 2 === 0) {
        gridLongCyanRef.current?.setMatrixAt(cLong++, dummy.matrix);
      } else {
        gridLongOrangeRef.current?.setMatrixAt(oLong++, dummy.matrix);
      }
    });
    if (gridLongCyanRef.current) gridLongCyanRef.current.instanceMatrix.needsUpdate = true;
    if (gridLongOrangeRef.current) gridLongOrangeRef.current.instanceMatrix.needsUpdate = true;

    // 4. 地表横网格线
    let cCross = 0;
    let oCross = 0;
    GRID_CROSSES.forEach((z, idx) => {
      dummy.position.set(0, 0.024, z);
      dummy.updateMatrix();
      if (idx % 2 === 0) {
        gridCrossCyanRef.current?.setMatrixAt(cCross++, dummy.matrix);
      } else {
        gridCrossOrangeRef.current?.setMatrixAt(oCross++, dummy.matrix);
      }
    });
    if (gridCrossCyanRef.current) gridCrossCyanRef.current.instanceMatrix.needsUpdate = true;
    if (gridCrossOrangeRef.current) gridCrossOrangeRef.current.instanceMatrix.needsUpdate = true;
  }, []);

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

      {/* 4. 放射状地面引导轨道 (实例化批处理) */}
      <mesh position={[0, 0.015, 2]} geometry={railGeo} material={railCenterMat} />
      <instancedMesh ref={sideRailsRef} args={[railGeo, railSideMat, SIDE_RAILS_X.length]} />
      <instancedMesh ref={crossRailsRef} args={[crossRailGeo, crossRailMat, CROSS_RAILS_Z.length]} />

      {/* 5. 地表大跨度赛博霓虹网格嵌条 (实例化批处理) */}
      <instancedMesh ref={gridLongCyanRef} args={[floorGridLineLongGeo, floorGridMatCyan, 2]} />
      <instancedMesh ref={gridLongOrangeRef} args={[floorGridLineLongGeo, floorGridMatOrange, 2]} />
      <instancedMesh ref={gridCrossCyanRef} args={[floorGridLineCrossGeo, floorGridMatCyan, 3]} />
      <instancedMesh ref={gridCrossOrangeRef} args={[floorGridLineCrossGeo, floorGridMatOrange, 3]} />

      {/* 6. 展馆外轮廓地面霓虹封边框 */}
      <mesh position={[-16.8, 0.03, 1]} geometry={floorBorderLongGeo} material={borderMatCyan} />
      <mesh position={[16.8, 0.03, 1]} geometry={floorBorderLongGeo} material={borderMatPurple} />
      <mesh position={[0, 0.03, -17.8]} geometry={floorBorderCrossGeo} material={borderMatCyan} />
      <mesh position={[0, 0.03, 20.8]} geometry={floorBorderCrossGeo} material={borderMatOrange} />

      {/* 7. 地面通往 7 个展台的直通光轨 (预计算几何体与共享材质) */}
      {EXHIBIT_TRACKS.map((track) => (
        <group key={track.id} position={track.position} rotation={track.rotation}>
          <mesh geometry={track.geometry} material={track.material} />
        </group>
      ))}
    </group>
  );
}

export const FloorSystem = React.memo(FloorSystemComponent);

