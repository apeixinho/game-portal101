import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Hud } from "../components/Hud";
import { IntroOverlay } from "../components/IntroOverlay";
import { PeekModal } from "../components/PeekModal";
import { WarpEffect } from "../components/WarpEffect";
import { MuteButton } from "../components/MuteButton";
import { CoffeeButton } from "../components/CoffeeButton";
import { PlanetGrid } from "../components/PlanetGrid";
import { playCue, primeAudio } from "../lib/audio";
import { isWebGLAvailable } from "../lib/webgl";
import type { Planet } from "../data/planets";

// Lazy-load the R3F scene so the initial paint isn't blocked by Three.js.
const SolarSystem = lazy(() =>
  import("../three/SolarSystem").then((m) => ({ default: m.SolarSystem })),
);

type Stage = "intro" | "warping" | "explore";

/**
 * Root experience: intro → warp flash → 3D solar system. Falls back to the
 * grid view if WebGL is unavailable, with a quiet `/planets` link surfaced
 * for users who prefer the picker.
 */
export function HubRoute(): JSX.Element {
  const [stage, setStage] = useState<Stage>("intro");
  const [selected, setSelected] = useState<Planet | null>(null);
  const webGL = useMemo(() => isWebGLAvailable(), []);

  useEffect(() => {
    document.title = "Portal do Prof. Ricardo · Universo de Jogos";
  }, []);

  const handleEnter = useCallback(() => {
    primeAudio();
    playCue("atravessar");
    setStage("warping");
    window.setTimeout(() => {
      playCue("warp");
      setStage("explore");
    }, 600);
  }, []);

  const handleBack = useCallback(() => {
    playCue("close");
    setSelected(null);
    setStage("intro");
  }, []);

  const handleSelect = useCallback((planet: Planet) => {
    playCue("select");
    setSelected(planet);
  }, []);

  const handleHover = useCallback(() => {
    playCue("hover");
  }, []);

  if (!webGL) {
    return (
      <div className="portal-root">
        <PlanetGrid />
      </div>
    );
  }

  return (
    <div className="portal-root">
      {stage !== "intro" && (
        <Suspense
          fallback={
            <div className="loader">
              A carregar o universo
              <span className="loader__dot" />
            </div>
          }
        >
          <SolarSystem onSelect={handleSelect} onHover={handleHover} />
        </Suspense>
      )}

      <IntroOverlay onEnter={handleEnter} visible={stage === "intro"} />
      <WarpEffect active={stage === "warping"} />

      {stage === "explore" && (
        <>
          <Hud hasSelection={selected !== null} onBack={handleBack} />
          <MuteButton />
          <CoffeeButton />
          <nav className="hud" aria-label="Acessibilidade">
            <div className="hud__footer" style={{ pointerEvents: "auto", bottom: "3.6rem" }}>
              <Link
                to="/planets"
                className="hud__counter"
                style={{ textDecoration: "underline", textUnderlineOffset: "4px" }}
              >
                Abrir lista de planetas (acessível)
              </Link>
            </div>
          </nav>
        </>
      )}

      <PeekModal planet={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
