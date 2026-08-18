import { Component, ReactNode, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { ExhibitHotspots } from './ExhibitHotspots';
import { IndustrialAssets } from './IndustrialAssets';
import { IntroSequence } from './IntroSequence';
import { NeonWalls } from './NeonWalls';
import { EXHIBITS, getZoneFocus, SCENE_BOUNDS } from './scene-layout';

// 共享几何体池与材质池
const framePillarGeo = new THREE.BoxGeometry(0.26, 6.8, 0.32);
const frameBeamGeo = new THREE.BoxGeometry(19.8, 0.25, 0.32);
const frameLightStripGeo = new THREE.BoxGeometry(12, 0.035, 0.035);
const frameSteelMat = new THREE.MeshStandardMaterial({ color: '#26343a', metalness: 0.95, roughness: 0.3 });
const frameLightMat = new THREE.MeshBasicMaterial({ color: '#62e8cf', toneMapped: false, transparent: true, opacity: 0.5 });

const floorPlaneGeo = new THREE.PlaneGeometry(36, 42);
const floorPlaneMat = new THREE.MeshStandardMaterial({ color: '#071015', metalness: 0.78, roughness: 0.36 });
const floorCenterDiscGeo = new THREE.CircleGeometry(3.75, 64);
const floorCenterDiscMat = new THREE.MeshStandardMaterial({ color: '#09262b', metalness: 0.58, roughness: 0.18, emissive: new THREE.Color('#00a89d'), emissiveIntensity: 0.08 });
const floorCenterRingGeo = new THREE.TorusGeometry(4.3, 0.28, 10, 72);
const floorCenterRingMat = new THREE.MeshStandardMaterial({ color: '#263b43', metalness: 0.94, roughness: 0.24 });
const mainTrackGeo = new THREE.BoxGeometry(0.7, 0.025, 30);
const mainTrackMat = new THREE.MeshStandardMaterial({ color: '#0a3034', metalness: 0.48, roughness: 0.2, emissive: new THREE.Color('#28d7e5'), emissiveIntensity: 0.12 });
const railGeo = new THREE.BoxGeometry(0.025, 0.02, 34);
const crossRailGeo = new THREE.BoxGeometry(20, 0.02, 0.025);
const railCenterMat = new THREE.MeshBasicMaterial({ color: '#62e8cf', toneMapped: false, transparent: true, opacity: 0.65 });
const railSideMat = new THREE.MeshBasicMaterial({ color: '#233b3c', toneMapped: false, transparent: true, opacity: 0.42 });
const crossRailMat = new THREE.MeshBasicMaterial({ color: '#233b3c', toneMapped: false, transparent: true, opacity: 0.38 });

const coreBaseGeo = new THREE.CylinderGeometry(2.4, 2.8, 0.35, 12);
const coreBaseMat = new THREE.MeshStandardMaterial({ color: '#11191b', metalness: 0.92, roughness: 0.24 });
const coreTorusOuterGeo = new THREE.TorusGeometry(2.2, 0.08, 10, 64);
const coreTorusOuterMat = new THREE.MeshBasicMaterial({ color: '#62e8cf', toneMapped: false });
const coreTorusInnerGeo = new THREE.TorusGeometry(1.7, 0.035, 8, 48);
const coreTorusInnerMat = new THREE.MeshBasicMaterial({ color: '#ff6b3d', toneMapped: false });
const coreOctahedronGeo = new THREE.OctahedronGeometry(1.05, 0);
const coreWireframeMat = new THREE.MeshBasicMaterial({ color: '#ff6b3d', wireframe: true, toneMapped: false });

const streamParticleGeo = new THREE.BoxGeometry(0.03, 0.015, 0.8);
const streamParticleMatFocus = new THREE.MeshBasicMaterial({ color: '#28d7e5', toneMapped: false, transparent: true, opacity: 0.2 });
const streamParticleMatNormal = new THREE.MeshBasicMaterial({ color: '#28d7e5', toneMapped: false, transparent: true, opacity: 0.72 });

interface MuseumSceneProps {
  activeExhibit: string | null;
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
 * - 自由漫游模式（activeExhibit === null）：WASD / 方向键位移 + 鼠标左键调整仰角与水平朝向
 * - 3D 模型聚焦观察模式（activeExhibit !== null）：支持鼠标左键 360° 环绕旋转、滚轮自由缩放、右键平移、闲时自旋动效，绝不锁死！
 */
function IntegratedCameraController({
  activeExhibit,
  introActive,
  motionEnabled,
  onDeselect,
}: {
  activeExhibit: string | null;
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

  // 聚焦环绕状态（球坐标系：半径、水平角 theta、仰角 phi、聚焦中心目标）
  const orbitRadius = useRef({ current: 5.4, target: 5.4 });
  const orbitTheta = useRef({ current: 0.2, target: 0.2 });
  const orbitPhi = useRef({ current: 1.12, target: 1.12 });
  const orbitCenter = useRef(new THREE.Vector3(0, 1.25, 0));
  const targetCenter = useRef(new THREE.Vector3(0, 1.25, 0));
  const panOffset = useRef(new THREE.Vector3(0, 0, 0));
  const idleTime = useRef(0);
  const lastActiveExhibit = useRef<string | null>(null);

  // 当切换选中展品时，平滑重置观察中心与视角
  useEffect(() => {
    if (activeExhibit) {
      const exhibit = EXHIBITS.find((item) => item.id === activeExhibit);
      if (exhibit) {
        // 右侧抽屉占用约 48% 宽度，给观察中心右移偏置 +1.35，使 3D 模型完美居中在左侧视口
        targetCenter.current.set(exhibit.position[0] + 1.35, 1.25, exhibit.position[2]);
        panOffset.current.set(0, 0, 0);
        orbitRadius.current.target = 5.2;
        orbitPhi.current.target = 1.12;

        if (lastActiveExhibit.current !== activeExhibit) {
          // 初始朝向模型正面偏右角度
          orbitTheta.current.target = 0.25;
          idleTime.current = 0;
        }
      }
    } else if (lastActiveExhibit.current !== null) {
      // 从聚焦返回漫游时，无缝同步当前朝向
      walkYaw.current = camera.rotation.y;
      walkPitch.current = camera.rotation.x;
    }
    lastActiveExhibit.current = activeExhibit;
  }, [activeExhibit, camera]);

  // 事件监听：键盘、鼠标拖拽、滚轮缩放、触摸手势
  useEffect(() => {
    if (introActive) return;
    const element = gl.domElement;

    const onKeyDown = (event: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'BUTTON'].includes((event.target as HTMLElement)?.tagName)) return;
      if (event.key === 'Escape' && activeExhibit) {
        onDeselect();
        return;
      }
      keys.current.add(event.code);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.code);
    };

    const onPointerDown = (event: PointerEvent) => {
      dragging.current = true;
      dragButton.current = event.button;
      lastPointer.current = { x: event.clientX, y: event.clientY };
      idleTime.current = 0;
      element.style.cursor = 'grabbing';
    };

    const onPointerUp = () => {
      dragging.current = false;
      element.style.cursor = activeExhibit ? 'grab' : 'default';
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging.current) return;
      const dx = event.clientX - lastPointer.current.x;
      const dy = event.clientY - lastPointer.current.y;
      lastPointer.current = { x: event.clientX, y: event.clientY };
      idleTime.current = 0;

      if (activeExhibit) {
        if (dragButton.current === 0) {
          // 左键：360° 自由旋转模型环绕视角
          orbitTheta.current.target -= dx * 0.0058;
          orbitPhi.current.target = THREE.MathUtils.clamp(
            orbitPhi.current.target - dy * 0.0048,
            0.15,
            Math.PI / 2 - 0.06
          );
        } else {
          // 右键 / 中键：微调平移观察点
          panOffset.current.x -= dx * 0.005;
          panOffset.current.y += dy * 0.005;
        }
      } else {
        // 自由漫游视角旋转
        walkYaw.current -= dx * 0.0026;
        walkPitch.current = THREE.MathUtils.clamp(walkPitch.current - dy * 0.0019, -0.55, 0.45);
      }
    };

    const onWheel = (event: WheelEvent) => {
      idleTime.current = 0;
      if (activeExhibit) {
        // 聚焦状态下滚轮自由平滑缩放
        event.preventDefault();
        orbitRadius.current.target = THREE.MathUtils.clamp(
          orbitRadius.current.target + event.deltaY * 0.006,
          2.3,
          10.5
        );
      }
    };

    const onContextMenu = (event: MouseEvent) => {
      if (activeExhibit) event.preventDefault();
    };

    element.style.cursor = activeExhibit ? 'grab' : 'default';
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('pointerup', onPointerUp);
    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('wheel', onWheel, { passive: false });
    element.addEventListener('contextmenu', onContextMenu);

    return () => {
      keys.current.clear();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('pointerup', onPointerUp);
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('wheel', onWheel);
      element.removeEventListener('contextmenu', onContextMenu);
    };
  }, [activeExhibit, gl, introActive, onDeselect]);

  useFrame((_, delta) => {
    if (introActive) return;

    if (activeExhibit) {
      // 聚焦 3D 模型模式：环绕动力学与平滑阻尼插值
      const smoothFactor = motionEnabled ? 1 - Math.exp(-delta * 7.5) : 1;

      // 闲置自旋微动效果（用户未拖拽时提供生动的 3D 纵深感）
      if (!dragging.current && motionEnabled) {
        idleTime.current += delta;
        if (idleTime.current > 1.2) {
          orbitTheta.current.target += delta * 0.14;
        }
      }

      // 平滑插值球坐标
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

      const finalTarget = targetCenter.current.clone().add(panOffset.current);
      orbitCenter.current.lerp(finalTarget, smoothFactor);

      // 计算球坐标对应的摄像机世界坐标
      const r = orbitRadius.current.current;
      const phi = orbitPhi.current.current;
      const theta = orbitTheta.current.current;

      const camX = orbitCenter.current.x + r * Math.sin(phi) * Math.sin(theta);
      const camY = orbitCenter.current.y + r * Math.cos(phi);
      const camZ = orbitCenter.current.z + r * Math.sin(phi) * Math.cos(theta);

      camera.position.set(camX, camY, camZ);
      camera.lookAt(orbitCenter.current.x, orbitCenter.current.y + 0.15, orbitCenter.current.z);
    } else {
      // 自由漫游模式：WASD 移动 + 视角阻尼
      const movement = new THREE.Vector3();
      const forward = new THREE.Vector3(-Math.sin(walkYaw.current), 0, -Math.cos(walkYaw.current));
      const right = new THREE.Vector3(Math.cos(walkYaw.current), 0, -Math.sin(walkYaw.current));
      const speed = Math.min(delta, 0.05) * 5.6;

      if (keys.current.has('KeyW') || keys.current.has('ArrowUp')) movement.add(forward);
      if (keys.current.has('KeyS') || keys.current.has('ArrowDown')) movement.sub(forward);
      if (keys.current.has('KeyD') || keys.current.has('ArrowRight')) movement.add(right);
      if (keys.current.has('KeyA') || keys.current.has('ArrowLeft')) movement.sub(right);

      if (movement.lengthSq() > 0) {
        camera.position.add(movement.normalize().multiplyScalar(speed));
      }

      camera.position.x = THREE.MathUtils.clamp(camera.position.x, SCENE_BOUNDS.minX, SCENE_BOUNDS.maxX);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, SCENE_BOUNDS.minZ, SCENE_BOUNDS.maxZ);
      camera.position.y = 2.45;
      camera.rotation.set(walkPitch.current, walkYaw.current, 0, 'YXZ');
    }
  });

  return null;
}

