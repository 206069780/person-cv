import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { EXHIBITS, SCENE_BOUNDS } from '../scene-layout';

// 零 GC 内存分配全局向量复用池
const _camFinalTarget = new THREE.Vector3();
const _camMovement = new THREE.Vector3();
const _camForward = new THREE.Vector3();
const _camRight = new THREE.Vector3();
const _camZoomForward = new THREE.Vector3();

interface IntegratedCameraControllerProps {
  activeExhibit: string | null;
  panelOpen?: boolean;
  introActive: boolean;
  motionEnabled: boolean;
  onDeselect: () => void;
}

/**
 * 全局统一无缝摄像机控制器
 */
export function IntegratedCameraController({
  activeExhibit,
  panelOpen = false,
  introActive,
  motionEnabled,
  onDeselect,
}: IntegratedCameraControllerProps): React.JSX.Element {
  const { camera, gl } = useThree();

  // 漫游状态
  const keys = useRef(new Set<string>());
  const dragging = useRef(false);
  const dragButton = useRef(0);
  const lastPointer = useRef({ x: 0, y: 0 });
  const walkYaw = useRef(0);
  const walkPitch = useRef(0);

  // 聚焦环绕状态
  const orbitRadius = useRef({ current: 7.6, target: 7.6 });
  const orbitTheta = useRef({ current: 0.25, target: 0.25 });
  const orbitPhi = useRef({ current: 1.16, target: 1.16 });
  const orbitCenter = useRef(new THREE.Vector3(0, 1.28, 0));
  const targetCenter = useRef(new THREE.Vector3(0, 1.28, 0));
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
        targetCenter.current.set(exhibit.position[0], 1.28, exhibit.position[2]);
        panOffset.current.set(0, 0, 0);
        orbitRadius.current.target = 7.6;
        orbitPhi.current.target = 1.16;

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
        orbitRadius.current.target = Math.max(3.2, orbitRadius.current.target - 0.75);
      } else {
        _camZoomForward.set(-Math.sin(walkYaw.current), 0, -Math.cos(walkYaw.current));
        camera.position.add(_camZoomForward.multiplyScalar(1.8));
      }
    };

    const zoomOut = () => {
      idleTime.current = 0;
      if (activeExhibit) {
        orbitRadius.current.target = Math.min(18.0, orbitRadius.current.target + 0.75);
      } else {
        _camZoomForward.set(-Math.sin(walkYaw.current), 0, -Math.cos(walkYaw.current));
        camera.position.sub(_camZoomForward.multiplyScalar(1.8));
      }
    };

    const zoomReset = () => {
      idleTime.current = 0;
      if (activeExhibit) {
        orbitRadius.current.target = 7.6;
        orbitPhi.current.target = 1.16;
        panOffset.current.set(0, 0, 0);
      } else {
        walkHeight.current = 2.45;
        camera.position.set(0, 2.45, 15);
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
          3.2,
          18.0
        );
      } else {
        // 漫游模式下滚轮推进/拉远
        _camZoomForward.set(-Math.sin(walkYaw.current), 0, -Math.cos(walkYaw.current));
        const moveDist = -event.deltaY * 0.012;
        camera.position.add(_camZoomForward.multiplyScalar(moveDist));
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
              3.2,
              18.0
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

      // 定点聚焦：彻底移除相机自动公转（Auto Orbit），背景展厅保持绝对静止，仅保留用户手动 360° 检视
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

      // 抽屉展开时，将模型精准偏置到左侧剩余可用视口的黄金中心（偏置半屏宽度的 42%）
      const targetRatio = activeExhibit && panelOpen ? 0.42 : 0;
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
        orbitCenter.current.y + 0.12,
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

  return null!;
}
