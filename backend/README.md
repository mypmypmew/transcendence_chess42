# Backend

Express 5 and Socket.IO backend for ChessMate. It provides session-based authentication, user profiles and avatars, friendships and online presence, persistent one-to-one chat, matchmaking, authoritative multiplayer chess, game history, points, and a leaderboard. Application data is persisted through Prisma and SQLite, while active games, matchmaking, presence, and disconnect timers are managed in memory.

## Quick start

Run these commands from the repository root:

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

The backend is available at <http://localhost:3000>. Verify it with:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{"status":"ok"}
```

Stop the project with `Ctrl+C`, or run:

```bash
docker compose down
```

## Socket.IO manual verification

### Launch:
```
docker compose up -d --build --force-recreate backend
```

### health-check:
```
curl http://localhost:3000/api/health
```
expd: {"status":"ok"}

### Socket.IO authentication

Sockets require a valid session.

Without a session, the handshake is rejected:
    
    docker compose exec backend node scripts/socketSmokeClient.js

expd: `Connection failed: Unauthorized`

Obtain a session cookie:

    curl -s -c jar.txt -X POST http://localhost:3000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"<email>","password":"<password>"}' > /dev/null

The `sid` value is the last field in `jar.txt`.

Connect with that session:

    docker compose exec -e SID=<sid value> backend node scripts/socketSmokeClient.js

expd: client receives `server:pong`; server logs `Socket connected: <id> (user <userId>)`

Delete `jar.txt` afterwards — it contains a live session token.

## Profile and avatar manual verification

Log in and keep the session cookie:

    curl -s -c jar.txt -X POST http://localhost:3000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"<email>","password":"<password>"}'

Update username and email (`PATCH /api/users/me`):

    curl -s -b jar.txt -X PATCH http://localhost:3000/api/users/me \
      -H "Content-Type: application/json" \
      -d '{"username":"<new username>","email":"<new email>"}'

expd: `200` with the updated user; `400` for invalid values; `409` when the
username or email belongs to another account.

Upload an avatar (`POST /api/users/me/avatar`, form field `avatar`, PNG, JPEG
or WebP, 2 MB maximum):

    curl -s -b jar.txt -X POST http://localhost:3000/api/users/me/avatar \
      -F avatar=@<image file>

expd: `200` with `avatar` set to `/uploads/avatars/<file>`; `400` for a missing,
oversized or unsupported file. The previous avatar file is deleted.

Open `http://localhost:3000<avatar path>` in the browser to view the image.

Delete `jar.txt` afterwards.

Avatars are stored under `backend/uploads/avatars`. Development mounts that
folder from the host; production uses the `backend_uploads` Docker volume. Set
`UPLOADS_DIR` to store them elsewhere.

## Environment

The local configuration is stored in `backend/.env`:

```env
DATABASE_URL="file:./dev.db"
```

Create it from `.env.example`. Do not commit `.env` or any SQLite database
files. The local database is created at `backend/prisma/dev.db`.

## Project structure

```text
backend/
├── index.js                 Express, HTTP, and Socket.IO entry point
├── prisma/
│   ├── schema.prisma        Database schema
│   └── migrations/          Committed SQL migration history
├── scripts/
│   ├── chatSmokeClient.js
│   ├── recalculatePoints.js
│   └── socketSmokeClient.js
├── src/
│   ├── db/                  Shared Prisma Client
│   ├── middlewares/         HTTP and Socket.IO authentication
│   ├── repositories/        Prisma database operations
│   ├── routes/              Express REST endpoints
│   ├── services/            Business and application logic
│   ├── socket/              Game and matchmaking handlers
│   ├── sockets/             Chat and presence handlers
│   └── validators/          Input validation
├── test/                    Unit and integration tests
└── uploads/avatars/         Development avatar storage
```

## Socket.IO

Socket.IO shares the backend's Node.js HTTP server and requires a valid database-backed session during the connection handshake. The authenticated user is stored in `socket.data`, so realtime handlers never trust a client-provided user ID.

The realtime layer provides:

