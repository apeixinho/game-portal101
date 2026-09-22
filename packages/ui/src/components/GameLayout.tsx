import type { ReactNode } from "react";
import { resolveHubUrl } from "../links";

interface GameLayoutProps {
  /** Festa title shown in the header and footer (verbatim pt-PT game name). */
  readonly title: string;
  /** Emoji shown next to the title. */
  readonly icon: string;
  readonly children: ReactNode;
}

/**
 * Shared festive shell for the vanilla-HTML-game lobbies (Arraial Digital,
 * Arraial da Matemática). Styling relies on each app's Tailwind `@theme`
 * tokens (`--color-festa-cream`) and the `.bunting` class, so add a
 * `@source` directive for `packages/ui` in each consuming app's CSS.
 */
export function GameLayout({ title, icon, children }: GameLayoutProps): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="bunting h-3 w-full" aria-hidden="true" />

      <header className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <a
          href={resolveHubUrl()}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold tracking-wide text-festa-cream transition hover:border-white/40 hover:bg-white/10"
        >
          <span aria-hidden="true">←</span>
          Voltar ao portal
        </a>

        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">{icon}</span>
          <span className="font-display text-base tracking-wide text-festa-cream sm:text-lg">
            {title}
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-5 pb-16 pt-4 sm:px-8">
        {children}
      </main>

      <footer className="px-5 pb-6 text-center text-xs tracking-widest text-festa-cream/50 uppercase">
        {title} · Portal do Prof. Ricardo
      </footer>
    </div>
  );
}
