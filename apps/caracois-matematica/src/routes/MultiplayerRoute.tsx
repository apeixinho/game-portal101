import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { resolveHubUrl } from "@portal/ui";
import { Numpad } from "../components/Numpad";
import { TimerBar } from "../components/TimerBar";
import {
  DIFFICULTIES,
  makeQuestion,
  type Difficulty,
  type DifficultyKey,
  type Question,
} from "../game/questions";
import { SnailRace, type Racer } from "../three/SnailRace";

const TARGET = 6; // correct answers needed to reach the finish line
const FEEDBACK_MS = 750;

const PALETTE = [
  { color: "#6ed75a", name: "Verde" },
  { color: "#ff7a2b", name: "Laranja" },
  { color: "#a56bff", name: "Roxo" },
  { color: "#22d3ee", name: "Azul" },
] as const;

interface Player {
  readonly name: string;
  readonly color: string;
  correct: number;
}

type Phase = "setup" | "handoff" | "playing" | "done";
type Feedback = "idle" | "right" | "wrong";

interface MultiplayerRouteProps {
  readonly onBackToMenu?: () => void;
}

export function MultiplayerRoute({ onBackToMenu }: MultiplayerRouteProps): JSX.Element {
  const [phase, setPhase] = useState<Phase>("setup");
  const [numPlayers, setNumPlayers] = useState(2);
  const [players, setPlayers] = useState<Player[]>([]);
  const [turn, setTurn] = useState(0);
  const [question, setQuestion] = useState<Question>({ text: "", answer: 0 });
  const [questionId, setQuestionId] = useState(0);
  const [value, setValue] = useState("");
  const [fraction, setFraction] = useState(1);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [winner, setWinner] = useState<Player | null>(null);

  const difficultyRef = useRef<Difficulty>(DIFFICULTIES.facil);
  const playersRef = useRef<Player[]>([]);
  const turnRef = useRef(0);
  const lockedRef = useRef(false);

  const racers: Racer[] = players.map((p, i) => ({
    id: String(i),
    progress: p.correct / TARGET,
    hop: p.correct,
    color: p.color,
    z: players.length === 1 ? 0 : -1.1 + (i * 2.2) / (players.length - 1),
  }));

  const startMatch = useCallback((key: DifficultyKey) => {
    difficultyRef.current = DIFFICULTIES[key];
    const list: Player[] = Array.from({ length: numPlayers }, (_, i) => ({
      name: `Jogador ${i + 1}`,
      color: PALETTE[i].color,
      correct: 0,
    }));
    playersRef.current = list;
    turnRef.current = 0;
    setPlayers(list.map((p) => ({ ...p })));
    setTurn(0);
    setWinner(null);
    setPhase("handoff");
  }, [numPlayers]);

  const beginTurn = useCallback(() => {
    lockedRef.current = false;
    setValue("");
    setFeedback("idle");
    setQuestion(makeQuestion(difficultyRef.current));
    setQuestionId((id) => id + 1);
    setPhase("playing");
  }, []);

  const afterResolve = useCallback(() => {
    const current = playersRef.current[turnRef.current];
    if (current.correct >= TARGET) {
      setWinner(current);
      setPhase("done");
      return;
    }
    turnRef.current = (turnRef.current + 1) % playersRef.current.length;
    setTurn(turnRef.current);
    setPhase("handoff");
  }, []);

  const resolve = useCallback(
    (isCorrect: boolean) => {
      if (lockedRef.current) return;
      lockedRef.current = true;

      if (isCorrect) {
        playersRef.current[turnRef.current].correct += 1;
        setPlayers(playersRef.current.map((p) => ({ ...p })));
        setFeedback("right");
      } else {
        setFeedback("wrong");
      }
      window.setTimeout(afterResolve, FEEDBACK_MS);
    },
    [afterResolve],
  );

  // Per-turn countdown.
  useEffect(() => {
    if (phase !== "playing") return;
    const total = difficultyRef.current.seconds * 1000;
    const deadline = Date.now() + total;
    setFraction(1);
    const interval = window.setInterval(() => {
      const left = deadline - Date.now();
      if (left <= 0) {
        window.clearInterval(interval);
        setFraction(0);
        resolve(false);
      } else {
        setFraction(left / total);
      }
    }, 80);
    return () => window.clearInterval(interval);
  }, [questionId, phase, resolve]);

  const handleInput = useCallback((digit: string) => {
    setValue((v) => (v.length >= 4 ? v : v + digit));
  }, []);
  const handleClear = useCallback(() => setValue(""), []);
  const handleSubmit = useCallback(() => {
    if (value === "" || lockedRef.current) return;
    resolve(Number(value) === question.answer);
  }, [value, question.answer, resolve]);

  const current = players[turn];

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Suspense fallback={<div className="absolute inset-0 bg-[#bfe8ff]" />}>
        <SnailRace racers={racers.length ? racers : [{ id: "0", progress: 0, hop: 0, color: "#6ed75a", z: 0 }]} />
      </Suspense>

      {/* Standings HUD */}
      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-5">
        <a
          href={resolveHubUrl()}
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm font-semibold text-festa-cream backdrop-blur transition hover:bg-black/50"
        >
          <span aria-hidden="true">←</span> Voltar
        </a>
        {phase !== "setup" && (
          <div className="flex flex-col items-end gap-1 rounded-2xl bg-black/30 p-2 backdrop-blur">
            {players.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-festa-cream">
                <span className="h-3 w-3 rounded-full" style={{ background: p.color }} />
                {p.name}
                <span className="font-display text-festa-yellow">{p.correct}/{TARGET}</span>
              </div>
            ))}
          </div>
        )}
      </header>

      {phase === "setup" && (
        <Overlay>
          <p className="font-display text-3xl text-festa-yellow">Multijogador local</p>
          <p className="mt-2 text-festa-cream/85">Joguem à vez no mesmo ecrã. Quantos caracóis vão correr?</p>

          <div className="mt-5 flex justify-center gap-2">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNumPlayers(n)}
                className={[
                  "h-12 w-12 rounded-2xl font-display text-xl transition",
                  numPlayers === n ? "bg-leaf text-leaf-deep" : "bg-white/10 text-festa-cream hover:bg-white/20",
                ].join(" ")}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="mt-3 flex justify-center gap-2">
            {Array.from({ length: numPlayers }, (_, i) => (
              <span key={i} className="flex items-center gap-1 text-xs text-festa-cream/80">
                <span className="h-3 w-3 rounded-full" style={{ background: PALETTE[i].color }} />
                {PALETTE[i].name}
              </span>
            ))}
          </div>

          <p className="mt-5 text-sm text-festa-cream/70">Escolhe a dificuldade para começar:</p>
          <div className="mt-2 grid gap-2.5">
            {Object.values(DIFFICULTIES).map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => startMatch(d.key)}
                className="rounded-2xl bg-white/10 p-3 text-left font-extrabold text-festa-cream transition hover:bg-white/20"
              >
                {d.label}
                <span className="block text-sm font-medium text-festa-cream/70">{d.description}</span>
              </button>
            ))}
          </div>
          {onBackToMenu && (
            <button type="button" onClick={onBackToMenu} className="mt-4 text-sm text-festa-cream/70 underline-offset-4 hover:underline">
              ← Voltar aos modos
            </button>
          )}
        </Overlay>
      )}

      {phase === "handoff" && current && (
        <Overlay>
          <span className="mx-auto mb-2 h-10 w-10 rounded-full" style={{ background: current.color }} />
          <p className="font-display text-3xl text-festa-yellow">Próximo: {current.name}</p>
          <p className="mt-2 text-festa-cream/85">Passa o dispositivo a {current.name} e toca em começar.</p>
          <button
            type="button"
            onClick={beginTurn}
            className="mt-6 w-full rounded-2xl bg-leaf py-3 font-extrabold uppercase tracking-wide text-leaf-deep transition hover:brightness-110"
          >
            Começar a minha vez ▶
          </button>
        </Overlay>
      )}

      {phase === "playing" && current && (
        <div className="absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md p-4 pb-6">
          <motion.div
            key={questionId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/15 bg-leaf-deep/80 p-4 shadow-2xl backdrop-blur"
            style={{ borderColor: current.color }}
          >
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-festa-cream">
                <span className="h-3 w-3 rounded-full" style={{ background: current.color }} />
                {current.name}
              </span>
              <span className="text-2xl" aria-live="polite">
                {feedback === "right" ? "✅" : feedback === "wrong" ? "❌" : ""}
              </span>
            </div>
            <div className="mb-3 text-center">
              <span className="font-display text-3xl text-festa-cream">{question.text} = ?</span>
            </div>
            <div className="mb-3">
              <TimerBar fraction={fraction} />
            </div>
            <Numpad
              value={value}
              onInput={handleInput}
              onClear={handleClear}
              onSubmit={handleSubmit}
              disabled={feedback !== "idle"}
            />
          </motion.div>
        </div>
      )}

      {phase === "done" && winner && (
        <Overlay>
          <span className="mx-auto mb-2 h-12 w-12 rounded-full" style={{ background: winner.color }} />
          <p className="font-display text-3xl text-festa-yellow">🏁 {winner.name} venceu!</p>
          <p className="mt-2 text-festa-cream/85">Chegou primeiro à meta. Parabéns!</p>
          <ul className="mt-4 space-y-1 text-left">
            {[...players]
              .sort((a, b) => b.correct - a.correct)
              .map((p, i) => (
                <li key={i} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-festa-cream">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: p.color }} />
                    {p.name}
                  </span>
                  <span className="font-display text-festa-yellow">{p.correct}/{TARGET}</span>
                </li>
              ))}
          </ul>
          <button
            type="button"
            onClick={() => setPhase("setup")}
            className="mt-6 w-full rounded-2xl bg-leaf py-3 font-extrabold uppercase tracking-wide text-leaf-deep transition hover:brightness-110"
          >
            Jogar outra vez ↻
          </button>
        </Overlay>
      )}
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-leaf-deep/70 p-5 backdrop-blur">
      <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-leaf-deep/90 p-7 text-center shadow-2xl">
        {children}
      </div>
    </div>
  );
}
