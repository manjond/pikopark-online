import { createServer } from 'http';
import express from 'express';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { GameRoom } from './rooms/GameRoom';
import { SERVER_PORT } from '@pikopark/shared';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const httpServer = createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});
gameServer.define('game_room', GameRoom);

// Colyseus prepends its own HTTP listener so it runs before Express.
// We must also prepend — AFTER Colyseus — so our CORS handler is truly first.
httpServer.prependListener('request', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // Preflight: answer immediately so the browser proceeds with the real request.
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
  }
  // Non-OPTIONS: headers are set; let Colyseus / Express handle the response.
});

const port = Number(process.env['PORT'] ?? SERVER_PORT);

httpServer.listen(port, () => {
  console.log(`[Colyseus] Listening on ws://localhost:${port}`);
});
