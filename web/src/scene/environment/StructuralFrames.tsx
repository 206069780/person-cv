import React, { useEffect, useMemo, useRef } from 'react';
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

const FRAMES_Z = Array.from({ length: 9 }, (_, index) => 16 - index * 4);

/**
 * 顶部工业结构桁架与天花板霓虹流光矩阵（高性能实例化 InstancedMesh 批处理版）
 */
function StructuralFramesComponent({ motionEnabled }: MotionProps): React.JSX.Element {
  const pillarsRef = useRef<THREE.InstancedMesh>(null);
  const beamsRef = useRef<THREE.InstancedMesh>(null);
  const pillarNeonsCyanRef = useRef<THREE.InstancedMesh>(null);
  const pillarNeonsOrangeRef = useRef<THREE.InstancedMesh>(null);
  const beamStripsCyanRef = useRef<THREE.InstancedMesh>(null);
  const beamStripsOrangeRef = useRef<THREE.InstancedMesh>(null);
  const fixturesCyanRef = useRef<THREE.InstancedMesh>(null);
  const fixturesPurpleRef = useRef<THREE.InstancedMesh>(null);

  // 初始化静态 InstancedMesh 矩阵（0 运行时开销，一次性写入 GPU）
  useEffect(() => {
    const dummy = new THREE.Object3D();
    const rotZ = new THREE.Euler(-Math.PI / 2, 0, 0);

    // 1. 18 根主立柱
    if (pillarsRef.current) {
      FRAMES_Z.forEach((z, i) => {
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(-10.2, 3.6, z);
        dummy.updateMatrix();
        pillarsRef.current?.setMatrixAt(i * 2, dummy.matrix);

        dummy.position.set(10.2, 3.6, z);
        dummy.updateMatrix();
        pillarsRef.current?.setMatrixAt(i * 2 + 1, dummy.matrix);
      });
      pillarsRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. 9 根横梁主体
    if (beamsRef.current) {
      FRAMES_Z.forEach((z, i) => {
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(0, 7.15, z);
        dummy.updateMatrix();
        beamsRef.current?.setMatrixAt(i, dummy.matrix);
      });
      beamsRef.current.instanceMatrix.needsUpdate = true;
    }

    // 3. 立柱霓虹条 (Cyan & Orange)
    let cyanPillarIdx = 0;
    let orangePillarIdx = 0;
    FRAMES_Z.forEach((z, idx) => {
      dummy.rotation.set(0, 0, 0);
      const isEven = idx % 2 === 0;

      // Left Pillar Neon
      dummy.position.set(-10.05, 3.6, z);
      dummy.updateMatrix();
      if (isEven) {
        pillarNeonsCyanRef.current?.setMatrixAt(cyanPillarIdx++, dummy.matrix);
      } else {
        pillarNeonsOrangeRef.current?.setMatrixAt(orangePillarIdx++, dummy.matrix);
      }

      // Right Pillar Neon
      dummy.position.set(10.05, 3.6, z);
      dummy.updateMatrix();
      if (isEven) {
        pillarNeonsOrangeRef.current?.setMatrixAt(orangePillarIdx++, dummy.matrix);
      } else {
        pillarNeonsCyanRef.current?.setMatrixAt(cyanPillarIdx++, dummy.matrix);
      }
    });
    if (pillarNeonsCyanRef.current) pillarNeonsCyanRef.current.instanceMatrix.needsUpdate = true;
    if (pillarNeonsOrangeRef.current) pillarNeonsOrangeRef.current.instanceMatrix.needsUpdate = true;

    // 4. 横梁光带 (9 Cyan + 9 Orange)
    if (beamStripsCyanRef.current && beamStripsOrangeRef.current) {
      FRAMES_Z.forEach((z, i) => {
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(0, 6.95, z + 0.08);
        dummy.updateMatrix();
        beamStripsCyanRef.current?.setMatrixAt(i, dummy.matrix);

        dummy.position.set(0, 7.32, z - 0.08);
        dummy.updateMatrix();
        beamStripsOrangeRef.current?.setMatrixAt(i, dummy.matrix);
      });
      beamStripsCyanRef.current.instanceMatrix.needsUpdate = true;
      beamStripsOrangeRef.current.instanceMatrix.needsUpdate = true;
    }

    // 5. 天花板悬吊式六边形霓虹光盘
    let cyanFixIdx = 0;
    let purpleFixIdx = 0;
    FRAMES_Z.forEach((z, idx) => {
      dummy.rotation.copy(rotZ);
      const isEven = idx % 2 === 0;
      [-5.5, 5.5].forEach((x) => {
        dummy.position.set(x, 6.92, z);
        dummy.updateMatrix();
        if (isEven) {
          fixturesCyanRef.current?.setMatrixAt(cyanFixIdx++, dummy.matrix);
        } else {
          fixturesPurpleRef.current?.setMatrixAt(purpleFixIdx++, dummy.matrix);
        }
      });
    });
    if (fixturesCyanRef.current) fixturesCyanRef.current.instanceMatrix.needsUpdate = true;
    if (fixturesPurpleRef.current) fixturesPurpleRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame(({ clock }) => {
    if (!motionEnabled || document.documentElement.dataset.modalOpen === 'true') return;
    const time = clock.elapsedTime;
    frameLightCyanMat.opacity = 0.7 + Math.sin(time * 2.5) * 0.25;
    frameLightOrangeMat.opacity = 0.7 + Math.cos(time * 2.3) * 0.25;
  });

  return (
    <group>
      {/* 1. 实例化立柱与横梁 (84 Draw Calls -> 8 Draw Calls) */}
      <instancedMesh ref={pillarsRef} args={[framePillarGeo, frameSteelMat, 18]} />
      <instancedMesh ref={beamsRef} args={[frameBeamGeo, frameSteelMat, 9]} />
      <instancedMesh ref={pillarNeonsCyanRef} args={[framePillarNeonGeo, frameLightCyanMat, 9]} />
      <instancedMesh ref={pillarNeonsOrangeRef} args={[framePillarNeonGeo, frameLightOrangeMat, 9]} />
      <instancedMesh ref={beamStripsCyanRef} args={[frameLightStripGeo, frameLightCyanMat, 9]} />
      <instancedMesh ref={beamStripsOrangeRef} args={[frameLightStripGeo, frameLightOrangeMat, 9]} />
      <instancedMesh ref={fixturesCyanRef} args={[ceilingFixtureGeo, frameLightCyanMat, 10]} />
      <instancedMesh ref={fixturesPurpleRef} args={[ceilingFixtureGeo, frameLightPurpleMat, 8]} />

      {/* 2. 纵贯天花板的 3 组贯通式霓虹脊骨光轨 (Left, Center, Right) */}
      <mesh position={[-10.2, 7.2, 0]} geometry={ceilingSpineGeo} material={frameLightCyanMat} />
      <mesh position={[0, 7.35, 0]} geometry={ceilingSpineGeo} material={frameLightOrangeMat} />
      <mesh position={[10.2, 7.2, 0]} geometry={ceilingSpineGeo} material={frameLightCyanMat} />
    </group>
  );
}

export const StructuralFrames = React.memo(StructuralFramesComponent);

