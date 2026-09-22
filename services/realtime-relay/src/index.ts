import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import { noopPersister, type Persister } from "./persist.js";
import { RoomStore } from "./rooms.js";

const PORT = Number(process.env.PORT ?? 8787);

const store = new RoomStore();
const persister: Persister = noopPersister;

/** Live ws peers per room, for low-latency fan-out. */
const peers = new Map<string, Set<WebSocket>>();

function broadcast(code: string, data: unknown, except?: WebSocket): void {
  const set = peers.get(code);
  if (!set) return;
  const payload = JSON.stringify(data);
  for (const ws of set) {
    if (ws !== except && ws.readyState === ws.OPEN) ws.send(payload);
  }
}

function ingest(code: string, data: unknown, except?: WebSocket): void {
  store.append(code, data);
  persister.record(code, data);
  broadcast(code, data, except);
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
  });
  res.end(payload);
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  if (chunks.length === 0) return undefined;
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const ROOM_EVENTS = /^\/rooms\/([^/]+)\/events$/;

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (url.pathname === "/healthz") {
    sendJson(res, 200, { ok: true, rooms: store.size, uptime: process.uptime() });
    return;
  }

  const match = ROOM_EVENTS.exec(url.pathname);
  if (match) {
    const code = decodeURIComponent(match[1]);

    // Polling fallback: fetch events since a cursor.
    if (req.method === "GET") {
      const since = Number(url.searchParams.get("since") ?? 0);
      sendJson(res, 200, store.since(code, Number.isFinite(since) ? since : 0));
      return;
    }

    // Polling fallback: append an outbound event.
    if (req.method === "POST") {
      readBody(req)
        .then((data) => {
          ingest(code, data);
          sendJson(res, 202, { ok: true });
        })
        .catch(() => sendJson(res, 400, { error: "invalid json" }));
      return;
    }
  }

  sendJson(res, 404, { error: "not found" });
});

// Low-latency ws fan-out: ws://host/rooms/<code>/ws?id=<playerId>
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const wsMatch = /^\/rooms\/([^/]+)\/ws$/.exec(url.pathname);
  if (!wsMatch) {
    socket.destroy();
    return;
  }
  const code = decodeURIComponent(wsMatch[1]);
  wss.handleUpgrade(req, socket, head, (ws) => {
    let set = peers.get(code);
    if (!set) {
      set = new Set();
      peers.set(code, set);
    }
    set.add(ws);

    ws.on("message", (raw) => {
      let data: unknown;
      try {
        data = JSON.parse(raw.toString());
      } catch {
        return;
      }
      ingest(code, data, ws);
    });

    ws.on("close", () => {
      const peerSet = peers.get(code);
      peerSet?.delete(ws);
      if (peerSet && peerSet.size === 0) peers.delete(code);
    });
  });
});

server.listen(PORT, () => {
  console.log(`[realtime-relay] listening on :${PORT}`);
});
