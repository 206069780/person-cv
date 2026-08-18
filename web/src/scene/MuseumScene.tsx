import { Component, ReactNode, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { ExhibitHotspots } from './ExhibitHotspots';
import { IndustrialAssets } from './IndustrialAssets';
import { IntroSequence } from './IntroSequence';
import { EXHIBITS, getZoneFocus, SCENE_BOUNDS } from './scene-layout';

// 共享几何体池与材质池（避免每次渲染重新分配与显存冗余绑定）
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
  onSelectExhibit: (id: string) => void;
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

function FreeWalkControls({ enabled }: { enabled: boolean }) {
  const { camera, gl } = useThree();
  const keys = useRef(new Set<string>());
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const yaw = useRef(0);
  const pitch = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const element = gl.domElement;

    const keyDown = (event: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'BUTTON'].includes((event.target as HTMLElement)?.tagName)) return;
      keys.current.add(event.code);
    };
    const keyUp = (event: KeyboardEvent) => keys.current.delete(event.code);
    const pointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      dragging.current = true;
      lastPointer.current = { x: event.clientX, y: event.clientY };
    };
    const pointerUp = () => { dragging.current = false; };
    const pointerMove = (event: PointerEvent) => {
      if (!dragging.current) return;
      yaw.current -= (event.clientX - lastPointer.current.x) * 0.0025;
      pitch.current = THREE.MathUtils.clamp(pitch.current - (event.clientY - lastPointer.current.y) * 0.0018, -0.5, 0.42);
      lastPointer.current = { x: event.clientX, y: event.clientY };
    };

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('pointerup', pointerUp);
    element.addEventListener('pointerdown', pointerDown);
    element.addEventListener('pointermove', pointerMove);

    return () => {
      keys.current.clear();
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('pointerup', pointerUp);
      element.removeEventListener('pointerdown', pointerDown);
      element.removeEventListener('pointermove', pointerMove);
    };
  }, [enabled, gl]);

  useFrame((_, delta) => {
    if (!enabled) return;
    const movement = new THREE.Vector3();
    const forward = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    const right = new THREE.Vector3(Math.cos(yaw.current), 0, -Math.sin(yaw.current));
    const speed = Math.min(delta, 0.05) * 5.2;

    if (keys.current.has('KeyW') || keys.current.has('ArrowUp')) movement.add(forward);
    if (keys.current.has('KeyS') || keys.current.has('ArrowDown')) movement.sub(forward);
    if (keys.current.has('KeyD') || keys.current.has('ArrowRight')) movement.add(right);
    if (keys.current.has('KeyA') || keys.current.has('ArrowLeft')) movement.sub(right);
    if (movement.lengthSq() > 0) camera.position.add(movement.normalize().multiplyScalar(speed));

    camera.position.x = THREE.MathUtils.clamp(camera.position.x, SCENE_BOUNDS.minX, SCENE_BOUNDS.maxX);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, SCENE_BOUNDS.minZ, SCENE_BOUNDS.maxZ);
    camera.position.y = 2.45;
    camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ');
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

function FocusCamera({ activeId, introActive, motionEnabled }: { activeId: string | null; introActive: boolean; motionEnabled: boolean }) {
  const camera = useThree((state) => state.camera);
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const desiredQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const lookMatrix = useMemo(() => new THREE.Matrix4(), []);

  useFrame((_, delta) => {
    if (!activeId || introActive) return;
    const exhibit = EXHIBITS.find((item) => item.id === activeId);
    if (!exhibit) return;
    desiredPosition.set(exhibit.position[0] * 0.7, 3.3, exhibit.position[2] + 6.5);
    lookMatrix.lookAt(desiredPosition, new THREE.Vector3(exhibit.position[0] + 1.2, 1.05, exhibit.position[2]), camera.up);
    desiredQuaternion.setFromRotationMatrix(lookMatrix);
    const factor = motionEnabled ? 1 - Math.exp(-delta * 3.6) : 1;
    camera.position.lerp(desiredPosition, factor);
    camera.quaternion.slerp(desiredQuaternion, factor);
  });

  return null;
}

interface SceneContentProps extends Omit<MuseumSceneProps, 'onReady' | 'onFallback'> {}

function SceneContent(props: SceneContentProps) {
  const { scene, gl } = useThree();

  useEffect(() => {
    scene.background = new THREE.Color('#030708');
    scene.fog = new THREE.FogExp2('#030708', 0.027);
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.12;
  }, [gl, scene]);

  const coreIntensity = getZoneFocus(props.activeExhibit, 'litree-overview').intensity;

  return (
    <>
      <hemisphereLight color="#b7e5df" groundColor="#040708" intensity={0.72} />
      <directionalLight position={[5, 12, 8]} color="#e7f8f5" intensity={2.6} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-10, 4, 5]} color="#ff6b3d" intensity={15} distance={14} decay={2} />
      <pointLight position={[10, 4, -1]} color="#28d7e5" intensity={12} distance={16} decay={2} />
      <FloorSystem />
      <StructuralFrames />
      <DataStreams motionEnabled={props.motionEnabled} focused={props.activeExhibit !== null} />
      <IndustrialAssets activeExhibit={props.activeExhibit} motionEnabled={props.motionEnabled} />
      <CentralCore motionEnabled={props.motionEnabled} intensity={coreIntensity} />
      <ExhibitHotspots activeExhibit={props.activeExhibit} motionEnabled={props.motionEnabled} onSelectExhibit={props.onSelectExhibit} />
      <IntroSequence active={props.introActive} onComplete={props.onIntroComplete} />
      <FocusCamera activeId={props.activeExhibit} introActive={props.introActive} motionEnabled={props.motionEnabled} />
      <FreeWalkControls enabled={!props.introActive && props.activeExhibit === null} />
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
