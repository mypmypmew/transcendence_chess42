# Backend

Express backend for the chess application. The current implementation provides
the health-check endpoint, the Prisma/SQLite persistence layer, database
migrations, and repository functions. Authentication and feature routes are not
implemented yet.

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
├── index.js                         Express entry point
├── prisma/
│   ├── schema.prisma                Database schema
│   └── migrations/                  Committed SQL migration history
└── src/
    ├── db/
    │   └── prisma.js                Shared PrismaClient instance
    └── repositories/
        ├── userRepository.js        User persistence operations
        ├── friendshipRepository.js  Friendship persistence operations
        └── gameRepository.js        Game persistence operations
```

## NPM scripts

Run scripts inside the backend container unless you intentionally maintain a
compatible local Node.js environment.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Apply committed migrations and start the server with Nodemon |
| `npm start` | Apply committed migrations and start the server with Node.js |
| `npm run db:deploy` | Apply pending committed migrations |
| `npm run postinstall` | Generate Prisma Client; npm runs this automatically after install |

The Docker image uses Node.js 20 and `npm ci`, so dependency versions come from
`package-lock.json`.

### Adding a dependency

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
- New users receive a default rating of `1200`.
- `createdAt` and `updatedAt` are maintained automatically.

The repository does not hash passwords. Authentication code must hash and
validate passwords before calling `createUser`. API responses must never expose
`passwordHash`.

### Friendship

A friendship links two users through `userAId` and `userBId`.

- Both IDs must be positive integers belonging to existing users.
- A user cannot be friends with themselves.
- The repository stores the smaller ID as `userAId` and the larger ID as
  `userBId`.
- The composite unique constraint prevents duplicate canonical pairs.
- Deleting a user deletes their friendship records.

Always create or find friendships through `friendshipRepository`; bypassing its
normalization could produce reversed duplicate pairs.

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

New games start as `IN_PROGRESS`. White and black must be different users.
`finishGame` derives `winnerId` from the result instead of accepting an
arbitrary winner. A draw has `winnerId = null`. The optional `pgn` field stores
the move history in Portable Game Notation.

## Repository API

Repositories contain database access only. HTTP parsing, authorization,
business workflows, and mapping Prisma errors to HTTP responses belong in
future service/middleware/route layers.

### User repository

```js
findUserByEmail(email)
createUser({ email, username, passwordHash })
```

`findUserByEmail` returns a user or `null`. `createUser` leaves the initial
rating to the database default.

### Friendship repository

```js
findFriendship(firstUserId, secondUserId)
createFriendship(firstUserId, secondUserId)
```

Both functions accept IDs in either order and normalize the pair internally.

### Game repository

```js
findGameById(gameId)
createGame({ whiteId, blackId })
finishGame(gameId, { result, pgn })
```

`finishGame` accepts `GameResult.WHITE_WIN`, `GameResult.BLACK_WIN`, or
`GameResult.DRAW` from `@prisma/client`. Only an in-progress game can be
finished.

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

## Current boundaries and follow-up work

The following are deliberately outside the current persistence task:

- registration and login routes;
- bcrypt password hashing and comparison;
- server-side sessions and protected-route middleware;
- friends, profile, leaderboard, and game HTTP APIs;
- frontend API integration;
- automated repository and API tests.

Track these as separate issues and document request/response contracts in each
issue before frontend and backend implementation diverge.
