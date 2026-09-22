import type { CSSProperties } from "react";
import { PLANETS } from "../data/planets";
import { resolvePlanetUrl } from "../lib/links";
import { CoffeeButton } from "./CoffeeButton";

/**
 * Accessibility / WebGL-fallback grid. Used in two places:
 *  1. As the root view when WebGL isn't available (older school iPads /
 *     Chromebooks — implementation plan §10 risk R4).
 *  2. As the `/planets` route — a keyboard-navigable picker the user can
 *     reach from anywhere without the 3D scene.
 *
 * Each card uses the planet's palette via per-card CSS variables.
 */
export function PlanetGrid(): JSX.Element {
  return (
    <div className="fallback">
      <h1 className="fallback__title">Universo de Jogos</h1>
      <p className="fallback__sub">Prof. Ricardo · {PLANETS.length} mundos para explorar</p>
      <div className="fallback__grid">
        {PLANETS.map((planet) => (
          <a
            key={planet.id}
            className="fallback__card"
            href={resolvePlanetUrl(planet)}
            target="_blank"
            rel="noopener noreferrer"
            style={
              {
                "--card-from": planet.palette.secondary,
                "--card-to": "#0a0616",
              } as CSSProperties
            }
            aria-label={`${planet.title}. ${planet.tagline}.`}
          >
            <div className="fallback__icon" aria-hidden="true">
              {planet.icon}
            </div>
            <div className="fallback__subject">{planet.subject}</div>
            <h2 className="fallback__name">{planet.title}</h2>
            <p className="fallback__desc">{planet.tagline}</p>
          </a>
        ))}
      </div>
      <CoffeeButton />
    </div>
  );
}
