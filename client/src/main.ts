import './style.css';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { AuthScene } from './scenes/AuthScene';
import { MenuScene } from './scenes/MenuScene';
import { LobbyScene } from './scenes/LobbyScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { EditorScene } from './scenes/EditorScene';
import { GAME_WIDTH, GAME_HEIGHT } from '@pikopark/shared';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  // antialias: true gives smooth canvas scaling so text is readable at any
  // screen size. Sprites are procedurally generated so minor smoothing is fine.
  render: { antialias: true, roundPixels: false },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: import.meta.env.DEV,
    },
  },
  scene: [BootScene, AuthScene, MenuScene, LobbyScene, GameScene, UIScene, EditorScene],
};

new Phaser.Game(config);
