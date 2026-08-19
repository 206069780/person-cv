import { Component, ReactNode, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { ExhibitHotspots } from './ExhibitHotspots';
import { IndustrialAssets } from './IndustrialAssets';
import { IntroSequence } from './IntroSequence';
import { ModelHologramTags } from './ModelHologramTag';
import { NeonWalls } from './NeonWalls';
import { EXHIBITS, getZoneFocus, SCENE_BOUNDS } from './scene-layout';

// 共享几何体池与材质池
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

const floorPlaneGeo = new THREE.PlaneGeometry(36, 42);
const floorPlaneMat = new THREE.MeshStandardMaterial({
  color: '#060d11',
  metalness: 0.92,
  roughness: 0.22,
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

const coreBaseGeo = new THREE.CylinderGeometry(2.4, 2.8, 0.35, 12);
const coreBaseMat = new THREE.MeshStandardMaterial({ color: '#11191b', metalness: 0.92, roughness: 0.24 });
const coreTorusOuterGeo = new THREE.TorusGeometry(2.2, 0.08, 10, 64);
const coreTorusOuterMat = new THREE.MeshBasicMaterial({ color: '#62e8cf', toneMapped: false });
const coreTorusInnerGeo = new THREE.TorusGeometry(1.7, 0.035, 8, 48);
const coreTorusInnerMat = new THREE.MeshBasicMaterial({ color: '#ff6b3d', toneMapped: false });
const coreOctahedronGeo = new THREE.OctahedronGeometry(1.05, 0);
const coreWireframeMat = new THREE.MeshBasicMaterial({ color: '#ff6b3d', wireframe: true, toneMapped: false });

const streamParticleGeo = new THREE.BoxGeometry(0.03, 0.015, 0.8);
const streamParticleMatFocus = new THREE.MeshBasicMaterial({ color: '#28d7e5', toneMapped: false, transparent: true, opacity: 0.25 });
const streamParticleMatNormal = new THREE.MeshBasicMaterial({ color: '#28d7e5', toneMapped: false, transparent: true, opacity: 0.85 });

// 零 GC 内存分配全局向量复用池
const _camFinalTarget = new THREE.Vector3();
const _camMovement = new THREE.Vector3();
const _camForward = new THREE.Vector3();
const _camRight = new THREE.Vector3();

interface MuseumSceneProps {
  activeExhibit: string | null;
  panelOpen?: boolean;
  introActive: boolean;
  motionEnabled: boolean;
  onIntroComplete: () => void;
  onReady: () => void;
  onFallback: () => void;
  onSelectExhibit: (id: string | null) => void;
}

interface BoundaryProps {
  children: ReactNode;
  onError: () => void;
}

class SceneBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * 全局统一无缝摄像机控制器
 */
function IntegratedCameraController({
  activeExhibit,
  panelOpen = false,
  introActive,
  motionEnabled,
  onDeselect,
}: {
  activeExhibit: string | null;
  panelOpen?: boolean;
  introActive: boolean;
  motionEnabled: boolean;
  onDeselect: () => void;
}) {
  const { camera, gl } = useThree();

  // 漫游状态
  const keys = useRef(new Set<string>());
  const dragging = useRef(false);
  const dragButton = useRef(0);
  const lastPointer = useRef({ x: 0, y: 0 });
  const walkYaw = useRef(0);
  const walkPitch = useRef(0);

  // 聚焦环绕状态
  const orbitRadius = useRef({ current: 5.4, target: 5.4 });
  const orbitTheta = useRef({ current: 0.2, target: 0.2 });
  const orbitPhi = useRef({ current: 1.12, target: 1.12 });
  const orbitCenter = useRef(new THREE.Vector3(0, 1.25, 0));
  const targetCenter = useRef(new THREE.Vector3(0, 1.25, 0));
  const panOffset = useRef(new THREE.Vector3(0, 0, 0));
  const sideShift = useRef(0);
  const idleTime = useRef(0);
  const lastActiveExhibit = useRef<string | null>(null);
  const walkHeight = useRef(2.45);
  const touchDistance = useRef<number | null>(null);

  // 当切换选中展品时，平滑重置观察中心与视角
  useEffect(() => {
    if (activeExhibit) {
      const exhibit = EXHIBITS.find((item) => item.id === activeExhibit);
      if (exhibit) {
        targetCenter.current.set(exhibit.position[0], 1.25, exhibit.position[2]);
        panOffset.current.set(0, 0, 0);
        orbitRadius.current.target = 5.0;
        orbitPhi.current.target = 1.12;

        if (lastActiveExhibit.current !== activeExhibit) {
          orbitTheta.current.target = 0.25;
          idleTime.current = 0;
        }
      }
    } else if (lastActiveExhibit.current !== null) {
      walkYaw.current = camera.rotation.y;
      walkPitch.current = camera.rotation.x;
    }
    lastActiveExhibit.current = activeExhibit;
  }, [activeExhibit, camera]);

  // 事件监听：键盘、鼠标拖拽、滚轮缩放、触摸手势与 UI 缩放联动
  useEffect(() => {
    if (introActive) return;
    const element = gl.domElement;

    // 缩放步进函数
    const zoomIn = () => {
      idleTime.current = 0;
      if (activeExhibit) {
        orbitRadius.current.target = Math.max(1.6, orbitRadius.current.target - 0.75);
      } else {
        const forward = new THREE.Vector3(-Math.sin(walkYaw.current), 0, -Math.cos(walkYaw.current));
        camera.position.add(forward.multiplyScalar(1.8));
      }
    };

    const zoomOut = () => {
      idleTime.current = 0;
      if (activeExhibit) {
        orbitRadius.current.target = Math.min(16.0, orbitRadius.current.target + 0.75);
      } else {
        const forward = new THREE.Vector3(-Math.sin(walkYaw.current), 0, -Math.cos(walkYaw.current));
        camera.position.sub(forward.multiplyScalar(1.8));
      }
    };

    const zoomReset = () => {
      idleTime.current = 0;
      if (activeExhibit) {
        orbitRadius.current.target = 5.0;
        orbitPhi.current.target = 1.12;
        panOffset.current.set(0, 0, 0);
      } else {
        walkHeight.current = 2.45;
        camera.position.set(0, 2.45, 14);
        walkYaw.current = 0;
        walkPitch.current = 0;
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (document.documentElement.dataset.modalOpen === 'true') return;
      if (['INPUT', 'TEXTAREA', 'BUTTON'].includes((event.target as HTMLElement)?.tagName)) return;
      if (event.key === 'Escape' && activeExhibit) {
        onDeselect();
        return;
      }
      if (event.code === 'Equal' || event.code === 'NumpadAdd' || event.key === '+') {
        zoomIn();
        return;
      }
      if (event.code === 'Minus' || event.code === 'NumpadSubtract' || event.key === '-') {
        zoomOut();
        return;
      }
      if (event.code === 'KeyR') {
        zoomReset();
        return;
      }
      if (event.code === 'PageUp' || event.code === 'KeyE') {
        walkHeight.current = Math.min(5.5, walkHeight.current + 0.4);
      }
      if (event.code === 'PageDown' || event.code === 'KeyQ') {
        walkHeight.current = Math.max(1.2, walkHeight.current - 0.4);
      }
      keys.current.add(event.code);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.code);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (document.documentElement.dataset.modalOpen === 'true') return;
      dragging.current = true;
      dragButton.current = event.button;
      lastPointer.current = { x: event.clientX, y: event.clientY };
      idleTime.current = 0;
      element.style.cursor = 'grabbing';
    };

    const onPointerUp = () => {
      dragging.current = false;
      element.style.cursor = activeExhibit ? 'grab' : 'default';
      touchDistance.current = null;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (document.documentElement.dataset.modalOpen === 'true' || !dragging.current) return;
      const dx = event.clientX - lastPointer.current.x;
      const dy = event.clientY - lastPointer.current.y;
      lastPointer.current = { x: event.clientX, y: event.clientY };
      idleTime.current = 0;

      if (activeExhibit) {
        if (dragButton.current === 0) {
          orbitTheta.current.target -= dx * 0.0058;
          orbitPhi.current.target = THREE.MathUtils.clamp(
            orbitPhi.current.target - dy * 0.0048,
            0.15,
            Math.PI / 2 - 0.06
          );
        } else {
          panOffset.current.x -= dx * 0.005;
          panOffset.current.y += dy * 0.005;
        }
      } else {
        walkYaw.current -= dx * 0.0026;
        walkPitch.current = THREE.MathUtils.clamp(walkPitch.current - dy * 0.0019, -0.55, 0.45);
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (document.documentElement.dataset.modalOpen === 'true') return;
      event.preventDefault();
      idleTime.current = 0;
      if (activeExhibit) {
        orbitRadius.current.target = THREE.MathUtils.clamp(
          orbitRadius.current.target + event.deltaY * 0.005,
          1.6,
          16.0
        );
      } else {
        // 漫游模式下滚轮推进/拉远
        const forward = new THREE.Vector3(-Math.sin(walkYaw.current), 0, -Math.cos(walkYaw.current));
        const moveDist = -event.deltaY * 0.012;
        camera.position.add(forward.multiplyScalar(moveDist));
      }
    };

    // 触摸手势缩放支持
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        const t1 = event.touches[0];
        const t2 = event.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        if (touchDistance.current !== null) {
          const delta = dist - touchDistance.current;
          if (activeExhibit) {
            orbitRadius.current.target = THREE.MathUtils.clamp(
              orbitRadius.current.target - delta * 0.015,
              1.6,
              16.0
            );
          }
        }
        touchDistance.current = dist;
      }
    };

    const onContextMenu = (event: MouseEvent) => {
      if (activeExhibit) event.preventDefault();
    };

    // 监听 UI HUD 触发的缩放指令
    const handleCustomZoomIn = () => zoomIn();
    const handleCustomZoomOut = () => zoomOut();
    const handleCustomZoomReset = () => zoomReset();

    window.addEventListener('museum-zoom-in', handleCustomZoomIn);
    window.addEventListener('museum-zoom-out', handleCustomZoomOut);
    window.addEventListener('museum-zoom-reset', handleCustomZoomReset);

    element.style.cursor = activeExhibit ? 'grab' : 'default';
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('pointerup', onPointerUp);
    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('wheel', onWheel, { passive: false });
    element.addEventListener('touchmove', onTouchMove, { passive: true });
    element.addEventListener('contextmenu', onContextMenu);

    return () => {
      keys.current.clear();
      window.removeEventListener('museum-zoom-in', handleCustomZoomIn);
      window.removeEventListener('museum-zoom-out', handleCustomZoomOut);
      window.removeEventListener('museum-zoom-reset', handleCustomZoomReset);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('pointerup', onPointerUp);
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('wheel', onWheel);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('contextmenu', onContextMenu);
    };
  }, [activeExhibit, camera, gl, introActive, onDeselect]);

  useFrame((_, delta) => {
    if (introActive || document.documentElement.dataset.modalOpen === 'true') return;

    if (activeExhibit) {
      const smoothFactor = motionEnabled ? 1 - Math.exp(-delta * 7.5) : 1;

      if (!dragging.current && motionEnabled) {
        idleTime.current += delta;
        if (idleTime.current > 1.2) {
          orbitTheta.current.target += delta * 0.14;
        }
      }

      orbitTheta.current.current = THREE.MathUtils.lerp(
        orbitTheta.current.current,
        orbitTheta.current.target,
        smoothFactor
      );
      orbitPhi.current.current = THREE.MathUtils.lerp(
        orbitPhi.current.current,
        orbitPhi.current.target,
        smoothFactor
      );
      orbitRadius.current.current = THREE.MathUtils.lerp(
        orbitRadius.current.current,
        orbitRadius.current.target,
        smoothFactor
      );

      _camFinalTarget.copy(targetCenter.current).add(panOffset.current);
      orbitCenter.current.lerp(_camFinalTarget, smoothFactor);

      const r = orbitRadius.current.current;
      const phi = orbitPhi.current.current;
      const theta = orbitTheta.current.current;

      // 透视投影几何补偿：根据相机的 fov 与宽高比，精准将模型投影中心平移至左侧可用视口中央
      const persCam = camera as THREE.PerspectiveCamera;
      const aspect = persCam.aspect || (window.innerWidth / Math.max(1, window.innerHeight));
      const fovRad = THREE.MathUtils.degToRad(persCam.fov || 45);
      const halfWidthAtDistance = r * Math.tan(fovRad / 2) * aspect;

      // 抽屉展开时，将模型精准偏置到左侧剩余可用视口的黄金中心（偏置半屏宽度的 46%）
      const targetRatio = activeExhibit && panelOpen ? 0.46 : 0;
      sideShift.current = THREE.MathUtils.lerp(
        sideShift.current,
        targetRatio,
        smoothFactor
      );

      const worldShiftDist = sideShift.current * halfWidthAtDistance;

      const camX = orbitCenter.current.x + r * Math.sin(phi) * Math.sin(theta);
      const camY = orbitCenter.current.y + r * Math.cos(phi);
      const camZ = orbitCenter.current.z + r * Math.sin(phi) * Math.cos(theta);

      // 相机水平右向量
      const rightX = Math.cos(theta);
      const rightZ = -Math.sin(theta);
      const shiftX = rightX * worldShiftDist;
      const shiftZ = rightZ * worldShiftDist;

      camera.position.set(camX + shiftX, camY, camZ + shiftZ);
      camera.lookAt(
        orbitCenter.current.x + shiftX,
        orbitCenter.current.y + 0.15,
        orbitCenter.current.z + shiftZ
      );
    } else {
      _camMovement.set(0, 0, 0);
      _camForward.set(-Math.sin(walkYaw.current), 0, -Math.cos(walkYaw.current));
      _camRight.set(Math.cos(walkYaw.current), 0, -Math.sin(walkYaw.current));
      const speed = Math.min(delta, 0.05) * 5.6;

      if (keys.current.has('KeyW') || keys.current.has('ArrowUp')) _camMovement.add(_camForward);
      if (keys.current.has('KeyS') || keys.current.has('ArrowDown')) _camMovement.sub(_camForward);
      if (keys.current.has('KeyD') || keys.current.has('ArrowRight')) _camMovement.add(_camRight);
      if (keys.current.has('KeyA') || keys.current.has('ArrowLeft')) _camMovement.sub(_camRight);

      if (_camMovement.lengthSq() > 0) {
        camera.position.add(_camMovement.normalize().multiplyScalar(speed));
      }

      camera.position.x = THREE.MathUtils.clamp(camera.position.x, SCENE_BOUNDS.minX, SCENE_BOUNDS.maxX);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, SCENE_BOUNDS.minZ, SCENE_BOUNDS.maxZ);
      camera.position.y = walkHeight.current;
      camera.rotation.set(walkPitch.current, walkYaw.current, 0, 'YXZ');
    }
  });

  return null;
}

/**
 * 顶部工业结构桁架与天花板霓虹流光矩阵
 */
function StructuralFrames({ motionEnabled }: { motionEnabled: boolean }) {
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

/**
 * 展馆地表系统：镜面反光钛金地面 + 赛博霓虹导引光轨与网格矩阵
 */
function FloorSystem() {
  const rails = useMemo(() => Array.from({ length: 11 }, (_, index) => -10 + index * 2), []);
  const crossRails = useMemo(() => Array.from({ length: 17 }, (_, index) => -14 + index * 2), []);
  const gridLongs = useMemo(() => [-14, -7, 7, 14], []);
  const gridCrosses = useMemo(() => [-16, -10, -2, 6, 14, 20], []);

  return (
    <group>
      {/* 1. 高反光深邃金属地台 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow geometry={floorPlaneGeo} material={floorPlaneMat} />

      {/* 2. 中央核心区发光能源圆盘与多层霓虹光环 */}
      <mesh position={[0, 0.035, -8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow geometry={floorCenterDiscGeo} material={floorCenterDiscMat} />
      <mesh position={[0, 0.085, -8]} rotation={[Math.PI / 2, 0, 0]} geometry={floorCenterRingGeo} material={floorCenterRingMat} />
      <mesh position={[0, 0.09, -8]} rotation={[Math.PI / 2, 0, 0]} geometry={floorInnerRingGeo} material={floorInnerRingMat} />

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

function CentralCore({ motionEnabled, intensity }: { motionEnabled: boolean; intensity: number }) {
  const outerRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!motionEnabled || document.documentElement.dataset.modalOpen === 'true') return;
    if (outerRef.current) outerRef.current.rotation.y += delta * 0.18;
    if (innerRef.current) innerRef.current.rotation.y -= delta * 0.32;
  });

  return (
    <group position={[0, 2.2, -8]}>
      <mesh position={[0, -1.95, 0]} geometry={coreBaseGeo} material={coreBaseMat} />
      <group ref={outerRef} rotation={[Math.PI / 2, 0, 0]}>
        <mesh geometry={coreTorusOuterGeo} material={coreTorusOuterMat} />
        <mesh geometry={coreTorusInnerGeo} material={coreTorusInnerMat} />
      </group>
      <group ref={innerRef}>
        <mesh rotation={[0, Math.PI / 4, 0]} geometry={coreOctahedronGeo}>
          <meshStandardMaterial color="#0c1718" metalness={0.72} roughness={0.22} emissive="#28d7e5" emissiveIntensity={1.35 * intensity} />
        </mesh>
        <mesh scale={0.62} rotation={[0, -Math.PI / 4, 0]} geometry={coreOctahedronGeo} material={coreWireframeMat} />
      </group>
    </group>
  );
}

function DataStreams({ motionEnabled, focused }: { motionEnabled: boolean; focused: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particles = useMemo(() => Array.from({ length: 48 }, (_, index) => ({
    lane: (index % 9) - 4,
    z: 18 - (index % 12) * 2.5,
    speed: 1.4 + (index % 5) * 0.22,
    y: 0.05 + (index % 3) * 0.025,
  })), []);
  const helper = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!meshRef.current || !motionEnabled || document.documentElement.dataset.modalOpen === 'true') return;
    particles.forEach((particle, index) => {
      particle.z -= delta * particle.speed;
      if (particle.z < -12) particle.z = 18;
      helper.position.set(particle.lane * 1.5, particle.y, particle.z);
      helper.scale.set(index % 8 === 0 ? 1.8 : 1, 1, 1);
      helper.updateMatrix();
      meshRef.current?.setMatrixAt(index, helper.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[streamParticleGeo, focused ? streamParticleMatFocus : streamParticleMatNormal, particles.length]}
    />
  );
}

interface SceneContentProps extends Omit<MuseumSceneProps, 'onReady' | 'onFallback'> {}

function SceneContent(props: SceneContentProps) {
  const { scene, gl } = useThree();

  useEffect(() => {
    scene.background = new THREE.Color('#03080c');
    scene.fog = new THREE.FogExp2('#03080c', 0.014);
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.24;
  }, [gl, scene]);

  const coreIntensity = getZoneFocus(props.activeExhibit, 'litree-overview').intensity;

  return (
    <>
      {/* 赛博朋克双色环境光与顶光 */}
      <hemisphereLight color="#a8eef5" groundColor="#08151c" intensity={1.1} />
      <directionalLight position={[6, 14, 8]} color="#edfcf9" intensity={2.6} castShadow shadow-mapSize={[512, 512]} shadow-bias={-0.0005} />
      <pointLight position={[-10, 4.5, 4]} color="#ff6b3d" intensity={14} distance={16} decay={2} />
      <pointLight position={[10, 4.5, -2]} color="#28d7e5" intensity={14} distance={16} decay={2} />

      {/* 地面系统 */}
      <FloorSystem />

      {/* 天花板结构与天顶霓虹光柱 */}
      <StructuralFrames motionEnabled={props.motionEnabled} />

      {/* 赛博霓虹四周墙面 */}
      <NeonWalls motionEnabled={props.motionEnabled} />

      {/* 数据流与展品模型 */}
      <DataStreams motionEnabled={props.motionEnabled} focused={props.activeExhibit !== null} />
      <IndustrialAssets activeExhibit={props.activeExhibit} motionEnabled={props.motionEnabled} onSelectExhibit={props.onSelectExhibit} />
      <ModelHologramTags activeExhibit={props.activeExhibit} motionEnabled={props.motionEnabled} onSelectExhibit={props.onSelectExhibit} />
      <CentralCore motionEnabled={props.motionEnabled} intensity={coreIntensity} />
      <ExhibitHotspots activeExhibit={props.activeExhibit} motionEnabled={props.motionEnabled} onSelectExhibit={props.onSelectExhibit} />
      <IntroSequence active={props.introActive} onComplete={props.onIntroComplete} />
      <IntegratedCameraController
        activeExhibit={props.activeExhibit}
        panelOpen={props.panelOpen}
        introActive={props.introActive}
        motionEnabled={props.motionEnabled}
        onDeselect={() => props.onSelectExhibit(null)}
      />
    </>
  );
}

export function MuseumScene(props: MuseumSceneProps) {
  return (
    <SceneBoundary onError={props.onFallback}>
      <Canvas
        className="museum-canvas"
        camera={{ position: [0, 3.4, 32], fov: 58, near: 0.1, far: 110 }}
        dpr={[1, 1.25]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        shadows
        onCreated={({ gl, scene, camera }) => {
          gl.domElement.addEventListener('webglcontextlost', props.onFallback, { once: true });
          try {
            gl.compile(scene, camera);
          } catch {
            // ignore fallback
          }
          requestAnimationFrame(props.onReady);
        }}
      >
        <SceneContent {...props} />
      </Canvas>
    </SceneBoundary>
  );
}
