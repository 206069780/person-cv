import { Component, ReactNode, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { IntegratedCameraController } from './camera/IntegratedCameraController';
import { DataStreams } from './environment/DataStreams';
import { FloorSystem } from './environment/FloorSystem';
import { NeonWalls } from './environment/NeonWalls';
import { StructuralFrames } from './environment/StructuralFrames';
import { ExhibitHotspots } from './ExhibitHotspots';
import { IndustrialAssets } from './exhibits/IndustrialAssets';
import { IntroSequence } from './IntroSequence';
import { ModelHologramTags } from './ModelHologramTag';
import { EXHIBITS } from './scene-layout';
import type { MuseumSceneProps } from './scene-types';

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

interface SceneContentProps extends Omit<MuseumSceneProps, 'onReady' | 'onFallback'> {}

function SceneContent(props: SceneContentProps) {
  const { scene, gl } = useThree();

  useEffect(() => {
    scene.background = new THREE.Color('#03080c');
    scene.fog = new THREE.FogExp2('#03080c', 0.013);
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.32;
  }, [gl, scene]);

  const activeExhibitData = EXHIBITS.find((e) => e.id === props.activeExhibit);

  return (
    <>
      {/* 赛博朋克双色环境光与顶光 */}
      <hemisphereLight color="#c2f5f9" groundColor="#061218" intensity={1.15} />
      <directionalLight
        position={[8, 16, 10]}
        color="#f0fdff"
        intensity={2.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />
      {/* 左右侧翼强轮廓补光 */}
      <pointLight position={[-12, 5.0, 4]} color="#ff6b3d" intensity={16} distance={18} decay={2} />
      <pointLight position={[12, 5.0, -2]} color="#28d7e5" intensity={16} distance={18} decay={2} />
      <pointLight position={[0, 6.5, 12]} color="#a78bfa" intensity={12} distance={16} decay={2} />

      {/* 选中展品时的聚焦舞台顶灯 */}
      {activeExhibitData && (
        <pointLight
          position={[activeExhibitData.position[0], 5.5, activeExhibitData.position[2]]}
          color={activeExhibitData.accent === 'safety' ? '#ff9248' : activeExhibitData.accent === 'cyber' ? '#d8b4fe' : '#67e8f9'}
          intensity={22}
          distance={10}
          decay={2}
        />
      )}

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
