import type { GameEvent, PlayerIdentity, RealtimeTransport, TransportStatus, Unsub } from "./types";

interface WsTransportOptions {
  /** Base ws/wss URL of the relay, e.g. `ws://localhost:8787`. */
  readonly relayUrl: string;
  /** Max reconnection attempts before giving up (and letting a fallback take over). */
  readonly maxRetries?: number;
}

/**
 * Low-latency transport over the Node `ws` relay. Reconnects with exponential
 * backoff; queues outbound events while the socket is (re)connecting. Emits an
 * `onClose` so a composite transport can fail over to polling.
 */
export class WsTransport implements RealtimeTransport {
  private readonly relayUrl: string;
  private readonly maxRetries: number;
  private socket: WebSocket | null = null;
  private code = "";
  private identity: PlayerIdentity | null = null;
  private readonly listeners = new Set<(event: GameEvent) => void>();
  private readonly outbox: GameEvent[] = [];
  private state: TransportStatus = "idle";
  private retries = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private closedByUser = false;
  private onGiveUp: (() => void) | null = null;

  constructor(options: WsTransportOptions) {
    this.relayUrl = options.relayUrl.replace(/\/$/, "");
    this.maxRetries = options.maxRetries ?? 5;
  }

  /** Register a callback invoked when reconnection is permanently abandoned. */
  setGiveUpHandler(handler: () => void): void {
    this.onGiveUp = handler;
  }

  join(code: string, identity: PlayerIdentity): Promise<void> {
    this.code = code;
    this.identity = identity;
    this.closedByUser = false;
    return this.connect();
  }

  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.state = "connecting";
      const url = `${this.relayUrl}/rooms/${encodeURIComponent(this.code)}/ws?id=${encodeURIComponent(this.identity!.id)}`;
      let settled = false;
      const socket = new WebSocket(url);
      this.socket = socket;

      socket.onopen = () => {
        this.state = "open";
        this.retries = 0;
        this.send({ type: "join", player: this.identity!, t: Date.now() });
        this.flush();
        if (!settled) {
          settled = true;
          resolve();
        }
      };

      socket.onmessage = (ev: MessageEvent) => {
        let parsed: GameEvent;
        try {
          parsed = JSON.parse(typeof ev.data === "string" ? ev.data : "") as GameEvent;
        } catch {
          return;
        }
        for (const cb of this.listeners) cb(parsed);
      };

      socket.onclose = () => {
        if (this.closedByUser) {
          this.state = "closed";
          return;
        }
        if (this.retries >= this.maxRetries) {
          this.state = "closed";
          this.onGiveUp?.();
          if (!settled) {
            settled = true;
            reject(new Error("ws relay unreachable"));
          }
          return;
        }
        const delay = Math.min(8000, 250 * 2 ** this.retries);
        this.retries += 1;
        this.reconnectTimer = setTimeout(() => void this.connect().catch(() => undefined), delay);
        if (!settled) {
          settled = true;
          // First connect failed but we will retry; surface the failure so a
          // composite transport can decide whether to fall back immediately.
          reject(new Error("ws relay connect failed"));
        }
      };

      socket.onerror = () => socket.close();
    });
  }

  private flush(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    while (this.outbox.length > 0) {
      this.socket.send(JSON.stringify(this.outbox.shift()));
    }
  }

  send(event: GameEvent): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(event));
    } else {
      this.outbox.push(event);
    }
  }

  onEvent(cb: (event: GameEvent) => void): Unsub {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  status(): TransportStatus {
    return this.state;
  }

  leave(): void {
    this.closedByUser = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.identity) this.send({ type: "leave", playerId: this.identity.id, t: Date.now() });
    this.socket?.close();
    this.state = "closed";
  }
}
