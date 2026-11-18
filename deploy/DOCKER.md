# Mangos en Docker

Stack completo con Docker Compose:

| Servicio | Contenedor | URL |
|---|---|---|
| front-web (nginx) | `mangos-web` | http://localhost:8080 |
| api-gastos (NestJS) | `mangos-api` | http://localhost:3000 |
| servicio-ia (Fastify) | `mangos-ia` | http://localhost:3002/health |
| bot-telegram | `mangos-bot` | — (polling) |
| postgres | `mangos-postgres` | solo red interna (`postgres:5432`) |
| ollama (opcional) | `mangos-ollama` | http://localhost:11434 |

## Requisitos

- Docker Engine + Docker Compose v2.
- Los `.env` de cada repo con sus secretos:

```bash
# api-gastos/.env
JWT_SECRET=...                 # obligatorio

# bot-telegram/.env
TELEGRAM_BOT_TOKEN=...         # obligatorio

# servicio-ia/.env
AI_PROVIDER=openrouter         # o ollama
OPENROUTER_API_KEY=...         # si usás openrouter
```

Si falta alguno, copiá el `.env.example` de ese repo y completalo. **No se
commitea ningún `.env`.**

## Levantar todo

```bash
# Desde api-gastos/deploy
cd api-gastos/deploy

# Opcional: cambiar puertos/URLs
cp .env.docker.example .env

docker compose up --build -d
docker compose ps
```

El servicio `migrate` corre **una sola vez**: aplica `prisma migrate deploy` y
ejecuta el seed de categorías por defecto. La API espera a que termine bien.

## URLs

- Front: http://localhost:8080
- API: http://localhost:3000
- IA: http://localhost:3002/health
- Postgres: solo dentro de la red de Compose (`postgres:5432`). Para entrar:
  `docker compose exec postgres psql -U postgres -d gestor_de_gastos_db`

## Comandos útiles

```bash
# Logs
docker compose logs -f api-gastos
docker compose logs -f servicio-ia
docker compose logs -f bot-telegram

# Re-aplicar migraciones + seed
docker compose run --rm migrate

# Reconstruir un servicio después de cambiar código
docker compose up --build -d api-gastos

# Bajar todo (conserva la base)
docker compose down

# Bajar todo y borrar la base
docker compose down -v
```

## Front y URL de la API

El front se compila con `VITE_API_URL` (por defecto `http://localhost:3000`).
Si cambiás la URL pública de la API, editá `VITE_API_URL` y reconstruí:

```bash
docker compose up --build -d front-web
```

## Ollama (IA local, opcional)

1. En `servicio-ia/.env` poné `AI_PROVIDER=ollama`.
2. Levantá el perfil:

```bash
docker compose --profile ollama up -d --build
docker compose exec ollama ollama pull llama3.2-vision
```

El `servicio-ia` usa `OLLAMA_HOST=http://ollama:11434` por defecto dentro de la
red de Compose.

## Notas

- La base vive en el volumen `mangos_postgres_data`; `down -v` la borra.
- Los secretos se leen con `env_file` desde los `.env` de cada repo; el compose
  solo sobreescribe las URLs internas (`api-gastos:3000`, `servicio-ia:3002`).
- Si el puerto 3000, 3002 o 8080 está ocupado, cambialo en el `.env` de la raíz
  (`API_PORT`, `IA_PORT`, `WEB_PORT`). Postgres no se publica al host: queda solo
  en la red interna de Compose.
