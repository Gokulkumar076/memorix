# Memorix — Personalized Spaced Repetition Study Engine

A production-ready learning platform that uses the **FSRS (Free Spaced Repetition Scheduler) algorithm**
to generate a personalized review schedule for every flashcard, based on each user's actual memory
performance — not fixed Anki-style intervals.

![Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Stack](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Stack](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)
![Stack](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)

---

## ✨ Features

- **FSRS v4.5 scheduling engine** — implemented from scratch in `backend/app/services/fsrs.py`, modeling per-card stability and difficulty
- **Four card types** — Basic, Cloze deletion, Image, Multiple choice
- **Study sessions** — flip-card UI with Again / Hard / Good / Easy ratings and live interval previews
- **Offline-first** — IndexedDB (via Dexie) caches decks/cards and queues reviews when offline; auto-syncs on reconnect
- **Analytics dashboard** — retention curves, review-volume charts, GitHub-style activity heatmap, per-deck performance
- **Gamification** — XP, levels, daily streaks
- **AI-generated flashcards** — describe a topic, get a full deck via Anthropic's API
- **Anki import/export** — `.apkg` and CSV
- **Collaborative decks** — share decks with other users as viewer/editor
- **JWT auth** with refresh-token rotation
- **Dark mode** glassmorphism UI, 3D onboarding (React Three Fiber), Framer Motion micro-interactions
- **Mobile-responsive**, installable as a PWA

---

## 🏗 Architecture

```
memorix/
├── backend/                 FastAPI + SQLAlchemy (async) + PostgreSQL
│   ├── app/
│   │   ├── api/routes/      auth, users, decks, cards, reviews, analytics, ai, import_export
│   │   ├── core/            config, JWT/security
│   │   ├── db/               session, declarative base
│   │   ├── models/           SQLAlchemy ORM models
│   │   ├── schemas/          Pydantic request/response schemas
│   │   └── services/         business logic (fsrs.py is the scheduling core)
│   ├── alembic/              DB migrations
│   ├── tests/                pytest suite (auth, decks/cards, FSRS algorithm)
│   └── scripts/seed.py       demo data seeding
│
├── frontend/                 React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── api/               axios client + per-resource API modules
│   │   ├── components/        ui/, deck/, cards/, review/, dashboard/, analytics/, onboarding/
│   │   ├── hooks/              React Query hooks (useAuth, useDecks, useCards, useReviews, …)
│   │   ├── stores/              Zustand stores (auth, UI prefs, study session)
│   │   ├── lib/db.ts            Dexie/IndexedDB offline layer
│   │   └── pages/                route-level pages
│   └── vite.config.ts           PWA + manual chunking for 3D/chart vendor bundles
│
├── docker-compose.yml         local dev stack (hot reload)
├── docker-compose.prod.yml    production stack (nginx reverse proxy + built images)
└── .github/workflows/ci.yml   CI: backend tests, frontend tests, docker builds
```

### Why FSRS?

Traditional SRS tools (Anki's SM-2) use a single global ease factor per card. FSRS instead fits two
per-card parameters — **stability** (days until retrievability drops to ~90%) and **difficulty** — and
updates them after every review using a forgetting-curve model. The implementation in
`backend/app/services/fsrs.py` covers the full new → learning → review → relearning state machine,
including lapse handling and per-rating scheduling previews (used to show "1d / 3d / 6d / 2w" under
each rating button in the study UI).

---

## 🚀 Quick start (Docker — recommended)

```bash
git clone <repo-url> memorix && cd memorix
cp .env.example .env        # fill in SECRET_KEY and (optionally) ANTHROPIC_API_KEY
make dev                    # builds and starts db, redis, backend, frontend
```

- Frontend: http://localhost:5173
- Backend docs (Swagger): http://localhost:8000/docs
- Health check: http://localhost:8000/health

Seed demo data (user `demo@memorix.app` / `demo12345`, 3 sample decks):

```bash
make seed
```

---

## 🛠 Local development (without Docker)

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Point at a local Postgres, or use SQLite for quick testing:
export DATABASE_URL="sqlite+aiosqlite:///./dev.db"
export SECRET_KEY="dev-secret-change-me"

uvicorn app.main:app --reload --port 8000
```

Run tests:

```bash
pytest tests/ -v
```

### Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

Run tests:

```bash
npx vitest run        # unit tests
npx tsc -b             # type check
npm run build          # production build
```

---

## 🗄 Database migrations (Alembic)

```bash
cd backend
alembic revision --autogenerate -m "add new field"
alembic upgrade head
```

In Docker: `make migrate-create m="add new field"` / `make migrate`.

---

## 🔐 Environment variables

See `.env.example` at the project root. Key variables:

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | JWT signing secret — **must** be changed for production |
| `DATABASE_URL` | Postgres connection string (async driver: `postgresql+asyncpg://`) |
| `ANTHROPIC_API_KEY` | Enables the AI flashcard generator; omit to disable that feature gracefully |
| `ALLOWED_ORIGINS` | CORS allow-list for the frontend origin(s) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` / `REFRESH_TOKEN_EXPIRE_DAYS` | JWT lifetimes |

---

## 📦 Production deployment

```bash
cp .env.example .env   # set real SECRET_KEY, POSTGRES_PASSWORD, ANTHROPIC_API_KEY
make prod
```

This builds the frontend as static assets served by nginx, runs the backend behind 4 uvicorn workers,
applies migrations automatically on container start, and fronts everything with an nginx reverse proxy
(`docker/nginx-proxy.conf`) that routes `/api/*` to the backend and everything else to the static frontend.

For HTTPS, drop certs into `docker/certs/` and extend `nginx-proxy.conf` with a `listen 443 ssl` block.

---

## 🧪 Testing summary

- **Backend**: 18 pytest tests covering auth flows, deck/card CRUD with access control, and the FSRS
  algorithm's state transitions (new→learning→review, lapse handling, difficulty bounds, rating previews).
- **Frontend**: Vitest + Testing Library covering UI primitives and utility functions; full TypeScript
  strict-mode compilation with zero errors.
- **CI**: GitHub Actions runs both suites plus a Docker build check on every push/PR.

---

## 📄 License

MIT
