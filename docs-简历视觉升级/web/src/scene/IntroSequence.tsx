import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';

interface IntroSequenceProps {
  active: boolean;
  onComplete: () => void;
}

export function IntroSequence({ active, onComplete }: IntroSequenceProps) {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    const target = { x: 0, y: 1.8, z: 2 };
    const lookAt = () => camera.lookAt(new THREE.Vector3(target.x, target.y, target.z));

    if (!active) {
      camera.position.set(0, 2.45, 13);
      target.x = 0;
      target.y = 1.4;
      target.z = -2;
      lookAt();
      return;
    }

    camera.position.set(0, 2.6, 34);
    lookAt();

    const timeline = gsap.timeline({
      defaults: { overwrite: true },
      onComplete,
    });

    timeline
      .to(camera.position, { z: 25, y: 1.8, duration: 1.2, ease: 'power2.in', onUpdate: lookAt })
      .to(camera.position, { x: -3.6, z: 18, y: 1.25, duration: 1.6, ease: 'power2.inOut', onUpdate: lookAt })
      .to(target, { x: 0, y: 0.2, z: -2, duration: 1.1, ease: 'power2.inOut', onUpdate: lookAt }, '<0.5')
      .to(camera.position, { x: 0, z: 4.5, y: 3.6, duration: 2.15, ease: 'expo.inOut', onUpdate: lookAt })
      .to(target, { x: 0, y: 2.1, z: -8, duration: 1.35, ease: 'power2.out', onUpdate: lookAt }, '<0.8')
      .to(camera.position, { x: 0, z: 13, y: 2.45, duration: 1.3, ease: 'expo.out', onUpdate: lookAt })
      .to(target, { x: 0, y: 1.4, z: -2, duration: 1.3, ease: 'expo.out', onUpdate: lookAt }, '<');

    return () => {
      timeline.kill();
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(target);
    };
  }, [active, camera, onComplete]);

  return null;
}
