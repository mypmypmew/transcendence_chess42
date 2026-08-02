# Chess Project

## Launch

Docker must be installed.

```bash
git clone <repo-url>
cd <project-folder>
cp backend/.env.example backend/.env
docker compose up --build
```

Open in a browser:

- Frontend: http://localhost:5173
- Backend health-check: http://localhost:3000/api/health

Backend documentation: [backend/README.md](backend/README.md)

## Stop

`Ctrl+C` in the terminal, or `docker compose down` from the project root.
