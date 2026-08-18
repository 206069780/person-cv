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
    const target = { z: 2 };
    const lookAt = () => camera.lookAt(new THREE.Vector3(0, 2, target.z));

    if (!active) {
      camera.position.set(0, 2.45, 13);
      target.z = 0;
      lookAt();
      return;
    }

    camera.position.set(0, 3.4, 32);
    lookAt();

    const timeline = gsap.timeline({
      defaults: { overwrite: true },
      onComplete,
    });

    timeline
      .to(camera.position, { z: 24, y: 3, duration: 1.25, ease: 'power2.in', onUpdate: lookAt })
      .to(camera.position, { z: 17, y: 2.7, duration: 2.15, ease: 'expo.inOut', onUpdate: lookAt })
      .to(target, { z: -4, duration: 1.2, ease: 'power2.inOut', onUpdate: lookAt }, '<0.25')
      .to(camera.position, { z: 13, y: 2.45, duration: 2.35, ease: 'expo.out', onUpdate: lookAt });

    return () => {
      timeline.kill();
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(target);
    };
  }, [active, camera, onComplete]);

  return null;
}
