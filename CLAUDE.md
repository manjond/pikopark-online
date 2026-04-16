# PikoPark Online — Game Design Document

## Overview
PikoPark Online is a cooperative 2D platformer for browser, inspired by PikoPark. Players join rooms (up to 8 players) and work together to solve puzzles and complete levels. The game runs entirely in the browser — no downloads needed.

## Tech Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| Game engine | Phaser 3.80+ | Best free 2D browser engine in 2025; Arcade Physics + scene system |
| Multiplayer server | Colyseus 0.15 | Authoritative server; rooms + schema sync |
| Language | TypeScript 5.x | Strict mode everywhere |
| Bundler | Vite 6.x | Fast HMR dev + optimised production build |
| Package manager | npm 10+ | Monorepo workspaces |
| Runtime | Node.js 22 LTS | Server only |

> **Why Phaser 3?** It's the most mature free 2D browser game engine. Alternatives: Kaboom.js (simpler but far less mature), PixiJS (rendering only, no game loop / input), Unity WebGL (heavy download, not truly browser-native). Phaser is the right call for this project size.

> **Why Colyseus?** Purpose-built for authoritative multiplayer rooms in Node.js. Alternatives: plain Socket.io (more boilerplate, no room/schema system), Nakama (powerful but complex and requires Docker), Liveblocks/Partykit (good for CRDT apps, awkward for physics games). Colyseus wins here.

## Project Structure

```
pikopark-online/
├── client/                  # Phaser game (frontend)
│   ├── src/
│   │   ├── main.ts          # Phaser config & boot
│   │   ├── scenes/
│   │   │   ├── BootScene.ts        # Asset loading
│   │   │   ├── MenuScene.ts        # Main menu
│   │   │   ├── LobbyScene.ts       # Room creation/joining + chat
│   │   │   ├── GameScene.ts        # Main gameplay
│   │   │   └── UIScene.ts          # HUD overlay (room code, player count)
│   │   ├── network/
│   │   │   └── ColyseusClient.ts   # Server connection wrapper + NetworkState interfaces
│   │   ├── entities/
│   │   │   ├── Player.ts           # Remote player sprite + server-position lerp
│   │   │   └── InteractiveObject.ts # Buttons, doors, goal — loaded from level data
│   │   ├── physics/
│   │   │   └── PlatformerPhysics.ts # Local player Arcade Physics movement
│   │   └── utils/
│   │       ├── PlayerTextures.ts   # Procedural 16x16 spritesheet generation
│   │       └── SoundSystem.ts      # Web Audio API sound effects + music
│   ├── index.html
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── server/                  # Colyseus server (backend)
│   ├── src/
│   │   ├── index.ts         # HTTP + WebSocket server entry point
│   │   ├── rooms/
│   │   │   └── GameRoom.ts  # Physics tick, collision, level progression
│   │   ├── state/
│   │   │   ├── GameState.ts # @colyseus/schema root state
│   │   │   └── Player.ts    # PlayerState schema
│   │   └── commands/
│   │       └── PlayerCommands.ts # Input → velocity translation
│   └── tsconfig.json
│
├── shared/                  # Imported by both client and server
│   ├── constants.ts         # GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, TICK_RATE…
│   ├── types.ts             # InputMessage, SolidRect, LevelObjectDef, LevelData
│   ├── level.ts             # LevelData / LevelObjectDef interfaces
│   └── levels/
│       ├── level1.ts … level5.ts   # Platform geometry + interactive object defs
│
├── CLAUDE.md               # THIS FILE
└── package.json            # Root workspace
```

## Commands

```bash
npm run dev          # Start client (Vite :5173) + server (Colyseus :2567) concurrently
npm run build        # Production build — client/dist/ + server/dist/
npm run lint         # ESLint across all packages

# Individual
cd client && npm run dev
cd server && npm run dev
```

## Visual Style: "Chunky Pixel-Cartoon"

A hybrid style that combines pixel art charm with colorful cartoon energy.

### Resolution

**Current: 480×270** — NES/SNES-era pixel art feel, scaled to fill the browser window with `image-rendering: pixelated`. Extremely low level data coordinates but looks sharp at any screen size.

**Can we change it?** Yes, but it requires updating every level file since all platform/spawn coordinates are absolute pixels. The recommended upgrade path:

| Resolution | Factor vs now | Notes |
|------------|--------------|-------|
| 480×270    | 1× (current) | Ultra crisp; text can feel tiny |
| 640×360    | 1.33×        | Best compromise — same aspect ratio, more room, easy upgrade |
| 960×540    | 2×           | Modern feel; characters look proportionally small |
| 1280×720   | 2.67×        | Full HD base; requires larger sprites or redesigned levels |

**To upgrade to 640×360**: change `GAME_WIDTH`/`GAME_HEIGHT` in `shared/constants.ts` and multiply every `x`/`y`/`width`/`height` coordinate in `shared/levels/*.ts` by `640/480 = 1.333`. This is a ~2h job but straightforward.

### Characters and Palette
- **Sprites**: 16×16 px, generated procedurally via canvas (no image files needed)
- **Player colors**: P1 Red, P2 Blue, P3 Green, P4 Yellow, P5 Purple, P6 Orange, P7 Pink, P8 Cyan
- **Tiles**: 16×16 with chunky outlines, generated via Phaser Graphics API
- **UI**: Press Start 2P font (Google Fonts), pixel-panel aesthetic

## Game Mechanics

### Core Movement
- Walk left/right (arrow keys or A/D)
- Jump (spacebar / W / up arrow / touch button)
- Mobile: virtual D-pad + jump button (bottom left/right corners)

