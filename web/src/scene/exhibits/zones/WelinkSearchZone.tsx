import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import type { ExhibitVisualProps } from '../exhibit-types';
import { FlowPulses } from '../shared/FlowPulses';
import { ZoneAtmosphericMotes } from '../shared/ZoneAtmosphericMotes';
import { ZoneBase } from '../shared/ZoneBase';
import {
  COLOR_STEEL_LIGHT,
  CYAN,
  getCachedBasicMaterial,
  GOLD,
  matGoldAlloy,
  matSteelMid,
  matTitaniumDark,
  SAFETY,
} from '../shared/resources';

// 05 - WeLink Search (统一搜索与个性化打分)
const searchCabinetRackGeo = new THREE.BoxGeometry(0.44, 1.82, 0.68);
const searchServerTrayGeo = new THREE.BoxGeometry(0.4, 0.15, 0.025);
const searchTrayLedGeo = new THREE.BoxGeometry(0.08, 0.04, 0.01);
const searchRackSideStripGeo = new THREE.BoxGeometry(0.025, 1.78, 0.025);
const searchPrismCrystalGeo = new THREE.ConeGeometry(0.72, 1.15, 4);
const searchBeamConeGeo = new THREE.ConeGeometry(1.45, 1.65, 16, 1, true);
const searchScannerBarGeo = new THREE.BoxGeometry(2.9, 0.04, 0.04);
const searchIndexCubeGeo = new THREE.BoxGeometry(0.28, 0.19, 0.24);

const SEARCH_RACK_CONFIGS = [-1.4, -0.48, 0.48, 1.4].map((x, index) => ({
  x,
  z: index % 2 === 0 ? 0.2 : -0.2,
  accent: index % 2 === 0 ? SAFETY : CYAN,
}));

const SEARCH_TRAY_YS = [0.26, 0.58, 0.9, 1.22, 1.54] as const;
const SEARCH_INDEX_XS = [-1.1, 0.0, 1.1] as const;

// ==========================================
// 5. WeLink 统一搜索与个性化打分引擎 (Search Zone)
// ==========================================
function WelinkSearchZoneComponent({ intensity, motionEnabled }: ExhibitVisualProps): React.JSX.Element {
  const prismRef = useRef<THREE.Mesh>(null);
  const scannerRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  const materials = useMemo(() => {
    return {
      indexCube: new THREE.MeshStandardMaterial({ color: COLOR_STEEL_LIGHT, metalness: 0.92, emissive: CYAN, emissiveIntensity: 0.65 * intensity }),
      stripSafety: getCachedBasicMaterial(SAFETY, { transparent: true, opacity: +(0.75 + intensity * 0.25).toFixed(2) }),
      stripCyan: getCachedBasicMaterial(CYAN, { transparent: true, opacity: +(0.75 + intensity * 0.25).toFixed(2) }),
      ledSafety: getCachedBasicMaterial(SAFETY),
      ledCyan: getCachedBasicMaterial(CYAN),
      beam: getCachedBasicMaterial(GOLD, { transparent: true, opacity: 0.25, side: THREE.DoubleSide }),
      scanner: getCachedBasicMaterial(SAFETY, { transparent: true, opacity: +(0.85 + intensity * 0.15).toFixed(2) }),
    };
  }, [intensity]);

  useFrame(({ clock }, delta) => {
    if (!motionEnabled) return;
    const speedMult = intensity > 1 ? 1.65 : 1;
    if (prismRef.current) {
      prismRef.current.rotation.y += delta * 1.05 * speedMult;
      prismRef.current.position.y = 2.18 + Math.sin(clock.elapsedTime * 2.8) * 0.1;
    }
    if (scannerRef.current) {
      scannerRef.current.position.y = 0.58 + Math.sin(clock.elapsedTime * 3.2) * 0.55;
    }
    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = 0.22 + Math.sin(clock.elapsedTime * 3) * 0.09;
    }
  });

  return (
    <group>
      <ZoneBase intensity={intensity} accent={SAFETY} motionEnabled={motionEnabled} />
      <ZoneAtmosphericMotes accent={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={16} />

      {/* 4联分布式 ES 搜索服务器机柜阵列 */}
      {SEARCH_RACK_CONFIGS.map((rack, index) => (
        <group key={index} position={[rack.x, 0.24, rack.z]}>
          <mesh position={[0, 0.94, 0]} castShadow geometry={searchCabinetRackGeo} material={matTitaniumDark} />
          {/* 机柜正面两边高亮垂直导光管 */}
          {[-0.17, 0.17].map((cx) => (
            <mesh key={cx} position={[cx, 0.94, 0.36]} geometry={searchRackSideStripGeo} material={rack.accent === SAFETY ? materials.stripSafety : materials.stripCyan} />
          ))}
          {/* 独立服务器抽屉面板 */}
          {SEARCH_TRAY_YS.map((y, trayIdx) => (
            <group key={trayIdx} position={[0, y, 0.37]}>
              <mesh geometry={searchServerTrayGeo} material={matSteelMid} />
              <mesh position={[0.13, 0, 0.02]} geometry={searchTrayLedGeo} material={trayIdx % 2 === 0 ? materials.ledSafety : materials.ledCyan} />
            </group>
          ))}
        </group>
      ))}

      {/* 悬浮倒金字塔多维打分分发棱镜 */}
      <mesh ref={prismRef} position={[0, 2.18, 0]} rotation={[Math.PI, 0, 0]} geometry={searchPrismCrystalGeo} material={matGoldAlloy} />

      {/* 打分向下投射的半透明光锥 */}
      <mesh ref={beamRef} position={[0, 1.5, 0]} rotation={[Math.PI, 0, 0]} geometry={searchBeamConeGeo} material={materials.beam} />

      {/* 动态水平切片扫描激光 */}
      <group ref={scannerRef} position={[0, 0.9, 0.42]}>
        <mesh geometry={searchScannerBarGeo} material={materials.scanner} />
      </group>

      {/* 悬浮倒排索引分片数据块 */}
      {SEARCH_INDEX_XS.map((x, idx) => (
        <mesh key={idx} position={[x, 1.65, 0.55]} geometry={searchIndexCubeGeo} material={materials.indexCube} />
      ))}

      <pointLight position={[0, 2.2, 0]} color={GOLD} intensity={6 + intensity * 11} distance={8.5} decay={2} />
      <FlowPulses start={[-1.85, 0.45, 0]} end={[0, 2.18, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={3} />
      <FlowPulses start={[1.85, 0.45, 0]} end={[0, 2.18, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={3} />
    </group>
  );
}

export const WelinkSearchZone = React.memo(WelinkSearchZoneComponent);

