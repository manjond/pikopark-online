import { createServer } from 'http';
import express from 'express';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { GameRoom } from './rooms/GameRoom';
import { SERVER_PORT } from '@pikopark/shared';

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

httpServer.listen(port, () => {
  console.log(`[Colyseus] Listening on ws://localhost:${port}`);
});
