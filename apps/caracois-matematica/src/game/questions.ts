/**
 * Question generation for the Caracóis da Matemática solo race.
 *
 * The player types answers on the numpad; each correct answer advances the
 * snail one segment. Difficulty controls the operand ranges, the operators in
 * play, and the per-round time budget.
 */

export type DifficultyKey = "facil" | "medio" | "dificil";

export interface Difficulty {
  readonly key: DifficultyKey;
  readonly label: string;
  readonly description: string;
  /** Seconds allowed per question. */
  readonly seconds: number;
  readonly operators: readonly Operator[];
  readonly max: number;
}

type Operator = "+" | "-" | "×" | "÷";

export interface Question {
  readonly text: string;
  readonly answer: number;
}

/** Number of correct answers needed to reach the finish line. */
export const ROUNDS = 5;

export const DIFFICULTIES: Readonly<Record<DifficultyKey, Difficulty>> = {
  facil: {
    key: "facil",
    label: "Fácil",
    description: "Somas e subtrações até 20",
    seconds: 12,
    operators: ["+", "-"],
    max: 20,
  },
  medio: {
    key: "medio",
    label: "Médio",
    description: "Cálculos até 50 e tabuada",
    seconds: 10,
    operators: ["+", "-", "×"],
    max: 50,
  },
  dificil: {
    key: "dificil",
    label: "Difícil",
    description: "Até 100 com × e ÷",
    seconds: 8,
    operators: ["+", "-", "×", "÷"],
    max: 100,
  },
};

function rnd(n: number): number {
  return Math.floor(Math.random() * n);
}

export function makeQuestion(difficulty: Difficulty): Question {
  const op = difficulty.operators[rnd(difficulty.operators.length)];
  let a: number;
  let b: number;
  let answer: number;

  switch (op) {
    case "+":
      a = rnd(difficulty.max);
      b = rnd(difficulty.max);
      answer = a + b;
      break;
    case "-":
      a = rnd(difficulty.max);
      b = rnd(a + 1);
      answer = a - b;
      break;
    case "×": {
      const m = difficulty.max <= 20 ? 9 : 12;
      a = 1 + rnd(m);
      b = 1 + rnd(m);
      answer = a * b;
      break;
    }
    case "÷":
    default:
      b = 1 + rnd(9);
      answer = 1 + rnd(9);
      a = b * answer; // a ÷ b = answer, always whole
      break;
  }

  return { text: `${a} ${op} ${b}`, answer };
}
