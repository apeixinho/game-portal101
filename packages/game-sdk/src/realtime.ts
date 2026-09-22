import { createHttpBackend, PollingTransport } from "./polling-transport";
import type { GameEvent, PlayerIdentity, PollingBackend, RealtimeTransport, TransportStatus, Unsub } from "./types";
import { WsTransport } from "./ws-transport";

interface CreateTransportOptions {
  /** ws relay base URL (Option B). When omitted, the transport is polling-only. */
  readonly relayUrl?: string;
  /**
   * Polling fallback (Option A). Provide either a ready `backend` or an HTTP
   * `pollBaseUrl` (the relay's REST root) — at least one of relayUrl/poll must
   * be set. Always provided in practice so the game survives a relay outage.
   */
  readonly pollBaseUrl?: string;
  readonly pollBackend?: PollingBackend;
  readonly pollIntervalMs?: number;
}

/**
 * Composite transport: prefers the ws relay and silently fails over to polling
 * if the relay can't be reached or drops for too long (plan §7.4 task 8). Games
 * only ever see the `RealtimeTransport` interface.
 */
class FallbackTransport implements RealtimeTransport {
  private active: RealtimeTransport | null = null;
  private code = "";
  private identity: PlayerIdentity | null = null;
  private readonly listeners = new Set<(event: GameEvent) => void>();
  private readonly subs: Unsub[] = [];

  constructor(private readonly options: CreateTransportOptions) {
    if (!options.relayUrl && !options.pollBaseUrl && !options.pollBackend) {
      throw new Error("createTransport requires relayUrl and/or a polling backend");
    }
  }

  private bind(transport: RealtimeTransport): void {
    this.subs.push(transport.onEvent((event) => {
      for (const cb of this.listeners) cb(event);
    }));
    this.active = transport;
  }

  private makePolling(): PollingTransport | null {
    const backend = this.options.pollBackend
      ?? (this.options.pollBaseUrl ? createHttpBackend(this.options.pollBaseUrl) : null);
    if (!backend) return null;
    return new PollingTransport({ backend, intervalMs: this.options.pollIntervalMs });
  }

  private async fallToPolling(): Promise<void> {
    const polling = this.makePolling();
    if (!polling) return;
    while (this.subs.length) this.subs.pop()?.();
    this.bind(polling);
    await polling.join(this.code, this.identity!);
  }

  async join(code: string, identity: PlayerIdentity): Promise<void> {
    this.code = code;
    this.identity = identity;

    if (this.options.relayUrl) {
      const ws = new WsTransport({ relayUrl: this.options.relayUrl });
      ws.setGiveUpHandler(() => void this.fallToPolling());
      try {
        this.bind(ws);
        await ws.join(code, identity);
        return;
      } catch {
        while (this.subs.length) this.subs.pop()?.();
        this.active = null;
      }
    }

    const polling = this.makePolling();
    if (!polling) throw new Error("relay unreachable and no polling fallback configured");
    this.bind(polling);
    await polling.join(code, identity);
  }

  send(event: GameEvent): void {
    this.active?.send(event);
  }

  onEvent(cb: (event: GameEvent) => void): Unsub {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  status(): TransportStatus {
    return this.active?.status() ?? "idle";
  }

  leave(): void {
    this.active?.leave();
    while (this.subs.length) this.subs.pop()?.();
    this.listeners.clear();
  }
}

export function createTransport(options: CreateTransportOptions): RealtimeTransport {
  return new FallbackTransport(options);
}
