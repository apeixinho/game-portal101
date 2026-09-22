import { useMemo } from "react";
import { TRACK_FINISH_X, TRACK_START_X } from "./constants";

/**
 * The race ground: a grassy lane with dashed lane markers and a checkered
 * finish gate. Built from primitives so there are no external GLB assets.
 */
export function Track(): JSX.Element {
  const dashes = useMemo(() => {
    const items: number[] = [];
    for (let x = TRACK_START_X; x <= TRACK_FINISH_X; x += 1.3) items.push(x);
    return items;
  }, []);

  const checkers = useMemo(() => {
    const tiles: { x: number; z: number; light: boolean }[] = [];
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 2; col++) {
        tiles.push({
          x: TRACK_FINISH_X + 0.4 + col * 0.32,
          z: -1.6 + row * 0.64,
          light: (row + col) % 2 === 0,
        });
      }
    }
    return tiles;
  }, []);

  return (
    <group>
      {/* Grass field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[16, 9]} />
        <meshStandardMaterial color="#3f7d2a" />
      </mesh>

      {/* Dirt lane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[13.5, 3]} />
        <meshStandardMaterial color="#caa05a" />
      </mesh>

      {/* Centre dashed line */}
      {dashes.map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, 0]}>
          <planeGeometry args={[0.5, 0.12]} />
          <meshStandardMaterial color="#fff4e0" />
        </mesh>
      ))}

      {/* Finish gate posts */}
      {[-1.5, 1.5].map((z) => (
        <mesh key={z} position={[TRACK_FINISH_X + 0.4, 1, z]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 2, 12]} />
          <meshStandardMaterial color="#f5d442" />
        </mesh>
      ))}
      <mesh position={[TRACK_FINISH_X + 0.4, 2.05, 0]} castShadow>
        <boxGeometry args={[0.2, 0.3, 3.2]} />
        <meshStandardMaterial color="#e0531f" />
      </mesh>

      {/* Checkered finish strip on the ground */}
      {checkers.map((t, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[t.x, 0.02, t.z]}>
          <planeGeometry args={[0.32, 0.64]} />
          <meshStandardMaterial color={t.light ? "#fff4e0" : "#1c1c1c"} />
        </mesh>
      ))}
    </group>
  );
}
