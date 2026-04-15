import { Client, Room } from 'colyseus.js';

const SERVER_URL =
  (import.meta.env.VITE_SERVER_URL as string | undefined) ?? 'ws://localhost:2567';

// ─── Client-side state shape ──────────────────────────────────────────────────
// These mirror the server @colyseus/schema classes but are plain interfaces —
// no need to ship the Schema runtime to the client.

/** Minimal interface for iterating/subscribing to a Colyseus MapSchema. */
interface NetworkMap<T> {
  get(key: string): T | undefined;
  onAdd(callback: (value: T, key: string) => void): void;
  onRemove(callback: (value: T, key: string) => void): void;
  forEach(callback: (value: T, key: string) => void): void;
}

/** One entry in state.players — matches server PlayerState schema fields. */
export interface NetworkPlayer {
  readonly id: string;
  readonly name: string;
  readonly color: number;
  readonly x: number;
  readonly y: number;
  readonly velocityX: number;
  readonly velocityY: number;
  readonly animation: string;
  readonly isGrounded: boolean;
}

/** One entry in state.interactiveObjects — matches server ObjectState schema fields. */
export interface NetworkObject {
  readonly id: string;
  readonly type: string;   // 'button' | 'door'
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly activated: boolean;
  readonly requiredPlayers: number;
  readonly linkedId: string;
  readonly latching: boolean;
}

/** Top-level game state received from the server. */
export interface NetworkGameState {
  readonly roomCode: string;
  readonly status: string;
  readonly players: NetworkMap<NetworkPlayer>;
  readonly interactiveObjects: NetworkMap<NetworkObject>;
}

// ─── Client wrapper ───────────────────────────────────────────────────────────

export class ColyseusClient {
  private readonly client: Client;
  private room: Room | null = null;

  constructor() {
    this.client = new Client(SERVER_URL);
  }

  async joinOrCreate(
    roomName: string,
    options?: Record<string, unknown>,
  ): Promise<Room> {
    this.room = await this.client.joinOrCreate(roomName, options);
    return this.room;
  }

  async create(
    roomName: string,
    options?: Record<string, unknown>,
  ): Promise<Room> {
    this.room = await this.client.create(roomName, options);
    return this.room;
  }

  async join(
    roomName: string,
    options?: Record<string, unknown>,
  ): Promise<Room> {
    this.room = await this.client.join(roomName, options);
    return this.room;
  }

  /**
   * Returns available rooms that have a matching room code in their metadata.
   * The server sets metadata via setMetadata({ code }) in GameRoom.onCreate.
   */
  async findRoomByCode(
    roomName: string,
    code: string,
  ): Promise<string | null> {
    const rooms = await this.client.getAvailableRooms(roomName);
    const match = rooms.find(
      (r) => (r.metadata as Record<string, unknown> | null)?.['code'] === code,
    );
    return match?.roomId ?? null;
  }

  async joinById(
    roomId: string,
    options?: Record<string, unknown>,
  ): Promise<Room> {
    this.room = await this.client.joinById(roomId, options);
    return this.room;
  }

  getRoom(): Room | null {
    return this.room;
  }

  async leave(): Promise<void> {
    if (this.room !== null) {
      await this.room.leave();
      this.room = null;
    }
  }
}
