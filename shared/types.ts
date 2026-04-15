// ─── State Snapshots (plain interfaces, not Colyseus schemas) ─────────────────

export interface PlayerState {
  id: string;
  name: string;
  color: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isGrounded: boolean;
  isInteracting: boolean;
  animation: string;
}

export type ObjectType = 'button' | 'lever' | 'platform' | 'door' | 'spring' | 'goal';

export interface ObjectState {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  activated: boolean;
  requiredPlayers: number;
  linkedId: string;
}

export type RoomStatus = 'waiting' | 'playing' | 'completed';

export interface GameStateSnapshot {
  roomCode: string;
  status: RoomStatus;
  currentLevel: number;
  players: Record<string, PlayerState>;
  interactiveObjects: Record<string, ObjectState>;
}

// ─── Client → Server Messages ─────────────────────────────────────────────────

export interface InputMessage {
  left: boolean;
  right: boolean;
  jump: boolean;
  interact: boolean;
  sequence: number;
}

export interface ChatMessage {
  message: string;
}

// ─── Server → Client Messages ─────────────────────────────────────────────────

export interface LevelStartMessage {
  levelId: number;
}

export interface LevelCompleteMessage {
  time: number;
  nextLevel: number;
}

export interface PlayerJoinedMessage {
  name: string;
  color: number;
}

export interface PlayerLeftMessage {
  name: string;
}
