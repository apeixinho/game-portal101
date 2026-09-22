import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Hud } from "../components/Hud";
import { Numpad } from "../components/Numpad";
import { Results } from "../components/Results";
import { TimerBar } from "../components/TimerBar";
import {
  DIFFICULTIES,
  ROUNDS,
  makeQuestion,
  type Difficulty,
  type DifficultyKey,
  type Question,
} from "../game/questions";
import { SnailRace } from "../three/SnailRace";

const MAX_ATTEMPTS = ROUNDS + 4; // up to 4 misses before the race ends
const FEEDBACK_MS = 750;
const BEST_KEY = "caracois-matematica:best-seconds";

type Phase = "choose" | "playing" | "done";
type Feedback = "idle" | "right" | "wrong";

interface FinalResult {
  readonly correct: number;
  readonly seconds: number;
}

interface GameRouteProps {
  readonly onBackToMenu?: () => void;
}

export function GameRoute({ onBackToMenu }: GameRouteProps): JSX.Element {
  const [phase, setPhase] = useState<Phase>("choose");
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTIES.facil);
  const [question, setQuestion] = useState<Question>({ text: "", answer: 0 });
  const [questionId, setQuestionId] = useState(0);
  const [value, setValue] = useState("");
  const [correct, setCorrect] = useState(0);
  const [hop, setHop] = useState(0);
  const [fraction, setFraction] = useState(1);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [result, setResult] = useState<FinalResult | null>(null);
  const [best, setBest] = useState<number | null>(null);

  // Refs hold the authoritative game logic values so the timer interval and
  // delayed advance never read stale React state.
  const difficultyRef = useRef<Difficulty>(difficulty);
  const correctRef = useRef(0);
  const attemptsRef = useRef(0);
  const lockedRef = useRef(false);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const stored = localStorage.getItem(BEST_KEY);
    if (stored) setBest(Number(stored));
  }, []);

  const newQuestion = useCallback(() => {
    lockedRef.current = false;
    setValue("");
    setFeedback("idle");
    setQuestion(makeQuestion(difficultyRef.current));
    setQuestionId((id) => id + 1);
  }, []);

  const finish = useCallback(() => {
    const seconds = (Date.now() - startTimeRef.current) / 1000;
    const won = correctRef.current >= ROUNDS;
    setResult({ correct: correctRef.current, seconds });
    setPhase("done");

    if (won) {
      const prev = localStorage.getItem(BEST_KEY);
      const prevNum = prev ? Number(prev) : Infinity;
      if (seconds < prevNum) {
        localStorage.setItem(BEST_KEY, seconds.toFixed(1));
        setBest(seconds);
      }
    }
  }, []);

  const advance = useCallback(() => {
    if (correctRef.current >= ROUNDS || attemptsRef.current >= MAX_ATTEMPTS) {
      finish();
    } else {
      newQuestion();
    }
  }, [finish, newQuestion]);

  const resolve = useCallback(
    (isCorrect: boolean) => {
      if (lockedRef.current) return;
      lockedRef.current = true;

      attemptsRef.current += 1;
      if (isCorrect) {
        correctRef.current += 1;
        setCorrect(correctRef.current);
        setHop((h) => h + 1);
        setFeedback("right");
      } else {
        setFeedback("wrong");
      }
      window.setTimeout(advance, FEEDBACK_MS);
    },
    [advance],
  );

  // Per-question countdown. Re-armed whenever a new question is shown.
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

  const start = useCallback(
    (key: DifficultyKey) => {
      const diff = DIFFICULTIES[key];
      difficultyRef.current = diff;
      correctRef.current = 0;
      attemptsRef.current = 0;
      startTimeRef.current = Date.now();
      setDifficulty(diff);
      setCorrect(0);
      setHop(0);
      setResult(null);
      setPhase("playing");
      newQuestion();
    },
    [newQuestion],
  );

  const handleInput = useCallback((digit: string) => {
    setValue((v) => (v.length >= 4 ? v : v + digit));
  }, []);
  const handleClear = useCallback(() => setValue(""), []);
  const handleSubmit = useCallback(() => {
    if (value === "" || lockedRef.current) return;
    resolve(Number(value) === question.answer);
  }, [value, question.answer, resolve]);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Suspense fallback={<div className="absolute inset-0 bg-[#bfe8ff]" />}>
        <SnailRace racers={[{ id: "me", progress: correct / ROUNDS, hop, color: "#6ed75a", z: 0 }]} />
      </Suspense>

      <Hud round={Math.min(correct + 1, ROUNDS)} correct={correct} />

      {phase === "choose" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-leaf-deep/70 p-5 backdrop-blur">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-leaf-deep/90 p-7 text-center shadow-2xl">
            <p className="font-display text-3xl text-festa-yellow">Caracóis da Matemática</p>
            <p className="mt-2 text-festa-cream/85">
              Responde a {ROUNDS} contas certas para o teu caracol chegar à meta. Escolhe a dificuldade!
            </p>
            <div className="mt-6 grid gap-2.5">
              {Object.values(DIFFICULTIES).map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => start(d.key)}
                  className="rounded-2xl bg-white/10 p-4 text-left font-extrabold text-festa-cream transition hover:bg-white/20"
                >
                  {d.label}
                  <span className="block text-sm font-medium text-festa-cream/70">{d.description}</span>
                </button>
              ))}
            </div>
            {onBackToMenu && (
              <button
                type="button"
                onClick={onBackToMenu}
                className="mt-4 text-sm text-festa-cream/70 underline-offset-4 hover:underline"
              >
                ← Voltar aos modos
              </button>
            )}
          </div>
        </div>
      )}

      {phase === "playing" && (
        <div className="absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md p-4 pb-6">
          <motion.div
            key={questionId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/15 bg-leaf-deep/80 p-4 shadow-2xl backdrop-blur"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-3xl text-festa-cream">{question.text} = ?</span>
              <span
                className={[
                  "text-2xl transition",
                  feedback === "right" ? "opacity-100" : feedback === "wrong" ? "opacity-100" : "opacity-0",
                ].join(" ")}
                aria-live="polite"
              >
                {feedback === "right" ? "✅" : feedback === "wrong" ? "❌" : ""}
              </span>
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

      {phase === "done" && result && (
        <Results
          correct={result.correct}
          total={ROUNDS}
          seconds={result.seconds}
          best={best}
          onReplay={() => setPhase("choose")}
        />
      )}
    </div>
  );
}
