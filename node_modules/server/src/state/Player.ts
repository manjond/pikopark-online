import { Schema, type } from '@colyseus/schema';

export class PlayerState extends Schema {
  @type('string') id: string = '';
  @type('string') name: string = '';
  @type('number') color: number = 0;
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') velocityX: number = 0;
  @type('number') velocityY: number = 0;
  @type('boolean') isGrounded: boolean = false;
  @type('boolean') isInteracting: boolean = false;
  @type('string') animation: string = 'idle';
}
