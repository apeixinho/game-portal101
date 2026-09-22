/**
 * In-memory room + event-log store. Deliberately gameplay-agnostic: events are
 * opaque JSON envelopes, so the relay never needs to understand any particular
 * game. Authoritative persistence lives in Juno Datastore (see `persist.ts`).
 */

export interface StoredEvent {
  /** Monotonic per-room sequence — the polling cursor. */
  readonly seq: number;
  readonly receivedAt: number;
  readonly data: unknown;
}

interface Room {
  readonly code: string;
  seq: number;
  readonly events: StoredEvent[];
  readonly createdAt: number;
}

/** Keep memory bounded; polling clients only need a recent tail. */
const MAX_EVENTS_PER_ROOM = 500;

export class RoomStore {
  private readonly rooms = new Map<string, Room>();

  private ensure(code: string): Room {
    let room = this.rooms.get(code);
    if (!room) {
      room = { code, seq: 0, events: [], createdAt: Date.now() };
      this.rooms.set(code, room);
    }
    return room;
  }

  append(code: string, data: unknown): StoredEvent {
    const room = this.ensure(code);
    room.seq += 1;
    const event: StoredEvent = { seq: room.seq, receivedAt: Date.now(), data };
    room.events.push(event);
    if (room.events.length > MAX_EVENTS_PER_ROOM) {
      room.events.splice(0, room.events.length - MAX_EVENTS_PER_ROOM);
    }
    return event;
  }

  /** Events strictly after `since`, plus the current cursor. */
  since(code: string, since: number): { events: unknown[]; cursor: number } {
    const room = this.rooms.get(code);
    if (!room) return { events: [], cursor: since };
    const events = room.events.filter((e) => e.seq > since).map((e) => e.data);
    return { events, cursor: room.seq };
  }

  drop(code: string): void {
    this.rooms.delete(code);
  }

  get size(): number {
    return this.rooms.size;
  }
}
