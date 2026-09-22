/** Shared scene geometry so the snail and the track agree on the finish line. */
export const TRACK_START_X = -5.2;
export const TRACK_FINISH_X = 5.2;

/** Maps race progress (0..1) to the snail's world X position. */
export function progressToX(progress: number): number {
  const clamped = Math.min(1, Math.max(0, progress));
  return TRACK_START_X + clamped * (TRACK_FINISH_X - TRACK_START_X);
}
