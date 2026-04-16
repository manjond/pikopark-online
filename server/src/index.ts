import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { GameRoom } from './rooms/GameRoom';
import { SERVER_PORT } from '@pikopark/shared';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const httpServer = createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});

// Colyseus maintains its own internal express app for matchmaking routes.
// Our app.use(cors()) only covers Express routes — we must also patch Colyseus's app.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(gameServer as any).express?.use(cors());

gameServer.define('game_room', GameRoom);

const port = Number(process.env['PORT'] ?? SERVER_PORT);

httpServer.listen(port, () => {
  console.log(`[Colyseus] Listening on ws://localhost:${port}`);
});
