import { createServer } from 'http';
import express from 'express';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { GameRoom } from './rooms/GameRoom';
import { leaderboardInstance } from './leaderboard/Leaderboard';
import { accountStoreInstance } from './auth/AccountStore';
import { customLevelStoreInstance } from './admin/CustomLevelStore';
import { ALL_PACKS, SERVER_PORT, validateAllPacks, type LevelData } from '@pikopark/shared';

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

// Admin routes (level editor). Re-verifies username+password on every call —
// there are no session tokens. Cached password lives in the client's
// localStorage. Threat model: casual impersonation, not hardened attack.
app.use('/admin', (_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.options('/admin/levels', (_req, res) => { res.sendStatus(204); });
app.options('/admin/levels/*', (_req, res) => { res.sendStatus(204); });

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0', built: new Date().toISOString() });
});

const leaderboard = leaderboardInstance();
const accounts = accountStoreInstance();
const customLevels = customLevelStoreInstance();

/**
 * Extract and verify admin credentials from either a POST body or the
 * `x-auth-*` headers (used on GET/DELETE where a body is awkward). Resolves
 * to `{ ok: true, username }` or `{ ok: false, code, error }`.
 */
async function requireAdmin(
  req: express.Request,
): Promise<{ ok: true; username: string } | { ok: false; code: number; error: string }> {
  const body = (req.body ?? {}) as { username?: unknown; password?: unknown };
  const headerUser = req.header('x-auth-username');
  const headerPass = req.header('x-auth-password');
  const username = typeof body.username === 'string' ? body.username
    : typeof headerUser === 'string' ? headerUser : '';
  const password = typeof body.password === 'string' ? body.password
    : typeof headerPass === 'string' ? headerPass : '';
  const result = await accounts.verify(username, password);
  if (!result.ok) return result;
  if (result.role !== 'admin') {
    return { ok: false, code: 403, error: 'Admin access required' };
  }
  return { ok: true, username };
}

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
      if (result.ok) res.json({ username: result.username, role: result.role });
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
      if (result.ok) res.json({ username: result.username, role: result.role });
      else res.status(result.code).json({ error: result.error });
    })
    .catch((err: unknown) => {
      console.error('[auth/login]', err);
      res.status(500).json({ error: 'Internal server error' });
    });
});

app.get('/admin/levels', (req, res) => {
  requireAdmin(req)
    .then((auth) => {
      if (!auth.ok) { res.status(auth.code).json({ error: auth.error }); return; }
      res.json({ levels: customLevels.listByAuthor(auth.username) });
    })
    .catch((err: unknown) => {
      console.error('[admin/levels:get]', err);
      res.status(500).json({ error: 'Internal server error' });
    });
});

app.post('/admin/levels', (req, res) => {
  requireAdmin(req)
    .then(async (auth) => {
      if (!auth.ok) { res.status(auth.code).json({ error: auth.error }); return; }
      const body = (req.body ?? {}) as { level?: unknown };
      if (typeof body.level !== 'object' || body.level === null) {
        res.status(400).json({ error: 'Missing "level" payload' });
        return;
      }
      const result = await customLevels.save(auth.username, body.level as LevelData);
      if (result.ok) res.json({ level: result.level });
      else res.status(result.code).json({ error: result.error });
    })
    .catch((err: unknown) => {
      console.error('[admin/levels:post]', err);
      res.status(500).json({ error: 'Internal server error' });
    });
});

app.delete('/admin/levels/:slug', (req, res) => {
  requireAdmin(req)
    .then(async (auth) => {
      if (!auth.ok) { res.status(auth.code).json({ error: auth.error }); return; }
      const slug = String(req.params['slug'] ?? '');
      const deleted = await customLevels.delete(auth.username, slug);
      if (deleted) res.json({ ok: true });
      else res.status(404).json({ error: 'Level not found' });
    })
    .catch((err: unknown) => {
      console.error('[admin/levels:delete]', err);
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

/**
 * Render's free tier has ephemeral disk — accounts.json is wiped on every
 * redeploy. If `ADMIN_BOOTSTRAP_USER` + `ADMIN_BOOTSTRAP_PASS` are set, we
 * upsert that account on startup so the admin login always works after a
 * fresh deploy. Paired with `ADMIN_USERNAMES` to get the admin role.
 */
async function bootstrapAdmin(): Promise<void> {
  const user = process.env['ADMIN_BOOTSTRAP_USER'];
  const pass = process.env['ADMIN_BOOTSTRAP_PASS'];
  if (!user || !pass) return;
  const result = await accounts.upsert(user, pass);
  if (result.ok) {
    console.log(`[bootstrap] admin account "${result.username}" ready (role=${result.role})`);
  } else {
    console.error(`[bootstrap] admin upsert failed: ${result.error}`);
  }
}

async function boot(): Promise<void> {
  await Promise.all([leaderboard.load(), accounts.load(), customLevels.load()]);
  await bootstrapAdmin();
  httpServer.listen(port, () => {
    console.log(`[Colyseus] Listening on ws://localhost:${port}`);
  });
}

void boot();
