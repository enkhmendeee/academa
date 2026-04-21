# Academa

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-orange.svg)](https://www.prisma.io/)

**Live in production** — frontend at [academa-kei.vercel.app](https://academa-kei.vercel.app), API at [academaa.fly.dev](https://academaa.fly.dev).

Students juggle four to six courses per semester, each with its own stream of homework, exams, and grading deadlines. The default tools — a spreadsheet per term, sticky notes on a monitor, or a mental model that collapses by week four — don't survive contact with a real workload. Deadlines slip, grades get lost, and it's almost impossible to see at a glance where the semester actually stands.

Academa is a web app that collapses that sprawl into one dashboard. Create semesters, add courses, and track every homework and exam through its lifecycle (`PENDING` → `IN_PROGRESS` → `COMPLETED` → `OVERDUE`). The courses view charts homework distribution per course; the dashboard shows upcoming deadlines alongside a monthly calendar. Filtering, color coding, and per-course progress bars make it easy to zoom in on what's next.

![Dashboard](./docs/images/dashboard.png)

## Tech stack

- **Frontend** — React 18 + TypeScript, Ant Design, ApexCharts, React Router, Axios. Deployed to Vercel.
- **Backend** — Node 18 + Express (TypeScript), Prisma ORM, JSON Web Tokens, `express-rate-limit`. Deployed to Fly.io (`sjc`) on a `shared-cpu-1x` / 256 MB VM.
- **Database** — PostgreSQL on Supabase, reached through their pgBouncer pooler.
- **Tests** — Jest + Supertest hitting a real Postgres container for integration coverage (register/login happy paths + error cases, plus cross-user ownership enforcement on `/api/homeworks`).

## Features

- Multiple academic semesters, with a default semester for quick access.
- Courses with custom names, descriptions, and color coding; per-course progress bars roll up homework completion in real time.
- Homework and exam records with status, due date, grade, and (for exams) location, type, and duration fields.
- Pie + bar charts for homework distribution and completion status across courses; monthly calendar overlay on the dashboard.
- Status-aware filtering and sorting by status, course, semester, due date, or grade; hide completed assignments to focus on what's pending.
- JWT auth with rate-limited `register`/`login` endpoints and per-user data isolation enforced on every query.

![Courses](./docs/images/courses.png)
![Homeworks](./docs/images/homeworks.png)

## Deployment story

This project's strongest engineering narrative lives in the move from Render to Fly.io.

The backend originally ran on Render's free tier, which spins down between requests — fine for a demo, brutal for anyone actually trying to use the app because of the cold-start penalty. Upgrading to an always-on Render instance plus the bits I'd need for a serious deployment (migration worker, small staging environment) brought the default cost estimate to roughly **$38/mo**. Migrating to Fly.io brought that to **$0**:

- **Custom `Dockerfile`** — multi-step build on `node:18-alpine`. Installs dev deps, compiles TypeScript, trims back to production deps, drops root, and wraps the process in `dumb-init` for clean signal handling. Small enough to sit inside the free-tier image allowance with no tricks.
- **Rightsized VM** — `shared-cpu-1x` with 256 MB RAM is enough for this workload. `auto_stop_machines = "suspend"` plus `min_machines_running = 0` means the app suspends when idle and wakes on the next request, so I pay nothing for time nobody's using.
- **Auto-migrations on deploy** — `release_command = 'npx prisma migrate deploy'` in `fly.toml` runs the migration step ahead of each release, so schema and code ship together and there's no manual migration dance.
- **Supabase pgBouncer fix** — Prisma + Supabase's pooler throws *"prepared statement already exists"* errors once more than one instance is in play, because pgBouncer in transaction mode doesn't keep a stable session per connection. Appending `?pgbouncer=true&connection_limit=1` to `DATABASE_URL` tells Prisma to disable prepared statements and hold a single pooled connection, which unblocks horizontal scaling without standing up a dedicated pool. Wiring lives in `server/src/config/prisma.ts`.

The frontend stays on Vercel, which remains free for hobby use and gives per-PR preview deployments for free.

## Getting started

### Prerequisites

- Node 18+
- PostgreSQL 13+ (Supabase for production; any local Postgres works for dev)
- Docker, if you want to run the integration test suite

### Install

```bash
git clone https://github.com/enkhmendeee/academa.git
cd academa
(cd server && npm install)
(cd client && npm install)
```

### Environment

Create `server/.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@db.YOUR_HASH.supabase.co:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1
JWT_SECRET=replace-me
PORT=3000
```

Create `client/.env`:

```env
REACT_APP_API_URL=http://localhost:3000/api
```

### Database

```bash
cd server
npx prisma migrate dev
```

### Run

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm start
```

Frontend at `http://localhost:3001`, API at `http://localhost:3000`.

### Tests

Integration tests hit a real Postgres in Docker:

```bash
docker run -d --name academa-test-db \
  -e POSTGRES_PASSWORD=test -e POSTGRES_USER=test -e POSTGRES_DB=academa_test \
  -p 5433:5432 postgres:16
```

Create `server/.env.test`:

```env
DATABASE_URL=postgresql://test:test@localhost:5433/academa_test
DIRECT_URL=postgresql://test:test@localhost:5433/academa_test
JWT_SECRET=test-secret
NODE_ENV=test
```

Then:

```bash
cd server
DATABASE_URL=postgresql://test:test@localhost:5433/academa_test \
DIRECT_URL=postgresql://test:test@localhost:5433/academa_test \
  npx prisma db push --skip-generate
npm test
```

## API

All routes under `/api/*` are rate-limited (100 req/min/IP). `/api/auth/login` and `/api/auth/register` carry an additional strict limiter (5 req / 15 min / IP). Every resource route is JWT-gated and scoped to the authenticated user.

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `PATCH /api/auth/profile`

### Resources (same verb pattern per entity)
- `GET`/`POST`/`PATCH`/`DELETE` on `/api/courses`, `/api/homeworks`, `/api/exams`
- `/api/semesters` uses the name as the delete key: `DELETE /api/semesters/:name`

## Project layout

```
academa/
├── client/                 # React frontend
│   └── src/{components,context,hooks,pages,services,utils}
├── server/                 # Express + Prisma backend
│   ├── src/{controllers,middleware,routes,config,__tests__}
│   └── prisma/
└── docs/images/            # README screenshots
```

## Scripts

- **Server** — `npm run dev | build | start | test | db:push | db:migrate | db:reset`
- **Client** — `npm start | build | test`

## License

MIT — see [LICENSE](LICENSE).

## Support

For support, email `nergui.eegii04@gmail.com` or open an issue on GitHub.
