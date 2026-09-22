import { motion } from "framer-motion";
import { GameLayout } from "@portal/ui";
import { GAMES } from "../data/games";

export function ArraialRoute(): JSX.Element {
  return (
    <GameLayout title="Arraial Digital" icon="🎪">
      <section className="w-full max-w-4xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-display text-4xl text-festa-yellow drop-shadow sm:text-6xl"
        >
          Bem-vindo ao Arraial Digital
        </motion.h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-festa-cream/80 sm:text-lg">
          Escolhe um jogo, ganha pontos e leva o teu melhor resultado para casa.
          Que comece a festa da literacia digital!
        </p>

        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {GAMES.map((game) => (
            <li key={game.id}>
              <motion.a
                href={game.href}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                className="flex h-full flex-col items-start gap-3 rounded-3xl border border-white/10 p-6 text-left shadow-xl transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60"
                style={{
                  background: `linear-gradient(145deg, ${game.from}, ${game.to})`,
                }}
              >
                <span className="text-4xl" aria-hidden="true">
                  {game.icon}
                </span>
                <span className="font-display text-2xl text-white">{game.title}</span>
                <span className="text-sm text-white/85">{game.tagline}</span>
                <span className="mt-auto pt-3 text-xs font-bold tracking-widest text-white/90 uppercase">
                  Jogar →
                </span>
              </motion.a>
            </li>
          ))}
        </ul>
      </section>
    </GameLayout>
  );
}
