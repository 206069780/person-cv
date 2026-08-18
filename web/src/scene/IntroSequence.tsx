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

    camera.position.set(0, 3.6, 28);
    target.x = 0;
    target.y = 1.0;
    target.z = 2;
    lookAt();

    const timeline = gsap.timeline({
      defaults: { overwrite: true },
      onComplete,
    });

    // 优化后的紧凑镜头：总时长约 2.2 秒，兼顾全景张力与快速就绪
    timeline
      .to(camera.position, { x: -2.2, y: 2.2, z: 18, duration: 0.9, ease: 'power2.inOut', onUpdate: lookAt })
      .to(target, { x: 0, y: 1.6, z: -4, duration: 0.9, ease: 'power2.inOut', onUpdate: lookAt }, '<')
      .to(camera.position, { x: 0, y: 2.45, z: 13, duration: 1.3, ease: 'expo.out', onUpdate: lookAt })
      .to(target, { x: 0, y: 1.4, z: -2, duration: 1.3, ease: 'expo.out', onUpdate: lookAt }, '<');

    return () => {
      timeline.kill();
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(target);
    };
  }, [active, camera, onComplete]);

  return null;
}
