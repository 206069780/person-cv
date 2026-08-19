import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';

interface IntroSequenceProps {
  active: boolean;
  onComplete: () => void;
}

const _introLookAtVector = new THREE.Vector3();

export function IntroSequence({ active, onComplete }: IntroSequenceProps) {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    const target = { x: 0, y: 1.8, z: 2 };
    const lookAt = () => {
      _introLookAtVector.set(target.x, target.y, target.z);
      camera.lookAt(_introLookAtVector);
    };

    if (!active) {
      camera.position.set(0, 2.6, 16.5);
      target.x = 0;
      target.y = 1.3;
      target.z = -2;
      lookAt();
      return;
    }

    camera.position.set(0, 3.8, 30);
    target.x = 0;
    target.y = 1.1;
    target.z = 1;
    lookAt();

    const timeline = gsap.timeline({
      defaults: { overwrite: true },
      onComplete,
    });

    // 优化后的紧凑镜头：总时长约 2.2 秒，兼顾全景张力与快速就绪
    timeline
      .to(camera.position, { x: -2.8, y: 2.6, z: 21, duration: 0.9, ease: 'power2.inOut', onUpdate: lookAt })
      .to(target, { x: 0, y: 1.6, z: -4, duration: 0.9, ease: 'power2.inOut', onUpdate: lookAt }, '<')
      .to(camera.position, { x: 0, y: 2.6, z: 16.5, duration: 1.3, ease: 'expo.out', onUpdate: lookAt })
      .to(target, { x: 0, y: 1.3, z: -2, duration: 1.3, ease: 'expo.out', onUpdate: lookAt }, '<');

    return () => {
      timeline.kill();
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(target);
    };
  }, [active, camera, onComplete]);

  return null;
}
