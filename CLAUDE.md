# PikoPark Online — Game Design Document

## Overview
PikoPark Online is a cooperative 2D platformer for browser, inspired by PikoPark. Players join rooms (up to 8 players) and work together to solve puzzles and complete levels. The game runs entirely in the browser — no downloads needed.

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Game engine (client) | Phaser 3 | 3.80+ |
| Multiplayer server | Colyseus | Latest |
| Language | TypeScript | 5.x |
| Bundler | Vite | 6.x |
| Package manager | npm | 10+ |
| Runtime | Node.js | 22 LTS |

## Project Structure

```
pikopark-online/
├── client/                  # Phaser game (frontend)
│   ├── src/
│   │   ├── main.ts         # Phaser config & boot
│   │   ├── scenes/
│   │   │   ├── BootScene.ts        # Asset loading
│   │   │   ├── MenuScene.ts        # Main menu
│   │   │   ├── LobbyScene.ts       # Room creation/joining
│   │   │   ├── GameScene.ts        # Main gameplay
│   │   │   └── UIScene.ts          # HUD overlay
│   │   ├── network/
│   │   │   └── ColyseusClient.ts   # Server connection manager
│   │   ├── entities/
│   │   │   ├── Player.ts           # Player sprite & animations
│   │   │   └── InteractiveObject.ts # Buttons, levers, platforms
│   │   ├── physics/
│   │   │   └── PlatformerPhysics.ts # Movement & collision helpers
│   │   └── assets/                  # Sprites, tilemaps, audio
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                  # Colyseus server (backend)
│   ├── src/
│   │   ├── index.ts         # Server entry point
│   │   ├── rooms/
│   │   │   └── GameRoom.ts  # Main game room logic
│   │   ├── state/
│   │   │   ├── GameState.ts # Synchronized game state schema
│   │   │   ├── Player.ts    # Player state schema
│   │   │   └── Level.ts     # Level state schema
│   │   ├── levels/
│   │   │   └── LevelManager.ts # Level loading & progression
│   │   └── commands/
│   │       └── PlayerCommands.ts # Input handling & validation
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                  # Shared types between client & server
│   ├── types.ts
│   └── constants.ts
│
├── CLAUDE.md               # THIS FILE — project context for Claude Code
└── package.json            # Root workspace
```

## Commands

- `cd client && npm run dev` — Start Phaser dev server (Vite) on port 5173
- `cd server && npm run dev` — Start Colyseus server on port 2567
- `npm run dev` — Start both client and server concurrently (from root)
- `npm run build` — Production build of client + server
- `npm run lint` — ESLint check across all packages

## Visual Style: "Chunky Pixel-Cartoon"

A hybrid style that combines pixel art charm with colorful cartoon energy:

- **Resolution**: Game renders at 480x270 (pixel art base) scaled up to fill screen
- **Characters**: 16x16 pixel sprites, colorful and expressive with simple 2-frame walk animations
- **Palette**: Vibrant and saturated — each player has a distinct color:
  - P1: Red, P2: Blue, P3: Green, P4: Yellow, P5: Purple, P6: Orange, P7: Pink, P8: Cyan
- **Tiles**: 16x16 tileset with chunky outlines
- **Backgrounds**: Parallax layers with soft gradient skies
- **UI**: Clean pixel font, rounded UI panels with slight transparency
- **Feel**: Cute, friendly, cooperative — like a party game

## Game Mechanics

### Core Movement
- Walk left/right (arrow keys or A/D)
- Jump (spacebar or W or up arrow)
- Interact (E key) — press buttons, pull levers, grab objects

### Cooperative Mechanics

1. **Weight platforms**: Platforms that only activate when N players stand on them
2. **Player stacking**: Players can jump on each other's heads to reach higher areas
3. **Player launching**: A player on a spring platform can launch another player upward
4. **Cooperative buttons**: Buttons/levers that one player holds while others pass through opened doors
5. **Carry & throw**: Players can pick up and throw smaller objects (and eventually each other?)

