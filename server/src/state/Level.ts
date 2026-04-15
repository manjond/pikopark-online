import { Schema, type } from '@colyseus/schema';

export class LevelState extends Schema {
  @type('number') id: number = 0;
  @type('string') name: string = '';
  @type('number') timeElapsed: number = 0;
  @type('boolean') isComplete: boolean = false;
}
