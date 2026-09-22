import { useState } from "react";
import { resolveHubUrl } from "@portal/ui";
import { GameRoute } from "./GameRoute";
import { MultiplayerRoute } from "./MultiplayerRoute";

type Mode = "menu" | "solo" | "multi";

/**
 * Entry screen for the Caracóis race: pick solo or local pass-and-play
 * multiplayer. Mode is held in local state (no extra routing) so each mode can
 * offer a "back to modes" affordance.
 */
export function HomeRoute(): JSX.Element {
  const [mode, setMode] = useState<Mode>("menu");

  if (mode === "solo") return <GameRoute onBackToMenu={() => setMode("menu")} />;
  if (mode === "multi") return <MultiplayerRoute onBackToMenu={() => setMode("menu")} />;

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#bfe8ff] via-leaf-deep to-[#0f2a14] p-5">
      <a
        href={resolveHubUrl()}
        className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm font-semibold text-festa-cream backdrop-blur transition hover:bg-black/50"
      >
        <span aria-hidden="true">←</span> Voltar
      </a>

      <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-leaf-deep/85 p-7 text-center shadow-2xl backdrop-blur">
        <p className="text-5xl" aria-hidden="true">🐌</p>
        <h1 className="mt-2 font-display text-4xl text-festa-yellow">Caracóis da Matemática</h1>
        <p className="mt-2 text-festa-cream/85">Responde certo e faz o teu caracol deslizar até à meta.</p>

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={() => setMode("solo")}
            className="rounded-2xl bg-leaf py-4 font-display text-xl text-leaf-deep transition hover:brightness-110"
          >
            🏁 Solo
            <span className="block text-sm font-sans font-medium text-leaf-deep/80">Corre contra o relógio</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("multi")}
            className="rounded-2xl bg-white/10 py-4 font-display text-xl text-festa-cream transition hover:bg-white/20"
          >
            👥 Multijogador local
            <span className="block text-sm font-sans font-medium text-festa-cream/75">2 a 4 jogadores, à vez</span>
          </button>
        </div>
      </div>
    </div>
  );
}