### Level Design Principles
- Each level introduces ONE new mechanic
- Levels get progressively harder
- Every puzzle requires at least 2 players to solve
- Levels should be completable in 2-5 minutes
- Clear visual language: red = danger, green = goal, yellow = interactive

## Multiplayer Architecture

### Room System
- **Create room**: Generates a 4-letter room code (e.g., "ABCD")
- **Join room**: Enter code or pick from public room list
- **Quick play**: Auto-matchmaking joins available public rooms
- **Max players**: 8 per room
- **Min players to start**: 2

### Network Model (Authoritative Server)
- Server owns all game state (positions, physics, level progress)
- Clients send INPUTS only (left, right, jump, interact)
- Server validates inputs, updates state, broadcasts to all clients
- Clients do client-side prediction for smooth movement
- Server sends state updates at 20 ticks/second
- Client interpolates between state updates for smooth rendering

### State Schema (Colyseus)
```
GameState {
  roomCode: string
  status: "waiting" | "playing" | "completed"
  currentLevel: number
  players: MapSchema<PlayerState>
  interactiveObjects: MapSchema<ObjectState>
}

PlayerState {
  id: string
  name: string
  color: number (0-7)
  x: number
  y: number
  velocityX: number
  velocityY: number
  isGrounded: boolean
  isInteracting: boolean
  animation: string
}

ObjectState {
  id: string
  type: "button" | "lever" | "platform" | "door" | "spring"
  x: number
  y: number
  activated: boolean
  requiredPlayers: number
}
```

### Message Types
```
Client → Server:
  "input"     { left, right, jump, interact, sequence }
  "ready"     { }
  "chat"      { message: string }

Server → Client:
  (state sync is automatic via Colyseus schema)
  "levelStart"    { levelId: number }
  "levelComplete" { time: number, nextLevel: number }
  "playerJoined"  { name: string, color: number }
  "playerLeft"    { name: string }
```

## Conventions

- TypeScript strict mode — no `any` types
- Server is the single source of truth — NEVER trust client data
- All physics calculations happen on the server
- Use Phaser's Arcade Physics on client for prediction only
- Commit messages: imperative mood, < 72 chars
- File naming: PascalCase for classes, camelCase for utilities
- One class per file

## Development Phases

### Phase 1 — Foundation (Start here)
- [x] Initialize project structure (monorepo with client + server)
- [x] Basic Phaser scene with a character that moves and jumps
- [x] Basic Colyseus server with room creation
- [x] Connect client to server, sync one player's position
- [x] Add multiple players rendering on screen

### Phase 2 — Core Gameplay
- [x] Tilemap-based level loading (procedural geometry via SolidRect)
- [x] Server-side physics and collision detection
- [x] Client-side prediction and interpolation
- [x] Player stacking mechanic
- [x] Interactive objects (buttons, doors)

### Phase 3 — Room System
- [x] Room code generation and joining
- [x] Lobby UI with player list and ready system
- [ ] Quick play matchmaking
- [x] Chat system in lobby

### Phase 4 — Content & Polish
- [x] Design 5 levels with progressive difficulty (levels 1–5)
- [x] Sprite animations (procedural 4-frame spritesheet per player color)
- [x] Sound effects and background music (Web Audio API, no files)
- [x] Level completion screen with stats (winner name + elapsed time)
- [x] Mobile touch controls (virtual D-pad + jump button)

### Phase 5 — Deployment
- [x] Build pipeline for client (Vite → static files) — `npm run build` produces `client/dist/`
- [x] Deploy client to Vercel/Netlify — `vercel.json` config at root, connect repo to Vercel
- [x] Deploy Colyseus server to Railway/Render — `render.yaml` config at root, connect repo to Render
- [ ] Custom domain setup — point DNS to Vercel/Render after deploy
- [ ] Basic analytics
