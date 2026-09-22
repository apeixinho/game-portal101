import { motion } from "framer-motion";

interface ResultsProps {
  readonly correct: number;
  readonly total: number;
  readonly seconds: number;
  readonly best: number | null;
  readonly onReplay: () => void;
}

/** End-of-race summary with accuracy, elapsed time, best record and replay. */
export function Results({ correct, total, seconds, best, onReplay }: ResultsProps): JSX.Element {
  const finished = correct >= total;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-leaf-deep/70 p-5 backdrop-blur"
    >
      <motion.div
        initial={{ scale: 0.92, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl border border-white/15 bg-leaf-deep/90 p-7 text-center shadow-2xl"
      >
        <p className="font-display text-3xl text-festa-yellow">
          {finished ? "🏁 Chegaste à meta!" : "Fim da corrida"}
        </p>
        <p className="mt-2 text-festa-cream/85">
          {finished
            ? "Parabéns! O teu caracol completou o percurso."
            : "O tempo acabou — o caracol não chegou à meta desta vez."}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-2xl bg-white/5 p-3">
            <dt className="text-xs uppercase tracking-wide text-festa-cream/60">Acertos</dt>
            <dd className="font-display text-2xl text-festa-cream">{correct}/{total}</dd>
          </div>
          <div className="rounded-2xl bg-white/5 p-3">
            <dt className="text-xs uppercase tracking-wide text-festa-cream/60">Tempo</dt>
            <dd className="font-display text-2xl text-festa-cream">{seconds.toFixed(1)}s</dd>
          </div>
        </dl>

        {best !== null && (
          <p className="mt-4 text-sm text-festa-cream/75">
            Melhor tempo (corrida completa): <strong>{best.toFixed(1)}s</strong>
          </p>
        )}

        <button
          type="button"
          onClick={onReplay}
          className="mt-6 w-full rounded-2xl bg-leaf py-3 font-extrabold uppercase tracking-wide text-leaf-deep transition hover:brightness-110"
        >
          Jogar outra vez ↻
        </button>
      </motion.div>
    </motion.div>
  );
}