function StructuralFrames() {
  const frames = useMemo(() => Array.from({ length: 8 }, (_, index) => 15 - index * 4), []);

  return (
    <group>
      {frames.map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[-9.8, 3.4, 0]} geometry={framePillarGeo} material={frameSteelMat} />
          <mesh position={[9.8, 3.4, 0]} geometry={framePillarGeo} material={frameSteelMat} />
          <mesh position={[0, 6.75, 0]} geometry={frameBeamGeo} material={frameSteelMat} />
          <mesh position={[0, 6.55, 0]} geometry={frameLightStripGeo} material={frameLightMat} />
        </group>
      ))}
    </group>
  );
}

function FloorSystem() {
  const rails = useMemo(() => Array.from({ length: 11 }, (_, index) => -10 + index * 2), []);
  const crossRails = useMemo(() => Array.from({ length: 16 }, (_, index) => -12 + index * 2), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow geometry={floorPlaneGeo} material={floorPlaneMat} />
      <mesh position={[0, 0.035, -8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow geometry={floorCenterDiscGeo} material={floorCenterDiscMat} />
      <mesh position={[0, 0.095, -8]} rotation={[Math.PI / 2, 0, 0]} geometry={floorCenterRingGeo} material={floorCenterRingMat} />
      <mesh position={[0, 0.06, 3]} geometry={mainTrackGeo} material={mainTrackMat} />
      {rails.map((x) => (
        <mesh
          key={`x-${x}`}
          position={[x, 0.012, 3]}
          geometry={railGeo}
          material={x === 0 ? railCenterMat : railSideMat}
        />
      ))}
      {crossRails.map((z) => (
        <mesh
          key={`z-${z}`}
          position={[0, 0.014, z]}
          geometry={crossRailGeo}
          material={crossRailMat}
        />
      ))}
    </group>
  );
}

function CentralCore({ motionEnabled, intensity }: { motionEnabled: boolean; intensity: number }) {
  const outerRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!motionEnabled) return;
    if (outerRef.current) outerRef.current.rotation.y += delta * 0.18;
    if (innerRef.current) innerRef.current.rotation.y -= delta * 0.32;
  });

  return (
    <group position={[0, 2.2, -8]}>
      <mesh position={[0, -1.95, 0]} castShadow geometry={coreBaseGeo} material={coreBaseMat} />
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
      <pointLight color="#28d7e5" intensity={18 * intensity} distance={11} decay={2} />
      <spotLight position={[0, 5, 1]} target-position={[0, 0, 0]} color="#28d7e5" intensity={42 * intensity} angle={0.28} penumbra={0.8} distance={16} />
    </group>
  );
}

