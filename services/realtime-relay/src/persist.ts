/**
 * Optional authoritative persistence for room events.
 *
 * The relay fans out in-memory for low latency. A future online mode may mirror
 * events to an external store; until then this is a no-op.
 */

export interface Persister {
  record(code: string, data: unknown): void;
}

/** Default no-op persister — safe for local and Render free-tier deploys. */
export const noopPersister: Persister = {
  record() {
    // intentionally empty
  },
};

/** Factory kept for callers that want an explicit persister instance. */
export function createPersister(): Persister {
  return noopPersister;
}
