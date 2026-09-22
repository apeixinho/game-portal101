/**
 * Procedural Web Audio cue engine.
 *
 * No audio files — every sound is synthesised from oscillators, matching the
 * implementation plan's "Web Audio API with shared packages/audio-engine"
 * directive (§3). This is the Hub-local inlined version; when other apps need
 * sound it will be lifted into `packages/audio-engine`.
 *
 * TODO(phase-2): extract to `packages/audio-engine` and reuse from every app.
 *
 * The `AudioContext` is created lazily on first user gesture to satisfy
 * autoplay policies (Safari, iOS — risk R5 in the plan).
 */

import { useSyncExternalStore } from "react";

type CueKind = "atravessar" | "warp" | "hover" | "select" | "close";

const STORAGE_KEY = "portal-hub:muted";

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.18;
      masterGain.connect(ctx.destination);
    } catch {
      ctx = null;
    }
  }
  if (ctx?.state === "suspended") {
    void ctx.resume();
  }
  return ctx;
}

function readMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

let mutedState: boolean = readMuted();
const listeners = new Set<() => void>();

function notify(): void {
  for (const l of listeners) l();
}

export function isMuted(): boolean {
  return mutedState;
}

export function setMuted(next: boolean): void {
  if (mutedState === next) return;
  mutedState = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    // localStorage might be unavailable (private mode); cue state still works in-memory.
  }
  notify();
}

export function toggleMuted(): void {
  setMuted(!mutedState);
}

export function useMuted(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => mutedState,
    () => false,
  );
}

interface CueSpec {
  readonly startFreq: number;
  readonly endFreq: number;
  readonly duration: number;
  readonly type: OscillatorType;
  readonly peakGain: number;
}

const CUES: Readonly<Record<CueKind, CueSpec>> = {
  atravessar: { startFreq: 240, endFreq: 720, duration: 0.55, type: "sine", peakGain: 0.55 },
  warp: { startFreq: 80, endFreq: 1400, duration: 0.9, type: "sawtooth", peakGain: 0.35 },
  hover: { startFreq: 880, endFreq: 1320, duration: 0.08, type: "triangle", peakGain: 0.18 },
  select: { startFreq: 520, endFreq: 1040, duration: 0.18, type: "sine", peakGain: 0.4 },
  close: { startFreq: 740, endFreq: 320, duration: 0.18, type: "sine", peakGain: 0.3 },
};

export function playCue(kind: CueKind): void {
  if (mutedState) return;
  const c = getCtx();
  if (!c || !masterGain) return;

  const spec = CUES[kind];
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = spec.type;
  osc.frequency.setValueAtTime(spec.startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(spec.endFreq, 0.0001), now + spec.duration);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(spec.peakGain, now + Math.min(0.04, spec.duration * 0.25));
  gain.gain.exponentialRampToValueAtTime(0.0001, now + spec.duration);

  osc.connect(gain).connect(masterGain);
  osc.start(now);
  osc.stop(now + spec.duration + 0.02);
}

/** Call once on the first user gesture so subsequent cues never block on
 *  autoplay restrictions. Safe to invoke multiple times. */
export function primeAudio(): void {
  getCtx();
}
