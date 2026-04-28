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

**Current: 1280×720** — HD base resolution matching most browser viewports. Phaser renders at native 1280×720 and scales to fill the window (`FIT` scale mode). TILE_SIZE=32 (sprites are 32×32 px).

Previous versions used 480×270. All level coordinates were multiplied by 8/3 during the upgrade. Physics constants (GRAVITY, JUMP_VELOCITY, MOVE_SPEED) were also multiplied by 8/3 to preserve the same visual jump height proportions.

If you ever need to change resolution again: update `GAME_WIDTH`/`GAME_HEIGHT`/`TILE_SIZE` in `shared/constants.ts` and scale all `x`/`y`/`width`/`height` values in every level file by the new factor. Also scale physics constants by the same factor.

### Characters and Palette
- **Sprites**: 32×32 px at TILE_SIZE=32, generated procedurally via Phaser Graphics API (no image files needed)
- **Player colors**: P1 Red, P2 Blue, P3 Green, P4 Yellow, P5 Purple, P6 Orange, P7 Pink, P8 Cyan
- **Tiles**: solid rects drawn via Phaser Graphics; no tilemap files
- **UI**: Press Start 2P font (Google Fonts), pixel-panel aesthetic
- **Goal object**: animated 5-pointed gold star with spinning tween, pulsing glow circle, and vertical beacon beam

### Why no image or audio files?
All visuals and sounds are generated at runtime via Web APIs. **Advantages**: zero asset pipeline, instant cold start, no file-hosting issues, no CORS problems on Vercel/Render. **Trade-off**: lower fidelity than hand-crafted art. When the game is more mature and the design is locked, swap `generatePlayerSpritesheet()` for real sprite sheets and `SoundSystem.ts` for actual audio files — the integration points are already isolated. For now, procedural generation lets us iterate fast without managing a binary asset pipeline.

## Game Mechanics

### Core Movement
- Walk left/right (arrow keys or A/D)
- Jump (spacebar / W / up arrow / touch button)
- Mobile: virtual D-pad + jump button (bottom left/right corners)

### Cooperative Mechanics (implemented)
1. **Weight buttons**: Buttons that activate only when N players stand on them simultaneously
2. **Linked doors**: Buttons open doors via `button.linkedId → door.id`. Multiple buttons may share one door (AND logic). Doors themselves leave `linkedId` empty.
3. **Player stacking**: Players can jump on each other's heads to reach higher platforms
4. **Latching buttons**: One-shot buttons that stay activated once triggered
5. **Carry**: Standing on another player's head — you move with them horizontally
6. **Jump blocking**: You cannot jump if another player is standing on your head
7. **Solid bodies**: Players block each other laterally — MTV resolution in `GameRoom.resolvePlayerPair`; vertical overlap is left to the stacking pass

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

The server owns all game state. **All players (including the local player) are driven entirely by server position broadcasts** — there is no dual physics simulation. The local player uses Phaser Arcade Physics only for immediate visual feedback; actual positions come from the server's `positions` broadcast. Remote players lerp to server positions over one tick window (50ms).

**Sub-stepping**: The server physics tick runs 3 sub-steps per tick (SUBSTEPS=3) to prevent tunnelling at 20Hz.

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
- [x] Background parallax layers (2 cloud layers drifting at 0.2×/0.5× camera)
- [x] Player name tags above sprites in GameScene
- [x] Animated goal (spinning gold star + glow + beacon beam)
- [x] Screen shake on door open and level complete
- [x] Particle burst at the goal on level complete

### Phase 5 — Deployment ✅
- [x] Vite production build → `client/dist/`
- [x] Vercel config (`vercel.json`) for static client
- [x] Render config (`render.yaml`) for Colyseus server
- [ ] Custom domain
- [ ] Basic analytics (Plausible or simple counter)

### Phase 5.5 — Level Packs & Scrolling ✅
- [x] `minPlayers` requirement per level and per pack
- [x] `mapWidth` per level — levels wider than 1280px scroll horizontally
- [x] Camera follows local player on wide maps
- [x] AND-logic button→door propagation (multiple buttons can share one door)
- [x] 3 packs: Basics (1p+, 5 levels), Duo (2p+, 5 levels), Squad (4p+, 5 levels)
- [x] Lobby pack selector — host picks pack; minPlayers enforced before start
- [x] Server rejects startGame if players < pack.minPlayers with `startError` message

