import { createServer } from 'http';
import express from 'express';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { GameRoom } from './rooms/GameRoom';
import { leaderboardInstance } from './leaderboard/Leaderboard';
import { accountStoreInstance } from './auth/AccountStore';
import { ALL_PACKS, SERVER_PORT, validateAllPacks } from '@pikopark/shared';

const app = express();
app.use(express.json());

// Basic CORS for the leaderboard JSON endpoint. Colyseus handles its own
// CORS for /matchmake/*; we mirror the permissive origin for /leaderboard
// so the Vite dev server and the Vercel-hosted client can both fetch.
app.use('/leaderboard', (_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
  next();
});

// Same CORS trick for /auth so the Vite dev server can POST to the local
// Colyseus box and a Vercel-hosted client can hit the production backend.
app.use('/auth', (_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.options('/auth/register', (_req, res) => { res.sendStatus(204); });
app.options('/auth/login', (_req, res) => { res.sendStatus(204); });

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0', built: new Date().toISOString() });
});

const leaderboard = leaderboardInstance();
const accounts = accountStoreInstance();

app.get('/leaderboard', (_req, res) => {
  res.json({ version: 1, levels: leaderboard.getAll() });
});

app.get('/leaderboard/:levelId', (req, res) => {
  const id = Number(req.params['levelId']);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: 'levelId must be a number' });
    return;
  }
  res.json({ levelId: id, top: leaderboard.getTop(id) });
});

app.post('/auth/register', (req, res) => {
  const body = (req.body ?? {}) as { username?: unknown; password?: unknown };
  accounts.register(String(body.username ?? ''), String(body.password ?? ''))
    .then((result) => {
      if (result.ok) res.json({ username: result.username });
      else res.status(result.code).json({ error: result.error });
    })
    .catch((err: unknown) => {
      console.error('[auth/register]', err);
      res.status(500).json({ error: 'Internal server error' });
    });
});

app.post('/auth/login', (req, res) => {
  const body = (req.body ?? {}) as { username?: unknown; password?: unknown };
  accounts.login(String(body.username ?? ''), String(body.password ?? ''))
    .then((result) => {
      if (result.ok) res.json({ username: result.username });
      else res.status(result.code).json({ error: result.error });
    })
    .catch((err: unknown) => {
      console.error('[auth/login]', err);
      res.status(500).json({ error: 'Internal server error' });
    });
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

async function boot(): Promise<void> {
  await Promise.all([leaderboard.load(), accounts.load()]);
  httpServer.listen(port, () => {
    console.log(`[Colyseus] Listening on ws://localhost:${port}`);
  });
}

void boot();
