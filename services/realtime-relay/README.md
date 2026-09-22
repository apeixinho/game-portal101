# realtime-relay

Stateless realtime fan-out — a **reusable foundation** for any future online/
multiplayer mode (the plan ships no multiplayer game itself). Implements
**Option B** from the implementation plan (§7.2): a small Node + `ws` relay for
low-latency peer fan-out, with an HTTP polling fallback that mirrors the on-Juno
**Option A** path.

The relay is **gameplay-agnostic** — it forwards opaque JSON event envelopes and
never needs to understand any game. Authoritative persistence to Juno Datastore
is stubbed in `persist.ts` (`TODO(juno-uncertain)`) until the Juno server
identity is wired up.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET`  | `/healthz` | Liveness probe (used by Fly/Render + Docker `HEALTHCHECK`). |
| `WS`   | `/rooms/:code/ws?id=<playerId>` | Low-latency duplex channel; broadcasts to peers in the room. |
| `POST` | `/rooms/:code/events` | Polling fallback: append an event. |
| `GET`  | `/rooms/:code/events?since=<cursor>` | Polling fallback: fetch events after a cursor. |

The `@portal/game-sdk` `createTransport({ relayUrl, pollBaseUrl })` speaks both
the ws and REST sides automatically, failing over to polling if the relay drops.

## Develop

```bash
pnpm --filter @portal/realtime-relay dev    # tsx watch, :8787
pnpm --filter @portal/realtime-relay build  # tsc -> dist/
pnpm --filter @portal/realtime-relay start  # node dist/index.js
```

Configure the port with `PORT` (default `8787`). Deploy via the included
`Dockerfile` (Fly.io / Render free tier).
