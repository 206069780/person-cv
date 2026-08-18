import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { EXHIBITS, ExhibitLayout, getZoneFocus } from './scene-layout';

const SIGNAL = '#00a89d';
const CYAN = '#28d7e5';
const SAFETY = '#ff6b3d';
const STEEL = '#304149';
const DARK = '#0a1419';

interface ZoneProps {
  exhibit: ExhibitLayout;
  intensity: number;
  motionEnabled: boolean;
}

function FlowPulses({
  start,
  end,
  color,
  intensity,
  motionEnabled,
  count = 5,
}: {
  start: readonly [number, number, number];
  end: readonly [number, number, number];
  color: string;
  intensity: number;
  motionEnabled: boolean;
  count?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const helper = useMemo(() => new THREE.Object3D(), []);
  const progress = useRef(Array.from({ length: count }, (_, index) => index / count));

  useFrame((_, delta) => {
    if (!ref.current) return;
    progress.current.forEach((value, index) => {
      const next = motionEnabled ? (value + delta * (0.12 + index * 0.008)) % 1 : value;
      progress.current[index] = next;
      helper.position.set(
        THREE.MathUtils.lerp(start[0], end[0], next),
        THREE.MathUtils.lerp(start[1], end[1], next),
        THREE.MathUtils.lerp(start[2], end[2], next),
      );
      helper.scale.setScalar(index % 2 === 0 ? 1 : 0.7);
      helper.updateMatrix();
      ref.current?.setMatrixAt(index, helper.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.055, 8, 8]} />
      <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.32 + intensity * 0.48} />
    </instancedMesh>
  );
}

function ZoneBase({ intensity, accent = SIGNAL }: { intensity: number; accent?: string }) {
  return (
    <group>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[2.25, 2.45, 0.16, 12]} />
        <meshStandardMaterial color={DARK} metalness={0.82} roughness={0.34} emissive={accent} emissiveIntensity={0.04 * intensity} />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.92, 0.025, 6, 56]} />
        <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.18 + intensity * 0.35} />
      </mesh>
    </group>
  );
}

function CoreZone({ intensity, motionEnabled }: ZoneProps) {
  return (
    <group>
      <ZoneBase intensity={intensity} />
      {[-1, 1].flatMap((x) => [-1, 1].map((z) => (
        <mesh key={`${x}-${z}`} position={[x * 1.32, 0.85, z * 1.1]} castShadow>
          <boxGeometry args={[0.16, 1.45, 0.16]} />
          <meshStandardMaterial color={STEEL} metalness={0.92} roughness={0.22} emissive={CYAN} emissiveIntensity={0.12 * intensity} />
        </mesh>
      )))}
      <FlowPulses start={[-1.3, 1.65, -1.1]} end={[1.3, 1.65, 1.1]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} />
    </group>
  );
}

function DeviceZone({ intensity, motionEnabled }: ZoneProps) {
  return (
    <group>
      <ZoneBase intensity={intensity} />
      {[-0.95, 0, 0.95].map((x, index) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.72, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.42, 1.15, 16]} />
            <meshStandardMaterial color={index === 1 ? '#3d515a' : STEEL} metalness={0.88} roughness={0.27} emissive={SIGNAL} emissiveIntensity={0.08 * intensity} />
          </mesh>
          <mesh position={[0, 1.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.31, 0.06, 8, 24]} />
            <meshStandardMaterial color={SAFETY} metalness={0.65} roughness={0.3} emissive={SAFETY} emissiveIntensity={0.15 * intensity} />
          </mesh>
          <mesh position={[0, 0.76, 0.54]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 1, 12]} />
            <meshStandardMaterial color="#50646c" metalness={0.9} roughness={0.25} />
          </mesh>
        </group>
      ))}
      <FlowPulses start={[-1.55, 1.58, 0]} end={[1.55, 1.58, 0]} color={SIGNAL} intensity={intensity} motionEnabled={motionEnabled} count={6} />
    </group>
  );
}

