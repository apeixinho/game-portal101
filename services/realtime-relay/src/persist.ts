/**
 * Authoritative persistence to Juno Datastore. The relay fans out in-memory for
 * low latency, and *also* mirrors each event into the Satellite so state
 * survives restarts and the polling fallback (which reads Datastore directly)
 * stays consistent (plan §7.4 task 4).
 *
 * Disabled by default — enable by setting JUNO_SATELLITE_ID + a server identity.
 */

export interface Persister {
  record(code: string, data: unknown): void;
}

/** No-op persister used until the Juno server identity is wired up. */
export const noopPersister: Persister = {
  record() {
    // intentionally empty
  },
};

/**
 * TODO(juno-uncertain): implement with `@junobuild/core` using a server-side
 * identity (set/listDocs into `rooms_events`). The exact server-auth flow for
 * a long-running Node process needs verification against @Juno docs before we
 * commit to it, so this stays a no-op until Phase 3's Juno wiring step.
 */
export function createJunoPersister(): Persister {
  return noopPersister;
}
