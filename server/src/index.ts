import { createServer } from 'http';
import express from 'express';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { GameRoom } from './rooms/GameRoom';
import { ALL_PACKS, SERVER_PORT, validateAllPacks } from '@pikopark/shared';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0', built: new Date().toISOString() });
});

const httpServer = createServer(app);

// Colyseus handles CORS for /matchmake/* routes internally via its own
// DEFAULT_CORS_HEADERS + getCorsHeaders. No extra middleware needed.
const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});
gameServer.define('game_room', GameRoom);

const port = Number(process.env['PORT'] ?? SERVER_PORT);

const validationIssues = validateAllPacks(ALL_PACKS);
const fatal = validationIssues.filter(i => i.severity === 'error');
if (fatal.length > 0) {
  console.error(`[Colyseus] ${fatal.length} level validation error(s) — aborting startup.`);
  process.exit(1);
}

httpServer.listen(port, () => {
  console.log(`[Colyseus] Listening on ws://localhost:${port}`);
});
