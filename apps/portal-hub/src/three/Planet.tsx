import { useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import type { Planet } from "../data/planets";

interface PlanetMeshProps {
  readonly planet: Planet;
  readonly onSelect: (planet: Planet) => void;
  readonly onHover: () => void;
}

/**
 * One orbiting planet. Hierarchy:
 *   <group rotation z=tilt>       ← inclines the orbital plane
 *     <group ref=orbit>           ← rotates around Y to move along the orbit
 *       <group position=[r,0,0]>  ← parks the planet at orbital radius
 *         <mesh>                  ← the planet body + optional ring
 */
export function PlanetMesh({ planet, onSelect, onHover }: PlanetMeshProps): JSX.Element {
  const orbit = useRef<Group>(null);
  const body = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = useReducedMotion();

  // Pre-bake the orbital sentinel ring (visible faint guide).
  const orbitPath = useMemo(() => {
    const pts: number[] = [];
    const segs = 96;
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      pts.push(Math.cos(a) * planet.orbit.radius, 0, Math.sin(a) * planet.orbit.radius);
    }
    return new Float32Array(pts);
  }, [planet.orbit.radius]);

  useFrame((_state, delta) => {
    // Reduced-motion: leave planets parked at their seeded orbit angle so the
    // scene is still and non-vestibular. Hover/zoom interactions stay intact.
    if (reducedMotion) return;
    if (orbit.current) {
      orbit.current.rotation.y += delta * planet.orbit.speed * planet.orbit.direction;
    }
    if (body.current) {
      body.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group rotation={[planet.orbit.tilt, 0, 0]}>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[orbitPath, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={planet.palette.emissive} transparent opacity={0.12} depthWrite={false} />
      </line>

      <group ref={orbit} rotation={[0, planet.orbit.angle, 0]}>
        <group position={[planet.orbit.radius, 0, 0]}>
          <mesh
            ref={body}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(true);
              document.body.style.cursor = "pointer";
              onHover();
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHovered(false);
              document.body.style.cursor = "";
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(planet);
            }}
            scale={hovered ? 1.12 : 1}
          >
            <sphereGeometry args={[planet.size, 40, 40]} />
            <meshStandardMaterial
              color={planet.palette.secondary}
              emissive={planet.palette.emissive}
              emissiveIntensity={hovered ? 0.85 : 0.4}
              roughness={0.55}
              metalness={0.15}
            />
          </mesh>

          {planet.ring && (
            <mesh rotation={[Math.PI / 2.3, 0, 0]}>
              <ringGeometry args={[planet.size * 1.35, planet.size * 1.85, 64]} />
              <meshBasicMaterial
                color={planet.palette.emissive}
                transparent
                opacity={0.55}
                side={2}
                depthWrite={false}
              />
            </mesh>
          )}

          {/* Halo around hovered planet — gives the click target visual feedback */}
          <mesh visible={hovered}>
            <sphereGeometry args={[planet.size * 1.5, 24, 24]} />
            <meshBasicMaterial color={planet.palette.primary} transparent opacity={0.22} depthWrite={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
