/**
 * Shared realtime types for any future online/multiplayer mode. Both the `ws`
 * relay transport and the Datastore polling transport speak this same event
 * vocabulary, so games stay transport agnostic (plan §7.4, Appendix A.3).
 */

export interface PlayerIdentity {
  readonly id: string;
  readonly name: string;
  /** Hex colour used to distinguish the player in 3D. */
  readonly color?: string;
}

/** Events exchanged between peers in a room. */
export type GameEvent =
  | { readonly type: "join"; readonly player: PlayerIdentity; readonly t: number }
  | { readonly type: "leave"; readonly playerId: string; readonly t: number }
  | {
      readonly type: "move";
      readonly playerId: string;
      readonly x: number;
      readonly y: number;
      readonly z: number;
      readonly t: number;
    }
  | {
      readonly type: "answer";
      readonly playerId: string;
      readonly questionId: string;
      readonly choice: number;
      readonly t: number;
    }
  | { readonly type: "score"; readonly playerId: string; readonly delta: number; readonly total: number; readonly t: number }
  | { readonly type: "state"; readonly state: unknown; readonly t: number };

export type Unsub = () => void;

export type TransportStatus = "idle" | "connecting" | "open" | "polling" | "closed";

/**
 * A bidirectional channel scoped to a single room. Implementations: `WsTransport`
 * (low latency via the relay) and `PollingTransport` (Datastore/HTTP fallback).
 */
export interface RealtimeTransport {
  join(code: string, identity: PlayerIdentity): Promise<void>;
  send(event: GameEvent): void;
  onEvent(cb: (event: GameEvent) => void): Unsub;
  status(): TransportStatus;
  leave(): void;
}

/**
 * Backend the polling transport reads/writes through. In production this is
 * backed by Juno Datastore (`setDoc` / `listDocs`); locally it targets the
 * relay's REST endpoints so the same fallback path is exercisable without Juno.
 */
export interface PollingBackend {
  append(code: string, event: GameEvent): Promise<void>;
  /** Return events with a sequence greater than `since`, plus the new cursor. */
  poll(code: string, since: number): Promise<{ events: GameEvent[]; cursor: number }>;
}