- personal `user:<id>` rooms for matchmaking, presence, chat notifications, and game connection status;
- `conversation:<id>` rooms for persistent one-to-one chat;
- `game:<id>` rooms for authoritative chess-state broadcasts;
- matchmaking, reconnect handling, presence tracking with a 5-second offline grace period, and automatic forfeiture after a further 30-second game disconnect timeout.

The ping/pong smoke client can be used to verify authenticated Socket.IO connectivity.

## REST API

User, friendship, conversation, and game endpoints require a valid `sid` session cookie. Authentication endpoints and the health check do not pass through `requireAuth`; `GET /api/auth/me` returns `null` when no valid session exists.

| Area | Endpoints |
| --- | --- |
| Health | `GET /api/health` |
| Authentication | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Users | `GET /api/users`, `PATCH /api/users/me`, `POST /api/users/me/avatar` |
| Leaderboard and history | `GET /api/users/leaderboard`, `GET /api/users/:userId/games` |
| Friend requests | `GET/POST /api/friend-requests`, `POST /api/friend-requests/:requestId/accept`, `DELETE /api/friend-requests/:requestId` |
| Friends | `GET /api/friends`, `DELETE /api/friends/:friendUserId` |
| Conversations | `GET/POST /api/conversations`, `GET /api/conversations/:conversationId/messages` |
| Games | `GET /api/games`, `GET /api/games/active`, `GET /api/games/:gameId` |

## NPM scripts

Run scripts inside the backend container unless you intentionally maintain a
compatible local Node.js environment.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Apply committed migrations and start the server with Nodemon |
| `npm start` | Apply committed migrations and start the server with Node.js |
| `npm test` | Run the backend unit and integration test suite |
| `npm run db:deploy` | Apply pending committed migrations |
| `npm run postinstall` | Generate Prisma Client; npm runs this automatically after install |
| `npm run socket:check` | Connect to Socket.IO, verify ping/pong, and disconnect |

The Docker image uses Node.js 22 and `npm ci`, so dependency versions come from
`package-lock.json`.

## Tests

Run the complete backend test suite from the repository root:

```bash
docker compose run --rm backend npm test
```

The suite covers authentication, sessions, repositories, services, REST routes, Socket.IO handlers, presence, matchmaking, multiplayer game flows, points transactions, migrations, and integration scenarios.

## Points recalculation

Preview points calculated from completed game history without changing the database:

```bash
docker compose run --rm backend node scripts/recalculatePoints.js
```

To apply the recalculated totals, stop the backend first and run:

```bash
docker compose stop backend
docker compose run --rm backend node scripts/recalculatePoints.js --apply
```

Apply mode is rejected while the database contains an `IN_PROGRESS` game.

## Adding a dependency

The Compose development service intentionally does not mount the whole backend
directory or `node_modules`. To update the host `package.json` and
`package-lock.json` with the container's Node.js version, run from the repository
root:

```bash
docker compose run --rm \
  --volume ./backend/package.json:/app/package.json \
  --volume ./backend/package-lock.json:/app/package-lock.json \
  backend npm install <package>
```

Use `npm install --save-dev <package>` for a development-only dependency. Then
rebuild the backend image before using the new package:

```bash
docker compose build backend
```

## Prisma Client rule

`PrismaClient` must be instantiated only in `src/db/prisma.js`:

```js
const prisma = require('../db/prisma');
```

Do not call `new PrismaClient()` in routes, services, or repositories. CommonJS
caches the exported instance, allowing the application to reuse one client.
Do not disconnect Prisma after every HTTP request. Disconnect only when a
short-lived script finishes or when the server shuts down.

## Data models

### User

- `email` and `username` are unique.
- `passwordHash` stores a password hash, never a plaintext password.
- New users start with `0` points.
- A win awards `100` points; a draw awards `30` points to each player.
- `createdAt` and `updatedAt` are maintained automatically.

The repository does not hash passwords. Authentication code must hash and
validate passwords before calling `createUser`. API responses must never expose
`passwordHash`.

### Friendship

A friendship record represents both a pending friend request and an accepted friendship.

