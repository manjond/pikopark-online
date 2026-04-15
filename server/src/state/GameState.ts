import { Schema, type, MapSchema } from '@colyseus/schema';
import { PlayerState } from './Player';

export class ObjectState extends Schema {
  @type('string') id: string = '';
  /** 'button' | 'door' */
  @type('string') type: string = 'button';
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') width: number = 16;
  @type('number') height: number = 16;
  @type('boolean') activated: boolean = false;
  @type('number') requiredPlayers: number = 1;
  @type('string') linkedId: string = '';
  /** When true the button stays activated after the first trigger instead of resetting each tick. */
  @type('boolean') latching: boolean = false;
}

export class GameState extends Schema {
  @type('string') roomCode: string = '';
  /** 'waiting' | 'playing' | 'completed' */
  @type('string') status: string = 'waiting';
  @type('number') currentLevel: number = 0;
  @type({ map: PlayerState }) players: MapSchema<PlayerState> =
    new MapSchema<PlayerState>();
  @type({ map: ObjectState }) interactiveObjects: MapSchema<ObjectState> =
    new MapSchema<ObjectState>();
}
