import { useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { useRef } from "react";
import * as THREE from "three";
import { progressToX } from "./constants";

interface SnailProps {
  /** Race progress, 0..1. The snail glides toward the matching X position. */
  readonly progress: number;
  /** Brief celebratory hop trigger (incremented on each correct answer). */
  readonly hop: number;
  /** Shell colour — distinguishes players in multiplayer. */
  readonly color?: string;
  /** Lane offset along Z (multiplayer lanes). */
  readonly z?: number;
}

/**
 * A friendly cartoon snail assembled from primitives: a soft body, a spiral
 * shell (torus), and two eye stalks. It eases toward its target X and bobs
 * gently; a correct answer triggers a small forward lunge via `hop`.
 */
export function Snail({ progress, hop, color = "#6ed75a", z = 0 }: SnailProps): JSX.Element {
  const group = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Mesh>(null);
  const lastHop = useRef(hop);
  const lunge = useRef(0);
  const reducedMotion = useReducedMotion();

  useFrame((state, delta) => {
    if (!group.current) return;

    // Glide toward target X regardless: advancing along the track is the core
    // progress feedback, not decorative motion.
    const targetX = progressToX(progress);
    const current = group.current.position.x;
    group.current.position.x = current + (targetX - current) * Math.min(1, delta * 3);

    // Reduced-motion: drop the idle bob, wobble, hop lunge and shell spin.
    if (reducedMotion) {
      group.current.position.y = 0.32;
      group.current.rotation.z = 0;
      return;
    }

    if (hop !== lastHop.current) {
      lunge.current = 1;
      lastHop.current = hop;
    }
    lunge.current = Math.max(0, lunge.current - delta * 2);

    const t = state.clock.elapsedTime;
    group.current.position.y = 0.32 + Math.sin(t * 4 + z) * 0.04 + lunge.current * 0.25;
    group.current.rotation.z = Math.sin(t * 4 + z) * 0.03;

    if (shell.current) shell.current.rotation.x = t * 0.6;
  });

  return (
    <group ref={group} position={[progressToX(progress), 0.32, z]}>
      {/* Body */}
      <mesh castShadow position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.18, 0.7, 8, 16]} />
        <meshStandardMaterial color="#f2d39b" />
      </mesh>

      {/* Head */}
      <mesh castShadow position={[0.5, 0.12, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#f2d39b" />
      </mesh>

      {/* Eye stalks */}
      {[-0.08, 0.08].map((eye) => (
        <group key={eye} position={[0.58, 0.28, eye]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} />
            <meshStandardMaterial color="#f2d39b" />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color="#1c1c1c" />
          </mesh>
        </group>
      ))}

      {/* Shell */}
      <mesh ref={shell} castShadow position={[-0.12, 0.34, 0]}>
        <torusGeometry args={[0.3, 0.14, 16, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[-0.12, 0.34, 0]}>
        <torusGeometry args={[0.15, 0.09, 12, 24]} />
        <meshStandardMaterial color="#ffffff" opacity={0.35} transparent />
      </mesh>
    </group>
  );
}