- `userAId` and `userBId` store the canonical pair with the smaller ID first.
- `requestedById` identifies the user who sent the request.
- `status` is either `PENDING` or `ACCEPTED`.
- A user cannot create a friendship with themselves.
- The composite unique constraint on `(userAId, userBId)` prevents duplicate or reversed pairs.
- Deleting either user cascades to the friendship record.

Always create or find friendships through `friendshipRepository`; bypassing its normalization could produce reversed duplicate pairs.

### Session

Sessions are stored in the database and linked to one user.

- The random session ID is stored in the `sid` HTTP-only cookie.
- Sessions expire after seven days.
- Expired sessions are rejected and removed when accessed.
- Deleting a user cascades to their sessions.

### Conversation and Message

A conversation stores a canonical pair of participants and is unique on `(userAId, userBId)`.

Messages belong to a conversation and a sender. Chat history is persisted in SQLite, while Socket.IO delivers newly created messages to connected participants in real time. Deleting a conversation cascades to its messages.

### Game

A game references the white player, black player, and optional winner.

Statuses:

- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

Results:

- `WHITE_WIN`
- `BLACK_WIN`
- `DRAW`

Matchmaking creates the database record before the active game is placed in memory. The current position and ordinary moves remain in backend memory and are validated with `chess.js`.

When a game finishes, `gameRepository.finishGame` transactionally stores the result and PGN and awards points exactly once. A win awards `100` points to the winner, while a draw awards `30` points to each player.

If a player remains disconnected beyond the reconnect timeout, the game is completed as a resignation. If the backend restarts and loses its in-memory game state, remaining `IN_PROGRESS` records are marked as `CANCELLED`.

## Application layers

The backend follows a route-service-repository structure:

- `middlewares/` authenticates HTTP and Socket.IO requests;
- `routes/` reads HTTP input and builds HTTP responses;
- `validators/` validates and normalizes input values;
- `services/` implements business rules and coordinates workflows;
- `repositories/` performs Prisma database operations;
- `db/prisma.js` exports the shared Prisma Client instance.

Repositories contain database access only. HTTP parsing, authorization decisions, response formatting, and business workflows belong to the route, middleware, and service layers.

### Repository responsibilities

| Repository | Responsibility |
| --- | --- |
| `userRepository` | Users, public user search, profile updates, and leaderboard queries |
| `sessionRepository` | Persistent login sessions |
| `friendshipRepository` | Canonical user pairs, friend requests, and accepted friendships |
| `chatRepository` | Conversations and persisted messages |
| `gameRepository` | Game records, history, transactional completion, points, and restart cancellation |

## Migration workflow

Never edit an already shared migration to represent a new schema change. Create
a new migration instead.

1. Edit `prisma/schema.prisma`.
2. Format and validate the schema:

   ```bash
   docker compose run --rm backend npx prisma format
   docker compose run --rm backend npx prisma validate
   ```

3. Create and apply a development migration:

   ```bash
   docker compose run --rm backend npx prisma migrate dev --name <migration_name>
   ```

4. Review the generated `migration.sql`.
5. Commit both `schema.prisma` and the new migration directory.
6. Do not commit `dev.db`.
7. Rebuild the backend image so its generated Prisma Client matches the schema:

   ```bash
   docker compose up -d --build --force-recreate backend
   ```

Container startup runs `prisma migrate deploy`. This command only applies
existing committed migrations; it does not create new migration files.

## Prisma Studio

Start the visual database browser from the repository root:

```bash
docker compose run --rm -p 5555:5555 backend \
  npx prisma studio --hostname 0.0.0.0 --port 5555
```

Open <http://localhost:5555> and stop Studio with `Ctrl+C`.

## Docker development notes

The Compose service mounts `index.js`, `src`, and `prisma` into the container so
Nodemon sees source changes while dependencies continue to come from the built
image. After changing dependencies, rebuild and recreate the backend:

```bash
docker compose up -d --build --force-recreate backend
```

Do not add an anonymous `/app/node_modules` mount to the backend service. A
persisted old dependency volume can hide the dependencies generated in a newer
image.
