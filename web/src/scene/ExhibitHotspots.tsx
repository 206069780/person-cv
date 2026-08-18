import { useRef } from 'react';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { EXHIBITS, getZoneFocus } from './scene-layout';

const ACCENTS = {
  signal: '#62e8cf',
  safety: '#ff6b3d',
  cyber: '#00d8ff',
} as const;

interface ExhibitBeaconProps {
  id: string;
  position: readonly [number, number, number];
  accent: keyof typeof ACCENTS;
  active: boolean;
  focusIntensity: number;
  interactive: boolean;
  motionEnabled: boolean;
  onSelect: (id: string) => void;
}

function ExhibitBeacon({ id, position, accent, active, focusIntensity, interactive, motionEnabled, onSelect }: ExhibitBeaconProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const color = active ? '#ff6b3d' : ACCENTS[accent];

  useFrame(({ clock }) => {
    if (!ringRef.current || !motionEnabled) return;
    ringRef.current.rotation.z = clock.elapsedTime * (accent === 'cyber' ? 0.7 : 0.25);
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.2 + position[0]) * 0.04;
    ringRef.current.scale.setScalar(pulse);
  });

  const select = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (interactive) onSelect(id);
  };

  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]} onClick={select} onPointerOver={() => { if (interactive) document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = ''; }}>
        <cylinderGeometry args={[1.45, 1.7, 0.2, 8]} />
        <meshStandardMaterial color="#11191b" metalness={0.88} roughness={0.28} emissive={color} emissiveIntensity={(active ? 0.34 : 0.1) * focusIntensity} />
      </mesh>
      <mesh ref={ringRef} position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]} onClick={select}>
        <torusGeometry args={[1.1, 0.035, 8, 48]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.28 + focusIntensity * 0.5} />
      </mesh>
      <mesh position={[-0.82, 1.6, 0]} onClick={select}>
        <boxGeometry args={[0.08, 3, 0.08]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0.82, 1.6, 0]} onClick={select}>
        <boxGeometry args={[0.08, 3, 0.08]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 3.06, 0]} onClick={select}>
        <boxGeometry args={[1.72, 0.08, 0.08]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.8} />
      </mesh>
      {active && (
        <pointLight position={[0, 1.2, 0.6]} color={color} intensity={8} distance={7} decay={2} />
      )}
    </group>
  );
}

interface ExhibitHotspotsProps {
  activeExhibit: string | null;
  motionEnabled: boolean;
  onSelectExhibit: (id: string) => void;
}

export function ExhibitHotspots({ activeExhibit, motionEnabled, onSelectExhibit }: ExhibitHotspotsProps) {
  return (
    <>
      {EXHIBITS.map((exhibit) => (
        (() => {
          const focus = getZoneFocus(activeExhibit, exhibit.id);
          return (
            <ExhibitBeacon
              key={exhibit.id}
              id={exhibit.id}
              position={exhibit.position}
              accent={exhibit.accent}
              active={activeExhibit === exhibit.id}
              focusIntensity={focus.intensity}
              interactive={focus.interactive}
              motionEnabled={motionEnabled}
              onSelect={onSelectExhibit}
            />
          );
        })()
      ))}
    </>
  );
}
