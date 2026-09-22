import type { GameEvent, PlayerIdentity, PollingBackend, RealtimeTransport, TransportStatus, Unsub } from "./types";

/**
 * HTTP polling backend that targets the relay's REST endpoints. The same
 * append/poll shape maps onto Juno Datastore (`setDoc` into `rooms_events` and
 * `listDocs` ordered by created_at) — see `createDatastoreBackend` for the
 * production adapter.
 */
export function createHttpBackend(baseUrl: string): PollingBackend {
  const root = baseUrl.replace(/\/$/, "");
  return {
    async append(code, event) {
      await fetch(`${root}/rooms/${encodeURIComponent(code)}/events`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(event),
      });
    },
    async poll(code, since) {
      const res = await fetch(`${root}/rooms/${encodeURIComponent(code)}/events?since=${since}`);
      if (!res.ok) throw new Error(`poll failed: ${res.status}`);
      return (await res.json()) as { events: GameEvent[]; cursor: number };
    },
  };
}

interface PollingTransportOptions {
  readonly backend: PollingBackend;
  /** Poll cadence in ms (plan §7.2 suggests 200–500 ms). */
  readonly intervalMs?: number;
}

/**
 * Fully-on-Juno fallback transport. Higher latency than the relay but requires
 * no always-on server. Appends outbound events to the backend and polls for new
 * ones, dispatching anything past the local cursor.
 */
export class PollingTransport implements RealtimeTransport {
  private readonly backend: PollingBackend;
  private readonly intervalMs: number;
  private code = "";
  private identity: PlayerIdentity | null = null;
  private cursor = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private polling = false;
  private state: TransportStatus = "idle";
  private readonly listeners = new Set<(event: GameEvent) => void>();

  constructor(options: PollingTransportOptions) {
    this.backend = options.backend;
    this.intervalMs = options.intervalMs ?? 400;
  }

  async join(code: string, identity: PlayerIdentity): Promise<void> {
    this.code = code;
    this.identity = identity;
    this.state = "polling";
    await this.backend.append(code, { type: "join", player: identity, t: Date.now() });
    this.timer = setInterval(() => void this.tick(), this.intervalMs);
    await this.tick();
  }

  private async tick(): Promise<void> {
    if (this.polling) return;
    this.polling = true;
    try {
      const { events, cursor } = await this.backend.poll(this.code, this.cursor);
      this.cursor = cursor;
      for (const event of events) {
        for (const cb of this.listeners) cb(event);
      }
    } catch {
      // Transient network error; next tick retries.
    } finally {
      this.polling = false;
    }
  }

  send(event: GameEvent): void {
    void this.backend.append(this.code, event);
  }

  onEvent(cb: (event: GameEvent) => void): Unsub {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  status(): TransportStatus {
    return this.state;
  }

  leave(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.identity) this.send({ type: "leave", playerId: this.identity.id, t: Date.now() });
    this.state = "closed";
  }
}
