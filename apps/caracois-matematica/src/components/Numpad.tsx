import { useEffect } from "react";

interface NumpadProps {
  readonly value: string;
  readonly onInput: (digit: string) => void;
  readonly onClear: () => void;
  readonly onSubmit: () => void;
  readonly disabled: boolean;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "OK"] as const;

/**
 * Large-touch-target numpad (each key ≥ 44px) with physical-keyboard support
 * for desktop play (digits, Backspace/Delete, Enter).
 */
export function Numpad({ value, onInput, onClear, onSubmit, disabled }: NumpadProps): JSX.Element {
  useEffect(() => {
    if (disabled) return;
    function handle(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") onInput(e.key);
      else if (e.key === "Backspace" || e.key === "Delete") onClear();
      else if (e.key === "Enter") onSubmit();
    }
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [disabled, onInput, onClear, onSubmit]);

  return (
    <div className="w-full">
      <div
        className="mb-3 flex h-14 items-center justify-end rounded-2xl border border-white/15 bg-black/30 px-5 font-display text-3xl text-festa-yellow tabular-nums"
        aria-live="polite"
      >
        {value || "0"}
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {KEYS.map((key) => {
          const isOk = key === "OK";
          const isClear = key === "C";
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (isOk) onSubmit();
                else if (isClear) onClear();
                else onInput(key);
              }}
              className={[
                "h-14 min-h-[44px] rounded-2xl text-2xl font-extrabold transition active:scale-95 disabled:opacity-40",
                isOk
                  ? "bg-leaf text-leaf-deep hover:brightness-110"
                  : isClear
                    ? "bg-white/10 text-festa-cream hover:bg-white/20"
                    : "bg-white/10 text-festa-cream hover:bg-white/20",
              ].join(" ")}
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
