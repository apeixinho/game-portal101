import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

/**
 * Central sun: emissive core + two additive halo sprites that pulse gently
 * and rotate to fake bloom without paying the cost of a post-processing pass.
 */
export function Sun(): JSX.Element {
  const core = useRef<Mesh>(null);
  const halo = useRef<Mesh>(null);
  const outer = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (core.current) {
      const pulse = 1 + Math.sin(t * 1.8) * 0.025;
      core.current.scale.setScalar(pulse);
    }
    if (halo.current) {
      halo.current.rotation.z = t * 0.05;
    }
    if (outer.current) {
      outer.current.rotation.z = -t * 0.03;
    }
  });

  return (
    <group>
      <pointLight position={[0, 0, 0]} intensity={4} distance={40} decay={1.2} color="#ffd9a8" />
      <mesh ref={core}>
        <sphereGeometry args={[1.05, 48, 48]} />
        <meshStandardMaterial color="#ff5fa8" emissive="#ffd9a8" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      <mesh ref={halo}>
        <sphereGeometry args={[1.55, 32, 32]} />
        <meshBasicMaterial color="#ff8fd3" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <mesh ref={outer}>
        <sphereGeometry args={[2.3, 32, 32]} />
        <meshBasicMaterial color="#ffb478" transparent opacity={0.08} depthWrite={false} />
      </mesh>
    </group>
  );
}
