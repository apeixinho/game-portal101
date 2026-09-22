import { resolveHubUrl } from "@portal/ui";
import { ROUNDS } from "../game/questions";

interface HudProps {
  readonly round: number;
  readonly correct: number;
}

/** Top chrome: back-to-portal link, title, and round/progress pips. */
export function Hud({ round, correct }: HudProps): JSX.Element {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4 sm:p-5">
      <a
        href={resolveHubUrl()}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm font-semibold text-festa-cream backdrop-blur transition hover:bg-black/50"
      >
        <span aria-hidden="true">←</span>
        Voltar
      </a>

      <div className="flex flex-col items-end gap-1">
        <span className="font-display text-base tracking-wide text-festa-cream drop-shadow sm:text-lg">
          🐌 Caracóis da Matemática
        </span>
        <div className="flex items-center gap-1.5" aria-label={`Ronda ${round} de ${ROUNDS}`}>
          {Array.from({ length: ROUNDS }, (_, i) => (
            <span
              key={i}
              className={[
                "h-2.5 w-2.5 rounded-full border border-white/40",
                i < correct ? "bg-festa-yellow" : "bg-white/10",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
