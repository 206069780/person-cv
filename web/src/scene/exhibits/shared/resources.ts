import * as THREE from 'three';

export const SIGNAL = '#00a89d';
export const CYAN = '#28d7e5';
export const SAFETY = '#ff6b3d';
export const PURPLE = '#c084fc';
export const GOLD = '#f5a623';
export const EMERALD = '#34d399';

export const COLOR_STEEL_DARK = '#0e1b22';
export const COLOR_STEEL_MID = '#162832';
export const COLOR_STEEL_LIGHT = '#2b4452';
export const COLOR_STEEL_CHROME = '#7e9cb0';
export const COLOR_GOLD_ALLOY = '#d4941e';

export const baseOctagonGeo = new THREE.CylinderGeometry(2.45, 2.75, 0.22, 8);
export const baseTopPlateGeo = new THREE.CylinderGeometry(2.25, 2.25, 0.06, 8);
export const baseRingInnerGeo = new THREE.RingGeometry(1.65, 1.88, 32);
export const baseRingOuterGeo = new THREE.RingGeometry(2.0, 2.22, 8);
export const baseGearTorusGeo = new THREE.TorusGeometry(2.38, 0.026, 6, 64);
export const baseAuraHaloGeo = new THREE.RingGeometry(2.55, 2.82, 48);
export const baseCornerBlockGeo = new THREE.BoxGeometry(0.32, 0.24, 0.32);
export const baseCornerBoltGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6);
export const baseVentGeo = new THREE.BoxGeometry(0.65, 0.045, 0.14);
export const pulseSphereGeo = new THREE.SphereGeometry(0.065, 8, 8);
export const baseUplightConeGeo = new THREE.ConeGeometry(0.16, 0.85, 12, 1, true);
export const baseUndercarriageRingGeo = new THREE.RingGeometry(2.65, 2.78, 8);
export const ambientMoteGeo = new THREE.SphereGeometry(0.032, 6, 6);

export const pillarScanRingGeo = new THREE.TorusGeometry(0.24, 0.022, 6, 28);
export const pillarApexFlareGeo = new THREE.RingGeometry(0.06, 0.3, 20);
export const pillarApexBeamGeo = new THREE.ConeGeometry(0.26, 2.0, 16, 1, true);
export const energyWellSocketGeo = new THREE.RingGeometry(0.26, 0.44, 24);
export const energySocketInnerDiscGeo = new THREE.CircleGeometry(0.25, 16);

export const corePillarMainGeo = new THREE.BoxGeometry(0.38, 1.95, 0.38);
export const corePillarFinGeo = new THREE.BoxGeometry(0.46, 0.04, 0.46);
export const corePillarSpireGeo = new THREE.ConeGeometry(0.1, 0.32, 4);
export const corePillarSideNeonGeo = new THREE.BoxGeometry(0.035, 1.88, 0.035);
export const corePillarFinSlotNeonGeo = new THREE.BoxGeometry(0.48, 0.018, 0.48);

export const matTitaniumDark = new THREE.MeshStandardMaterial({
  color: COLOR_STEEL_DARK,
  metalness: 0.92,
  roughness: 0.2,
  emissive: new THREE.Color('#0a242f'),
  emissiveIntensity: 0.3,
});

export const matSteelMid = new THREE.MeshStandardMaterial({
  color: COLOR_STEEL_MID,
  metalness: 0.9,
  roughness: 0.22,
  emissive: new THREE.Color('#0c202a'),
  emissiveIntensity: 0.25,
});

export const matSteelLight = new THREE.MeshStandardMaterial({
  color: COLOR_STEEL_LIGHT,
  metalness: 0.88,
  roughness: 0.22,
  emissive: new THREE.Color('#102d3a'),
  emissiveIntensity: 0.2,
});

export const matChromeBright = new THREE.MeshStandardMaterial({
  color: COLOR_STEEL_CHROME,
  metalness: 0.98,
  roughness: 0.06,
  emissive: new THREE.Color('#1b3a4a'),
  emissiveIntensity: 0.2,
});

export const matGoldAlloy = new THREE.MeshStandardMaterial({
  color: COLOR_GOLD_ALLOY,
  metalness: 0.94,
  roughness: 0.12,
  emissive: new THREE.Color(GOLD),
  emissiveIntensity: 0.45,
});

export const matAcrylicCyan = new THREE.MeshStandardMaterial({
  color: '#0a232b',
  metalness: 0.9,
  roughness: 0.08,
  transparent: true,
  opacity: 0.62,
  emissive: new THREE.Color(CYAN),
  emissiveIntensity: 0.25,
});

export const matAcrylicOrange = new THREE.MeshStandardMaterial({
  color: '#28130a',
  metalness: 0.9,
  roughness: 0.08,
  transparent: true,
  opacity: 0.62,
  emissive: new THREE.Color(SAFETY),
  emissiveIntensity: 0.25,
});

export const matAcrylicPurple = new THREE.MeshStandardMaterial({
  color: '#210e2d',
  metalness: 0.9,
  roughness: 0.08,
  transparent: true,
  opacity: 0.62,
  emissive: new THREE.Color(PURPLE),
  emissiveIntensity: 0.25,
});