function DataStreams({ motionEnabled, focused }: { motionEnabled: boolean; focused: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particles = useMemo(() => Array.from({ length: 76 }, (_, index) => ({
    lane: (index % 9) - 4,
    z: 18 - (index % 19) * 1.55,
    speed: 1.4 + (index % 7) * 0.18,
    y: 0.05 + (index % 3) * 0.025,
  })), []);
  const helper = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    particles.forEach((particle, index) => {
      if (motionEnabled) {
        particle.z -= delta * particle.speed;
        if (particle.z < -12) particle.z = 18;
      }
      helper.position.set(particle.lane * 1.5, particle.y, particle.z);
      helper.scale.set(index % 11 === 0 ? 1.9 : 1, 1, 1);
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
    scene.background = new THREE.Color('#040a0e');
    scene.fog = new THREE.FogExp2('#040a0e', 0.015);
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.18;
  }, [gl, scene]);

  const coreIntensity = getZoneFocus(props.activeExhibit, 'litree-overview').intensity;

  return (
    <>
      <hemisphereLight color="#9edfe6" groundColor="#061217" intensity={0.92} />
      <directionalLight position={[6, 14, 8]} color="#eafaf8" intensity={2.8} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-11, 5, 5]} color="#ff6b3d" intensity={18} distance={16} decay={2} />
      <pointLight position={[11, 5, -1]} color="#28d7e5" intensity={16} distance={18} decay={2} />
      <FloorSystem />
      <StructuralFrames />
      <NeonWalls motionEnabled={props.motionEnabled} />
      <DataStreams motionEnabled={props.motionEnabled} focused={props.activeExhibit !== null} />
      <IndustrialAssets activeExhibit={props.activeExhibit} motionEnabled={props.motionEnabled} />
      <CentralCore motionEnabled={props.motionEnabled} intensity={coreIntensity} />
      <ExhibitHotspots activeExhibit={props.activeExhibit} motionEnabled={props.motionEnabled} onSelectExhibit={props.onSelectExhibit} />
      <IntroSequence active={props.introActive} onComplete={props.onIntroComplete} />
      <IntegratedCameraController
        activeExhibit={props.activeExhibit}
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
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        shadows
        onCreated={({ gl, scene, camera }) => {
          gl.domElement.addEventListener('webglcontextlost', props.onFallback, { once: true });
          // 主动编译着色器管线，消除首帧卡顿
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
