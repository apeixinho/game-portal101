import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { PLANETS, type Planet } from "../data/planets";
import { Sun } from "./Sun";
import { PlanetMesh } from "./Planet";

interface SolarSystemProps {
  readonly onSelect: (planet: Planet) => void;
  readonly onHover: () => void;
}

/**
 * R3F canvas root. Camera, controls and lighting are tuned so the widest
 * orbit (radius 9.8 — AI Bot Academy) fits comfortably on a 16:9 viewport at
 * the default FOV. Mobile/portrait gets a wider FOV via the Canvas resize
 * handler under the hood.
 */
export function SolarSystem({ onSelect, onHover }: SolarSystemProps): JSX.Element {
  return (
    <Canvas
      camera={{ position: [0, 6, 22], fov: 50, near: 0.1, far: 200 }}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#05060d"]} />
      <ambientLight intensity={0.25} />
      <Suspense fallback={null}>
        <Stars radius={80} depth={50} count={3500} factor={3} fade speed={0.4} />
        <Sun />
        {PLANETS.map((planet) => (
          <PlanetMesh key={planet.id} planet={planet} onSelect={onSelect} onHover={onHover} />
        ))}
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={8}
        maxDistance={32}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.62}
        rotateSpeed={0.5}
        zoomSpeed={0.6}
      />
    </Canvas>
  );
}