### Cooperative Mechanics (implemented)
1. **Weight buttons**: Buttons that activate only when N players stand on them simultaneously
2. **Linked doors**: Buttons open corresponding doors (1-to-1 link via `linkedId`)
3. **Player stacking**: Players can jump on each other's heads to reach higher platforms
4. **Latching buttons**: One-shot buttons that stay activated once triggered

### Cooperative Mechanics (planned)
5. **Spring/launch pads**: Catapult a player upward
6. **Carry & throw**: Pick up and throw objects (or each other)
7. **Weight platforms**: Moving platforms activated by player weight

### Level Design Principles
- Each level introduces ONE new mechanic
- Every puzzle requires cooperation (min 2 players)
- Clear visual language: **yellow** = interactive button, **red** = closed door, **gold** = goal
- Completable in 2–5 minutes
- 5 levels implemented (progressive difficulty)

## Multiplayer Architecture

### Room System
- **Create room**: Host creates a room, gets a 4-letter code (e.g. "ABCD")
- **Join room**: Enter code in menu to join a specific room
- **Quick play**: `joinOrCreate` — joins any available room or creates a new one
- **Host**: First player to join; only they see the START GAME button
- **Max players**: 8 per room

### Network Model (Authoritative Server)

```
Client → Server:  input only (left, right, jump, interact, sequence)
Server → Client:  positions (20Hz), objectStates (on change), playerList (5Hz)
```

The server owns all game state. Local player uses Phaser Arcade Physics for
immediate response (client-side prediction); server positions are authoritative
and remote players lerp to server positions.

### Actual Message Types (as implemented)

```
Client → Server:
  "input"       { left, right, jump, interact, sequence }
  "startGame"   {}                        — host-only; server validates
  "chat"        { text: string }

Server → Client (broadcast):
  "gameStart"   {}                        — all clients transition to GameScene
  "playerList"  { players[], hostId }     — 5 Hz; used for lobby + GameScene sprites
  "positions"   [ {id, x, y, vx, grounded, anim} ]  — every tick (20 Hz)
  "objectStates"[ {id, activated} ]       — only when something changes
  "levelStart"  { levelId }              — on level transition
  "levelComplete"{ playerName }          — when goal touched
  "chat"        { name, text }

Server → Client (direct):
  "roomCode"    { code }                 — buffered, sent in onJoin
  "objectStates"[ ... ]                  — initial state sent to new joiner
```

### Known Architecture Decision: Bypass Colyseus MapSchema forEach

`state.players.forEach()` and `state.interactiveObjects.forEach()` silently return
zero items on the **client-side reflected schema** (Colyseus 0.15 with `@colyseus/schema`).
Root cause: the reflected schema's Proxy wrapper + ChangeTree decoder interaction means
`$items` is not populated in a way that `forEach` can iterate.

**Workaround**: The server broadcasts explicit messages (`playerList`, `positions`,
`objectStates`) instead of relying on schema sync. Clients listen to these messages
and maintain their own local state. `state.players.get(id)` appears to work (single-key
proxy lookup) but all iteration uses messages.

**Do not** reintroduce `state.players.forEach()` or `state.interactiveObjects.forEach()`
on the client side — they will silently return nothing and the bug will reappear.

## Conventions

- TypeScript strict mode — minimize `any` (use `unknown` + type guards at boundaries)
- Server is the single source of truth — never trust client data for game logic
- All physics calculations on the server; client prediction is cosmetic only
- Commit messages: imperative mood, < 72 chars
- File naming: PascalCase for classes, camelCase for utilities, one class per file
- No image/audio files — everything generated via Canvas API and Web Audio API

## Development Phases

### Phase 1 — Foundation ✅
- [x] Monorepo structure (client + server + shared)
- [x] Local player movement + jump (Arcade Physics)
- [x] Colyseus room with server-side physics tick
- [x] Multiple players rendering + position sync

### Phase 2 — Core Gameplay ✅
- [x] SolidRect-based level geometry (no tilemap files needed)
- [x] Server-side physics + one-way platform collision
- [x] Remote player lerp interpolation
- [x] Player stacking (land on another player's head)
- [x] Buttons + doors + goal interactive objects

### Phase 3 — Room System ✅
- [x] 4-letter room code generation + join by code
- [x] Lobby UI: player list, room code, chat panel
- [x] Host-only START GAME (first player to join is host)
- [x] Synchronized game start (all lobby clients transition together)
- [ ] Quick play matchmaking (joinOrCreate already works; needs UI polish)

### Phase 4 — Content & Polish ✅
- [x] 5 levels with progressive difficulty
- [x] Procedural player spritesheets (4-frame animations per color)
- [x] Web Audio API sound effects + background music
- [x] Level complete overlay (winner name + elapsed time)
- [x] Mobile touch controls (virtual D-pad + jump)
- [ ] Background parallax layers
- [ ] Player name tags above sprites in GameScene
- [ ] Animated goal (spinning star or flag)

### Phase 5 — Deployment ✅
- [x] Vite production build → `client/dist/`
- [x] Vercel config (`vercel.json`) for static client
- [x] Render config (`render.yaml`) for Colyseus server
- [ ] Custom domain
- [ ] Basic analytics (Plausible or simple counter)

### Phase 6 — Nice to Have
- [ ] Spectator mode (join as observer, no player sprite)
- [ ] Persistent leaderboard (fastest room times)
- [ ] Level editor (visual drag-drop for SolidRect + objects)
- [ ] More cooperative mechanics: springs, carrying, moving platforms
- [ ] More levels (10+ total)
