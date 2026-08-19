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
      target.y = 1.35;
      target.z = -2;
      lookAt();
      return;
    }

    // 初始高位全景机位：俯瞰全场天顶桁架与全息地面光轨
    camera.position.set(0, 6.2, 34);
    target.x = 0;
    target.y = 0.8;
    target.z = -6;
    lookAt();

    const timeline = gsap.timeline({
      defaults: { overwrite: true },
      onComplete,
    });

    // 电影级多阶复合运镜：高空俯冲 -> 侧翼穿梭流光 -> 中轴回正就绪
    timeline
      .to(camera.position, {
        x: -4.2,
        y: 3.2,
        z: 24,
        duration: 1.0,
        ease: 'power3.inOut',
        onUpdate: lookAt,
      })
      .to(
        target,
        {
          x: 1.2,
          y: 1.8,
          z: -6.5,
          duration: 1.0,
          ease: 'power3.inOut',
          onUpdate: lookAt,
        },
        '<'
      )
      .to(camera.position, {
        x: 0,
        y: 2.6,
        z: 16.5,
        duration: 1.4,
        ease: 'expo.out',
        onUpdate: lookAt,
      })
      .to(
        target,
        {
          x: 0,
          y: 1.35,
          z: -2,
          duration: 1.4,
          ease: 'expo.out',
          onUpdate: lookAt,
        },
        '<'
      );

    return () => {
      timeline.kill();
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(target);
    };
  }, [active, camera, onComplete]);

  return null;
}
