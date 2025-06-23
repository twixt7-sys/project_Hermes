'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

type CircleProps = {
  radius: number;
  position: THREE.Vector3;
  mass: number;
  allCircles: React.MutableRefObject<THREE.Mesh[]>;
  mouse: React.MutableRefObject<THREE.Vector2>;
};

function Circle({ radius, position, mass, allCircles, mouse }: CircleProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const vel = useRef(new THREE.Vector3());
  const acc = useRef(new THREE.Vector3());
  const friction = 0.998;

  useFrame(() => {
    const pos = ref.current.position;

    // Move toward mouse
    const dx = mouse.current.x - pos.x;
    const dy = mouse.current.y - pos.y;
    const dist = Math.sqrt(dx ** 2 + dy ** 2);
    if (dist > 1) {
      const force = new THREE.Vector3(dx / dist, dy / dist, 0).multiplyScalar(0.5);
      acc.current.add(force.divideScalar(mass));
    }

    // Apply physics
    vel.current.multiplyScalar(friction);
    vel.current.add(acc.current);
    pos.add(vel.current);
    acc.current.set(0, 0, 0);

    // Bounce off edges
    const bounds = 10;
    if (pos.x - radius < -bounds || pos.x + radius > bounds) {
      vel.current.x *= -1;
      pos.x = THREE.MathUtils.clamp(pos.x, -bounds + radius, bounds - radius);
    }
    if (pos.y - radius < -bounds || pos.y + radius > bounds) {
      vel.current.y *= -1;
      pos.y = THREE.MathUtils.clamp(pos.y, -bounds + radius, bounds - radius);
    }

    // Collision with other circles
    for (const other of allCircles.current) {
      if (ref.current === other) continue;

      const op = other.position;
      const dx = pos.x - op.x;
      const dy = pos.y - op.y;
      const dist = Math.sqrt(dx ** 2 + dy ** 2);
      const minDist = radius * 2;

      if (dist < minDist) {
        const angle = Math.atan2(dy, dx);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        // Rotate velocities to 1D
        const v1 = {
          x: cos * vel.current.x + sin * vel.current.y,
          y: cos * vel.current.y - sin * vel.current.x,
        };
        const v2 = {
          x: cos * other.userData.vel.x + sin * other.userData.vel.y,
          y: cos * other.userData.vel.y - sin * other.userData.vel.x,
        };

        // Swap x velocities (elastic)
        const temp = v1.x;
        v1.x = v2.x;
        v2.x = temp;

        // Rotate back
        vel.current.set(
          cos * v1.x - sin * v1.y,
          cos * v1.y + sin * v1.x,
          0
        );
        other.userData.vel.set(
          cos * v2.x - sin * v2.y,
          cos * v2.y + sin * v2.x,
          0
        );

        // Push apart
        const overlap = (minDist - dist) / 2;
        const offset = new THREE.Vector3(dx / dist, dy / dist, 0).multiplyScalar(overlap);
        pos.add(offset);
        op.sub(offset);
      }
    }
  });

  useEffect(() => {
    ref.current.userData.vel = vel.current;
    allCircles.current.push(ref.current);
    return () => {
      allCircles.current = allCircles.current.filter((m) => m !== ref.current);
    };
  }, []);

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color="white" transparent opacity={0.8} />
    </mesh>
  );
}

function TrailPlane() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    if (ref.current.material instanceof THREE.MeshBasicMaterial) {
      ref.current.material.opacity = 0.08;
    }
  });

  return (
    <mesh position={[0, 0, -0.1]}>
      <planeGeometry args={[40, 40]} />
      <meshBasicMaterial color="black" transparent opacity={0.08} />
    </mesh>
  );
}

function Circles() {
  const mouse = useRef(new THREE.Vector2());
  const allCircles = useRef<THREE.Mesh[]>([]);
  const { size, viewport } = useThree();

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      mouse.current.x = ((e.clientX / size.width) * 2 - 1) * (viewport.width / 2);
      mouse.current.y = -((e.clientY / size.height) * 2 - 1) * (viewport.height / 2);
    };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, [size, viewport]);

  const count = 5;
  const spacing = 5;
  const radius = 0.5;
  const mass = 2;

  const circles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      position: new THREE.Vector3(-10 + i * spacing, 0, 0),
    }));
  }, []);

  return (
    <>
      <TrailPlane />
      {circles.map(({ id, position }) => (
        <Circle
          key={id}
          position={position.clone()}
          radius={radius}
          mass={mass}
          mouse={mouse}
          allCircles={allCircles}
        />
      ))}
    </>
  );
}

export default function Scene() {
  return (
    <Canvas className="absolute inset-0" camera={{ position: [0, 0, 15], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Circles />
    </Canvas>
  );
}
