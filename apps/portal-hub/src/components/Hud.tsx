import { PLANETS } from "../data/planets";

interface HudProps {
  readonly hasSelection: boolean;
  readonly onBack: () => void;
}

/**
 * Top brand pill + bottom counter. Hint copy matches the original three
 * states: pre-click on desktop ("Clica num planeta"), pre-tap on touch
 * ("Toca num planeta"), or post-selection ("Clica noutro planeta para
 * explorar").
 *
 * The brand pill doubles as a back-to-portal CTA — clicking it returns the
 * user to the intro overlay (and stops the sound cues).
 */
export function Hud({ hasSelection, onBack }: HudProps): JSX.Element {
  const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const hint = hasSelection
    ? "Clica noutro planeta para explorar"
    : isTouch
      ? "Toca num planeta"
      : "Clica num planeta";

  return (
    <div className="hud">
      <div className="hud__header">
        <button
          type="button"
          className="hud__brand hud__brand--button"
          onClick={onBack}
          aria-label="Voltar ao portal"
          title="Voltar ao portal"
        >
          <span className="hud__back-icon" aria-hidden="true">
            ←
          </span>
          <span className="hud__brand-dot" aria-hidden="true" />
          <span>Prof. Ricardo · Universo</span>
        </button>
        <div className="hud__hint">{hint}</div>
      </div>
      <div className="hud__footer">
        <div className="hud__counter">{PLANETS.length} jogos · explora o universo</div>
      </div>
    </div>
  );
}
