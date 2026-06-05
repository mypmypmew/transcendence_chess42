 # Chess Project

## Запуск

Требуется установленный Docker.

```bash
git clone <url-репозитория>
cd <папка-проекта>
docker compose up --build
```

Открыть в браузере:
- Frontend: http://localhost:5173
- Backend health-check: http://localhost:3000/api/health

## Остановка

\`Ctrl+C\` в терминале, либо \`docker compose down\` из корня проекта.