function ProtocolZone({ intensity, motionEnabled }: ZoneProps) {
  return (
    <group>
      <ZoneBase intensity={intensity} />
      {[-1.35, -0.45, 0.45, 1.35].map((x, index) => (
        <group key={x} position={[x, 0.22, 0]}>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[0.08, 1.7, 0.72]} />
            <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.23} />
          </mesh>
          <mesh position={[0, 1.77, 0]}>
            <boxGeometry args={[0.42, 0.08, 0.72]} />
            <meshBasicMaterial color={index === 3 ? SAFETY : CYAN} toneMapped={false} transparent opacity={0.35 + intensity * 0.35} />
          </mesh>
        </group>
      ))}
      <FlowPulses start={[-1.75, 1.13, 0]} end={[1.75, 1.13, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} count={8} />
    </group>
  );
}

function GisZone({ intensity, motionEnabled }: ZoneProps) {
  const links = [
    [-1.45, -0.7, -0.5, -0.7], [-0.5, -0.7, -0.5, 0.4], [-0.5, 0.4, 0.55, 0.4],
    [0.55, 0.4, 0.55, -0.9], [0.55, -0.9, 1.5, -0.9], [0.55, 0.4, 1.45, 1.0],
  ];
  return (
    <group>
      <ZoneBase intensity={intensity} />
      <mesh position={[0, 0.24, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.65, 1.65, 6]} />
        <meshBasicMaterial color={SIGNAL} wireframe toneMapped={false} transparent opacity={0.12 + intensity * 0.22} />
      </mesh>
      {links.map(([x1, z1, x2, z2], index) => {
        const dx = x2 - x1;
        const dz = z2 - z1;
        const length = Math.hypot(dx, dz);
        return (
          <mesh key={index} position={[(x1 + x2) / 2, 0.31, (z1 + z2) / 2]} rotation={[0, -Math.atan2(dz, dx), 0]}>
            <boxGeometry args={[length, 0.035, 0.05]} />
            <meshBasicMaterial color={index === 4 ? SAFETY : CYAN} toneMapped={false} transparent opacity={0.3 + intensity * 0.42} />
          </mesh>
        );
      })}
      {links.slice(0, 5).map((link, index) => <mesh key={`node-${index}`} position={[link[0], 0.39, link[1]]}><cylinderGeometry args={[0.1, 0.1, 0.13, 10]} /><meshStandardMaterial color={STEEL} emissive={CYAN} emissiveIntensity={0.25 * intensity} /></mesh>)}
      <FlowPulses start={[-1.45, 0.4, -0.7]} end={[1.45, 0.4, 1]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={5} />
    </group>
  );
}

function OaZone({ intensity, motionEnabled }: ZoneProps) {
  const nodes = [[0, 1.9, 0], [-1.15, 1.1, 0], [0, 1.1, 0], [1.15, 1.1, 0], [-1.55, 0.42, 0], [-0.75, 0.42, 0], [0.75, 0.42, 0], [1.55, 0.42, 0]];
  return (
    <group>
      <ZoneBase intensity={intensity} accent={SAFETY} />
      {nodes.map(([x, y, z], index) => (
        <mesh key={index} position={[x, y, z]} castShadow>
          <boxGeometry args={[index === 0 ? 0.62 : 0.44, 0.24, 0.3]} />
          <meshStandardMaterial color={STEEL} metalness={0.72} roughness={0.3} emissive={index === 0 ? SAFETY : SIGNAL} emissiveIntensity={0.18 * intensity} />
        </mesh>
      ))}
      <mesh position={[0, 1.52, 0]}><boxGeometry args={[0.035, 0.58, 0.035]} /><meshBasicMaterial color={SAFETY} /></mesh>
      <mesh position={[0, 0.76, 0]}><boxGeometry args={[3.1, 0.025, 0.025]} /><meshBasicMaterial color={SIGNAL} /></mesh>
      <FlowPulses start={[-1.55, 0.7, 0]} end={[1.55, 0.7, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={6} />
    </group>
  );
}

function AgentZone({ intensity, motionEnabled }: ZoneProps) {
  const nodes = [[-1.35, 1.15, 0], [0, 1.85, 0], [1.35, 1.15, 0], [0, 0.55, 0]];
  return (
    <group>
      <ZoneBase intensity={intensity} accent={CYAN} />
      {nodes.map(([x, y, z], index) => (
        <mesh key={index} position={[x, y, z]} rotation={[0.2, index * 0.4, 0.1]} castShadow>
          <icosahedronGeometry args={[index === 1 ? 0.43 : 0.3, 0]} />
          <meshStandardMaterial color={DARK} metalness={0.74} roughness={0.2} emissive={index === 3 ? SAFETY : CYAN} emissiveIntensity={(index === 1 ? 0.85 : 0.42) * intensity} />
        </mesh>
      ))}
      <FlowPulses start={[-1.35, 1.15, 0]} end={[0, 1.85, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} />
      <FlowPulses start={[0, 1.85, 0]} end={[1.35, 1.15, 0]} color={CYAN} intensity={intensity} motionEnabled={motionEnabled} />
      <FlowPulses start={[1.35, 1.15, 0]} end={[0, 0.55, 0]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} />
      <pointLight position={[0, 1.4, 0.5]} color={CYAN} intensity={4 * intensity} distance={4} decay={2} />
    </group>
  );
}

function SearchZone({ intensity, motionEnabled }: ZoneProps) {
  return (
    <group>
      <ZoneBase intensity={intensity} />
      {[-1.2, -0.4, 0.4, 1.2].map((x, index) => (
        <mesh key={x} position={[x, 0.95, 0]} castShadow>
          <boxGeometry args={[0.42, 1.55, 0.72]} />
          <meshStandardMaterial color={index % 2 ? '#354952' : STEEL} metalness={0.82} roughness={0.3} emissive={CYAN} emissiveIntensity={0.08 * intensity} />
        </mesh>
      ))}
      {[-1.2, -0.4, 0.4, 1.2].flatMap((x) => [0.55, 0.92, 1.29].map((y) => <mesh key={`${x}-${y}`} position={[x, y, 0.37]}><boxGeometry args={[0.24, 0.035, 0.02]} /><meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.22 + intensity * 0.38} /></mesh>))}
      <FlowPulses start={[-1.75, 1.72, 0.4]} end={[1.75, 1.72, 0.4]} color={SAFETY} intensity={intensity} motionEnabled={motionEnabled} count={7} />
    </group>
  );
}

function PlantZone({ intensity, motionEnabled }: ZoneProps) {
  return (
    <group>
      <ZoneBase intensity={intensity} accent={SAFETY} />
      {[-0.9, 0.9].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.95, 0]} castShadow>
            <cylinderGeometry args={[0.52, 0.52, 1.55, 18]} />
            <meshStandardMaterial color="#3b5059" metalness={0.76} roughness={0.32} emissive={SIGNAL} emissiveIntensity={0.07 * intensity} />
          </mesh>
          <mesh position={[0, 1.75, 0]}><cylinderGeometry args={[0.18, 0.5, 0.18, 18]} /><meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.25} /></mesh>
        </group>
      ))}
      <mesh position={[0, 0.68, 0.58]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.11, 0.11, 1.8, 12]} />
        <meshStandardMaterial color={SAFETY} metalness={0.74} roughness={0.28} emissive={SAFETY} emissiveIntensity={0.12 * intensity} />
      </mesh>
      <FlowPulses start={[-1.55, 0.68, 0.58]} end={[1.55, 0.68, 0.58]} color={SIGNAL} intensity={intensity} motionEnabled={motionEnabled} count={6} />
    </group>
  );
}

function IndustrialZone(props: ZoneProps) {
  const component = {
    core: CoreZone,
    device: DeviceZone,
    protocol: ProtocolZone,
    gis: GisZone,
    oa: OaZone,
    agent: AgentZone,
    search: SearchZone,
    plant: PlantZone,
  }[props.exhibit.zone];
  const Zone = component;
  return <Zone {...props} />;
}

export function IndustrialAssets({ activeExhibit, motionEnabled }: { activeExhibit: string | null; motionEnabled: boolean }) {
  return (
    <>
      {EXHIBITS.map((exhibit) => {
        const focus = getZoneFocus(activeExhibit, exhibit.id);
        return (
          <group key={exhibit.id} position={exhibit.position} scale={focus.intensity < 0.5 ? 0.96 : 1}>
            <IndustrialZone exhibit={exhibit} intensity={focus.intensity} motionEnabled={motionEnabled} />
          </group>
        );
      })}
    </>
  );
}
