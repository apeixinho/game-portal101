import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PlanetGrid } from "../components/PlanetGrid";

/**
 * Accessibility-first planet picker. Always rendered as a keyboard-navigable
 * grid of links, with a "Voltar ao portal" affordance back to `/`.
 *
 * Reachable from the Hub via the "Abrir lista de planetas (acessível)" link
 * and directly by URL — handy for screen-reader users and for environments
 * where WebGL is disabled by policy.
 */
export function PlanetsRoute(): JSX.Element {
  useEffect(() => {
    document.title = "Planetas · Portal do Prof. Ricardo";
  }, []);

  return (
    <div className="portal-root" style={{ overflow: "auto" }}>
      <header className="hud__header" style={{ position: "relative", pointerEvents: "auto" }}>
        <Link
          to="/"
          className="hud__brand hud__brand--button"
          aria-label="Voltar ao portal"
          title="Voltar ao portal"
        >
          <span className="hud__back-icon" aria-hidden="true">
            ←
          </span>
          <span className="hud__brand-dot" aria-hidden="true" />
          <span>Prof. Ricardo · Universo</span>
        </Link>
      </header>
      <PlanetGrid />
    </div>
  );
}