### Phase 6 — Nice to Have
- [x] Spectator mode (join as observer, no player sprite) — spectators pool separate from `state.players`, cap 16 per room, late joiners auto-routed to spectator, camera auto-follows lowest-id player or pans with arrows
- [x] Persistent leaderboard (fastest room times per level) — file-backed JSON at `server/data/leaderboard.json` (or `LEADERBOARD_PATH`), top-10 per level, atomic write-via-rename, `/leaderboard` + `/leaderboard/:levelId` HTTP endpoints, menu "LEADERBOARD" screen
- [ ] Level editor (visual drag-drop tool for SolidRect + objects → exports JSON)
- [x] More cooperative mechanics: springs (bounce pack), carrying (E = pickup/throw, pinned to carrier's head), moving platforms (triangle-wave motion, riders inherit `platformVX`, broadcast via `platformPositions`)
- [x] More levels (10+ total) — 31 levels across 7 packs (Basics, Duo, Hazards, Squad, Extreme, Bounce, Acrobatics)

#### Carry / throw mechanic

- Press **E** next to a free grounded ally → they're pinned at your head (`carriedBy`/`carrying` on PlayerState). You can walk; you can't jump while carrying (the head-block rule covers this).
- Press **E** again while carrying → throw in your facing direction. Rider launched with `VX = MOVE_SPEED * 1.3 * facing`, `VY = JUMP_VELOCITY * 1.15`.
- `THROW_FEET_PEAK ≈ 303` in `_helpers.ts` — use it to gate puzzle platforms: top-y in `[THROW_FEET_PEAK, STACK3_FEET_PEAK)` ≈ `[303, 357)` is the throw-only reachability window. Throwing from an elevated vantage (e.g., the lift at top-y=380) both pushes horizontal reach from ~396 px to ~558 px and lets the rider land higher (below y=303).
- Rider cannot press **E** themselves to drop — only the carrier throws. Keeps the state machine simple.

#### Moving platforms

- New `'platform'` object type. Factory: `movingPlatform(id, startX, yTop, width, motion)` where `motion = { axis: 'x'|'y', from, to, speed }` — `from`/`to` are in **center coordinates** on the motion axis, so `startX + width/2` should equal `motion.from` to start at the left/bottom dock.
- Server `ObjectState.tickMotion(dtMs)` advances a triangle-wave between `from` and `to` at `speed` px/s, then exposes `platformVX` / `platformVY` for rider carry.
- Integration loop treats platforms as one-way solids (land on top only), drags grounded riders horizontally each sub-step, and pushes riders upward with a rising Y-axis platform.
- Client reads `platformPositions` each tick and updates the rendered rect. The schema intentionally doesn't sync platform x/y — motion fields are server-only.
## Improvement Ideas (game design)

These are ideas for making the game more engaging — not yet scheduled, just documented for reference.

### Feel & polish
- **Player name tags** floating above each sprite in GameScene (critical for 4+ players)
- **Jump SFX** per player color; **goal fanfare** when level completes
- **Parallax background** — 2–3 layers of soft sky/clouds behind the level
- **Screen shake** on door open and level complete
- **Transition animation** between levels (wipe or zoom-out) instead of instant load
- **Particle burst** at the goal when a player touches it

### Cooperative depth
- **Spring pads**: step on → launch; hold button → launch ally higher
- **Moving platforms**: linked to a button, slide between two waypoints
- **Weight bridges**: a platform that tilts based on player distribution
- **Throw mechanic**: hold Interact next to ally → pick up → release to throw upward
- **Ghost spectator**: dead/disconnected players watch and can place emoji reactions

### Social / meta
- **Emoji reactions**: press a key to pop a floating emoji above your character (laugh, gg, etc.)
- **Post-game scoreboard**: who reached goal first, who held button longest, who fell most
- **Cosmetic unlocks**: complete all 5 levels → unlock an alternate color palette or hat sprite
- **Public room list**: joinable rooms shown on the main menu with player counts

### Tech improvements
- **Client-side prediction rollback**: buffer last N inputs, replay on server correction
- **Room persistence**: rejoin a room after disconnect within 30 s (Colyseus reconnect token)
- **Rate limiting**: cap input messages to TICK_RATE per second per client server-side
- **Structured logging**: add request IDs and room codes to server logs for debugging

## Level Helpers & Migration Plan

`shared/levels/_helpers.ts` centralises the constants and factory functions that every `levelN.ts` currently hand-rolls, and ships a static validator that the server runs at startup (`validateAllPacks` in `server/src/index.ts`). If any level has a structural error (missing goal, broken linkedId, unsolvable pressure AND-group), the server aborts boot.

### Level-design rules (MANDATORY — read before authoring or editing any level)

#### 1. Solvability with the minimum player count

A level's `minPlayers` is the MINIMUM number of active players required, and the level MUST be completable by exactly that many — no fewer, no more. Validation tools catch some failures (orphan doors, pressure-only AND-deadlocks) but the rest is on the author:

- **Solo levels (`minPlayers: 1`)** must NOT use any 2-player mechanic:
  - No platforms in the stack-only band (top-y in `[STACK3_FEET_PEAK, SOLO_FEET_PEAK)` = `[357, 421)`) unless reachable by other means (spring, lift, throw).
  - No throw-only perches (top-y in `[THROW_FEET_PEAK, STACK3_FEET_PEAK)` = `[303, 357)`).
  - No buttons with `requiredPlayers > 1`.
  - No carry/throw — solo can't pick up a partner.

- **Duo levels (`minPlayers: 2`)** must complete with EXACTLY 2 players:
  - At any one moment, ≤ 1 player is "stuck" on a pressure pad. The other must be free to advance.
  - Buttons with `requiredPlayers ≥ 2` must be latching, otherwise both players are stuck simultaneously.
  - Stack-only and throw-only mechanics are valid (need 2 to operate).

- **Squad levels (`minPlayers: 4`)** must complete with EXACTLY 4 players:
  - Pressure-holds simultaneously ≤ 3 (at least 1 free).
  - 3-stack mechanics OK; never require a 4-stack (`STACK4_FEET_PEAK` doesn't exist as a band — physics-wise, would need a 5th player).
  - No mechanic requiring 5+ simultaneous holders.

#### 2. Spatial reachability

Every key element (button, latch, lift dock, goal) must be reachable from spawn given the level's player count.

- **Horizontal jump distance**: max **400 px** (running jump from flat ground, full air time × MOVE_SPEED). Bridge any gap > 350 px with intermediate platforms — leave 50 px of margin for grounded acceleration variance.
- **Vertical reach bands** (use `_helpers.ts` constants — never paste numbers):
  - From floor (1 player): top-y ≥ `SOLO_FEET_PEAK` (421)
  - From 2-stack: top-y ≥ `STACK2_FEET_PEAK` (389)
  - From 3-stack: top-y ≥ `STACK3_FEET_PEAK` (357)
  - From spring: top-y ≥ `SPRING_FEET_PEAK` (72)
  - From throw (carrier on floor): top-y ≥ `THROW_FEET_PEAK` (303)
- **Spring horizontal range**: ~600 px each side from launch point. Don't place spring-only goals farther than 600 px horizontally from any spring.
- **Throw horizontal range**: `THROW_HORIZONTAL_MAX` ≈ 598 px.
- **Vertical-lift apex rule**: a player at the lift's apex column has only the standard 400 px running jump. Any goal pad or key element must be within 400 px horizontally of the lift's apex column, OR there must be a chain of intermediate platforms (each gap ≤ 350 px).
- **Lava-pit width**: max ~350 px to be solo-jumpable. Wider pits need crumble/static bridges, springs, or throws to cross.

#### 3. Safe spawn rim

The default spawn is `standardSpawns()` at x = 48, 112, 176, 240 on the floor. To prevent insta-death:

- **Trap left edge ≥ 256** (rightmost spawn center 240 + half player width 16). A trap starting at x ≤ 255 catches the rightmost spawn on tick 1.
- **Firebar pivot ≥ 256** (or far enough that the swing arc never reaches a stationary spawning player).
- **Door at x > 280** so the spawn rim has room before any blockage.

#### 4. AND-logic gotchas

- A door/trap with multiple buttons linked uses **AND-logic** — every linked button must be active.
- Latching button = active forever after first press; pressure button = active only while held.
- DON'T mix latching + pressure linked to the same target — the latch is functionally useless because the pressure pad still gates the AND.
- DON'T design a level where `minPlayers - sum(simultaneous pressure holders) < 1` — the validator catches this for door-pressure groups, but extends to your overall puzzle flow too.

#### 5. Moving-platform notes

- The lift's vertical motion is now stepped per substep (3× per tick) — riders stay glued to a descending or ascending platform without the gravity-lag hover that used to flicker `isGrounded` off.
- Lift speeds in the 80–150 px/s range feel grippy; faster than ~250 px/s starts to slip riders off corners.
- A vertical lift's rider can't jump while the platform's `platformVY` snap is below them (rider's bottom briefly inside platform top after carry); this is intentional friction — keep apex docks generous.

### Level-authoring conventions

- **Spawn points**: always call `standardSpawns()` with no arguments. The default (4 players at `48, 112, 176, 240`, y on the floor) fits every map ≥ 256 px wide and keeps rosters consistent across packs.
- **Door `linkedId`**: always leave empty (`fullHeightDoor('doorX', x)` — omit the third argument). Button-to-door propagation is driven solely by `button.linkedId → door`; the door's own `linkedId` is decorative and pollutes diffs when it drifts. The same applies to `trap.linkedId` — buttons drive traps via `button.linkedId → trap`; the reverse pointer is decorative.
- **Every door must have a button linking to it.** Server `GameRoom.ts` only reads `button.linkedId` to open things, so an orphan door (no button pointing at its id) stays closed forever and blocks whatever is behind it. The startup validator catches this (see "orphan-door check") — this is the 2026-04-18 class of bug that made level 25's `door25b` an impassable ghost barrier.
- **Button placement**: use `floorButton` for floor-level buttons and `platformButton(id, platformRect, …)` for anything sitting on a platform. Never hand-roll the `x`/`y`/`width` — the factories derive them from the platform. Bounce pack (levels 27/28) uses `yOffset: 4` on `platformButton` to sit the button flush on top of the platform; every other pack uses the default `TILE_SIZE/2` offset (button floats 12 px above the platform top).
- **Platform reachability**: pick the y based on [SOLO|STACK2|STACK3|SPRING]`_FEET_PEAK` bands from `_helpers.ts`; never paste the magic numbers 421/389/357/72.
- **Latching vs. pressure**: if every button gating a door is non-latching AND `sum(requiredPlayers) >= minPlayers`, the level is unsolvable. The startup validator catches this — don't bypass it.

### What the helper exports
- `FLOOR_TOP` (688), `PLAYER_ON_FLOOR` (672)
- Reachability thresholds derived from `GRAVITY` / `JUMP_VELOCITY` / `SPRING_VELOCITY` — never hand-type these again:
  - `SOLO_FEET_PEAK` = 421 (solo-reachable if platform top ≥ this)
  - `STACK2_FEET_PEAK` = 389 (2-stack required in `[389, 421)`)
  - `STACK3_FEET_PEAK` = 357 (3-stack required in `[357, 389)`)
  - `SPRING_FEET_PEAK` = 72 (spring required in `[72, 357)`)
- Rect factories: `groundRect`, `platformRect`
- Spawn factory: `standardSpawns(count=4, startX=48, gap=64)`
- Object factories: `floorButton`, `platformButton`, `fullHeightDoor`, `floorTrap`, `floorSpring`, `goalOnFloor`, `goalOnPlatform`. `platformButton` accepts `{ width, latching, requiredPlayers, yOffset }` — `yOffset` overrides the vertical distance from platform top (default `TILE_SIZE/2 = 16`; bounce pack uses `4`).
- Validator: `validateLevel`, `validatePack`, `validateAllPacks`

### Migration status (31 levels ✅ complete)
All 28 `levelN.ts` files now use the helper factories (`groundRect`, `platformRect`, `standardSpawns`, `floorButton`, `platformButton`, `fullHeightDoor`, `floorTrap`, `floorSpring`, `goalOnFloor`, `goalOnPlatform`). Conventions unified across the whole catalog:

- All spawns use `standardSpawns()` default (48/112/176/240).
- All `door.linkedId` and `trap.linkedId` fields are `''` (decorative reverse pointers removed).
- Bounce pack (27/28) uses `platformButton(..., { yOffset: 4 })` for flush-on-platform placement; every other level uses the factory default (16 px).

Side-effect bug fix on 2026-04-18: level 25 `door25b` had no button pointing at it — the door stayed closed forever and the "Final Trial" goal was unreachable. The orphan door was removed and a new validator rule (orphan-door check) was added so this class of bug blocks server boot instead of shipping.

### Validator rules currently enforced
- Exactly one `goal` object per level
- No duplicate object IDs
- Every non-empty `linkedId` resolves to an object in the same level
- Spawn points within `mapWidth`
- **Pressure-only AND-group**: if every button linked to a door is non-latching AND `sum(requiredPlayers) >= effectiveMinPlayers`, flag as error (this is the 2026-04-18 class of bug that made 9 levels unsolvable)
- **Orphan door**: a `door` with no button linking to it — `GameRoom.ts` only opens doors via `button.linkedId`, so an orphan door is permanently impassable (caught `door25b` in "The Final Trial").

### Future validator upgrades (not yet implemented)
- Cross-section pressure-door analysis on wide scroll maps (a button in section A locking a door in section B is already caught today by the sum check, but the error message doesn't hint at spatial context)
- Spatial path validation (can a player physically traverse from spawn to goal given reachability thresholds?)
- Warn when a platform falls in an unreachable zone (below `SPRING_FEET_PEAK` with no spring)
