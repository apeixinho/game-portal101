import { Canvas } from "@react-three/fiber";
import { Snail } from "./Snail";
import { Track } from "./Track";

export interface Racer {
  readonly id: string;
  readonly progress: number;
  readonly hop: number;
  readonly color: string;
  /** Lane offset along Z. */
  readonly z: number;
}

interface SnailRaceProps {
  readonly racers: readonly Racer[];
}

/**
 * R3F canvas hosting the snail race. Kept presentational: all game state lives
 * in the route components and is passed down as a list of racers (one for solo,
 * 2–4 for local multiplayer).
 */
export function SnailRace({ racers }: SnailRaceProps): JSX.Element {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 3.4, 7.5], fov: 50 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#bfe8ff"]} />
      <fog attach="fog" args={["#bfe8ff", 12, 22]} />

      <ambientLight intensity={0.7} />
      <directionalLight
        position={[5, 8, 4]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <Track />
      {racers.map((r) => (
        <Snail key={r.id} progress={r.progress} hop={r.hop} color={r.color} z={r.z} />
      ))}
    </Canvas>
  );
}
